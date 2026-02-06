import type { IGitRepository, IGitStats, IPackageInfo } from "../../application/interface/git-repository.interface";

import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { RepositoryInfo } from "../../domain/entity/repository-info.entity";
import { SECOND_ELEMENT_INDEX } from "../constant/logo-generator.constant";

const execAsync: (command: string) => Promise<{ stderr: string; stdout: string }> = promisify(exec);

interface IPackageJson {
	author?: { email?: string; name?: string; url?: string } | string;
	bin?: Record<string, string> | string;
	bugs?: { url?: string } | string;
	dependencies?: Record<string, string>;
	description?: string;
	devDependencies?: Record<string, string>;
	engines?: Record<string, string>;
	homepage?: string;
	keywords?: Array<string>;
	license?: string;
	peerDependencies?: Record<string, string>;
	repository?: { type?: string; url?: string } | string;
	scripts?: Record<string, string>;
	version?: string;
}

/**
 * Git repository implementation
 */
export class GitRepositoryService implements IGitRepository {
	/**
	 * Get extended package.json information
	 * @param {string} [projectPath] - Optional path to project directory
	 * @returns {Promise<IPackageInfo>} Promise resolving to extended package info
	 */
	async getExtendedPackageInfo(projectPath?: string): Promise<IPackageInfo> {
		const result: IPackageInfo = {};

		try {
			const packageJsonPath: string = projectPath ? path.join(projectPath, "package.json") : "package.json";
			const packageJson: string = await fs.readFile(packageJsonPath, "utf8");
			const packageData: IPackageJson = JSON.parse(packageJson) as IPackageJson;

			result.version = packageData.version;
			result.license = packageData.license;
			result.keywords = packageData.keywords;
			result.engines = packageData.engines;
			result.scripts = packageData.scripts;
			result.homepage = packageData.homepage;
			result.bin = packageData.bin;
			result.peerDependencies = packageData.peerDependencies;

			if (packageData.bugs) {
				result.bugs = typeof packageData.bugs === "string" ? packageData.bugs : packageData.bugs.url;
			}
		} catch {
			// Return empty info if package.json is not available
		}

		return result;
	}

	/**
	 * Get git history statistics
	 * @returns {Promise<IGitStats>} Promise resolving to git statistics
	 */
	async getGitStats(): Promise<IGitStats> {
		const stats: IGitStats = {
			branchCount: 0,
			commitCount: 0,
			contributors: [],
			tags: [],
		};

		try {
			// Get total commit count
			try {
				const { stdout: commitCount }: { stdout: string } = await execAsync("git rev-list --count HEAD");
				stats.commitCount = Number.parseInt(commitCount.trim(), 10) || 0;
			} catch {
				// Ignore
			}

			// Get contributors with commit counts
			try {
				const { stdout: shortlog }: { stdout: string } = await execAsync("git shortlog -sne --all");
				const lines: Array<string> = shortlog.trim().split("\n").filter(Boolean);

				for (const line of lines) {
					const trimmedLine: string = line.trim();
					const tabIndex: number = trimmedLine.indexOf("\t");

					if (tabIndex === -1) continue;

					const commitCountString: string = trimmedLine.slice(0, tabIndex).trim();
					const rest: string = trimmedLine.slice(tabIndex + 1).trim();
					const emailStart: number = rest.lastIndexOf("<");
					const emailEnd: number = rest.lastIndexOf(">");

					if (emailStart !== -1 && emailEnd !== -1 && emailEnd > emailStart) {
						const contributorName: string = rest.slice(0, emailStart).trim();
						const contributorEmail: string = rest.slice(emailStart + 1, emailEnd);

						stats.contributors.push({
							commits: Number.parseInt(commitCountString, 10) || 0,
							email: contributorEmail,
							name: contributorName,
						});
					}
				}
			} catch {
				// Ignore
			}

			// Get first commit date
			try {
				const { stdout: firstDate }: { stdout: string } = await execAsync("git log --reverse --format=%ci --max-count=1");
				stats.firstCommitDate = firstDate.trim() || undefined;
			} catch {
				// Ignore
			}

			// Get last commit date
			try {
				const { stdout: lastDate }: { stdout: string } = await execAsync("git log -1 --format=%ci");
				stats.lastCommitDate = lastDate.trim() || undefined;
			} catch {
				// Ignore
			}

			// Get branch count
			try {
				const { stdout: branches }: { stdout: string } = await execAsync("git branch -a --list");
				stats.branchCount = branches.trim().split("\n").filter(Boolean).length;
			} catch {
				// Ignore
			}

			// Get tags
			try {
				const { stdout: tags }: { stdout: string } = await execAsync("git tag --list");
				stats.tags = tags.trim().split("\n").filter(Boolean);
			} catch {
				// Ignore
			}
		} catch {
			// Return default empty stats
		}

		return stats;
	}

	/**
	 * Get repository information
	 * @returns {Promise<RepositoryInfo>} Promise resolving to repository information
	 */
	async getRepositoryInfo(): Promise<RepositoryInfo> {
		try {
			// Get repository URL
			const { stdout: remoteUrl }: { stdout: string } = await execAsync("git config --get remote.origin.url");
			const cleanRemoteUrl: string = remoteUrl.trim();
			const repoName: string = this.extractRepoName(cleanRemoteUrl);
			const repoOwner: string | undefined = this.extractRepoOwner(cleanRemoteUrl);

			// Get current directory name as fallback
			const currentDirectory: string = path.basename(process.cwd());
			const name: string = repoName || currentDirectory;

			// Try to get description and repository info from package.json
			let description: string = "";
			let codeStats: string = "";
			let owner: string | undefined = repoOwner;

			try {
				const packageJson: string = await fs.readFile("package.json", "utf8");
				const packageData: IPackageJson = JSON.parse(packageJson) as IPackageJson;
				description = packageData.description ?? "";

				// Generate code stats from dependencies
				const deps: number = Object.keys(packageData.dependencies ?? {}).length;
				const developmentDeps: number = Object.keys(packageData.devDependencies ?? {}).length;
				codeStats = `${deps} dependencies, ${developmentDeps} dev dependencies`;

				// If we don't have owner from git remote, try to get it from package.json
				if (!owner) {
					// First try repository field
					if (packageData.repository) {
						const repoUrl: string = typeof packageData.repository === "string" ? packageData.repository : (packageData.repository.url ?? "");

						if (repoUrl) {
							const packageOwner: string | undefined = this.extractRepoOwner(repoUrl);

							if (packageOwner) {
								owner = packageOwner;
							}
						}
					}

					// If still no owner, try author field
					if (!owner && packageData.author) {
						owner = this.extractAuthorName(packageData.author);
					}
				}
			} catch {
				description = "A software project";
				codeStats = "JavaScript/TypeScript project";
			}

			// Get default branch
			let defaultBranch: string = "main";

			try {
				const { stdout: branch }: { stdout: string } = await execAsync("git branch --show-current");
				defaultBranch = branch.trim() || "main";
			} catch {
				// Ignore error
			}

			return new RepositoryInfo({
				codeStats,
				defaultBranch,
				description,
				name,
				owner,
			});
		} catch {
			// Fallback for non-git repositories
			const currentDirectory: string = path.basename(process.cwd());

			let description: string = "";
			let codeStats: string = "";
			let owner: string | undefined;

			try {
				const packageJson: string = await fs.readFile("package.json", "utf8");
				const packageData: IPackageJson = JSON.parse(packageJson) as IPackageJson;
				description = packageData.description ?? "";

				const deps: number = Object.keys(packageData.dependencies ?? {}).length;
				const developmentDeps: number = Object.keys(packageData.devDependencies ?? {}).length;
				codeStats = `${deps} dependencies, ${developmentDeps} dev dependencies`;

				// Try to get owner from package.json
				// First try repository field
				if (packageData.repository) {
					const repoUrl: string = typeof packageData.repository === "string" ? packageData.repository : (packageData.repository.url ?? "");

					if (repoUrl) {
						owner = this.extractRepoOwner(repoUrl);
					}
				}

				// If still no owner, try author field
				if (!owner && packageData.author) {
					owner = this.extractAuthorName(packageData.author);
				}
			} catch {
				description = "A software project";
				codeStats = "JavaScript/TypeScript project";
			}

			return new RepositoryInfo({
				codeStats,
				description,
				name: currentDirectory,
				owner,
			});
		}
	}

	/**
	 * Check if the current directory is a Git repository
	 * @returns {Promise<boolean>} Promise resolving to true if it's a Git repository
	 */
	async isGitRepository(): Promise<boolean> {
		try {
			await execAsync("git rev-parse --git-dir");

			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Extract author name from package.json author field
	 * @param {string | { name?: string; email?: string; url?: string }} author - The author field from package.json
	 * @returns {string | undefined} The author name
	 */
	private extractAuthorName(author: { email?: string; name?: string; url?: string } | string): string | undefined {
		if (typeof author === "string") {
			// Handle formats like "John Doe <john@example.com> (https://example.com)"
			// Extract just the name part
			const match: null | RegExpExecArray = /^([^<(]+)/.exec(author.trim());

			return match?.[SECOND_ELEMENT_INDEX]?.trim() ?? author.trim();
		}

		// Handle object format { name: "John Doe", email: "...", url: "..." }
		return author.name?.trim();
	}

	/**
	 * Extract repository name from remote URL
	 * @param {string} remoteUrl - The Git remote URL
	 * @returns {string} The repository name
	 */
	private extractRepoName(remoteUrl: string): string {
		// Handle SSH URLs (git@github.com:user/repo.git or git@github.com:/user/repo.git)
		const sshMatch: null | RegExpExecArray = /git@[\w.-]+:\/?[\w-]+\/([\w.-]+?)(?:\.git)?$/.exec(remoteUrl);

		if (sshMatch?.[SECOND_ELEMENT_INDEX]) {
			return sshMatch[SECOND_ELEMENT_INDEX];
		}

		// Handle HTTPS URLs (https://github.com/user/repo.git)
		const httpsMatch: null | RegExpExecArray = /https?:\/\/[\w.-]+\/[\w-]+\/([\w.-]+?)(?:\.git)?$/.exec(remoteUrl);

		if (httpsMatch?.[SECOND_ELEMENT_INDEX]) {
			return httpsMatch[SECOND_ELEMENT_INDEX];
		}

		// Fallback to extracting the last path segment
		const parts: Array<string> = remoteUrl.split("/");
		const lastPartIndex: number = parts.length - 1;
		const lastPart: string | undefined = lastPartIndex >= 0 ? parts[lastPartIndex] : undefined;

		return lastPart ? lastPart.replace(/\.git$/, "") : "repository";
	}

	/**
	 * Extract repository owner/organization from remote URL
	 * @param {string} remoteUrl - The Git remote URL
	 * @returns {string | undefined} The repository owner or undefined
	 */
	private extractRepoOwner(remoteUrl: string): string | undefined {
		// Handle GitHub shorthand (github:user/repo)
		const githubShorthand: null | RegExpExecArray = /^github:([\w-]+)\/[\w.-]+$/.exec(remoteUrl);

		if (githubShorthand?.[SECOND_ELEMENT_INDEX]) {
			return githubShorthand[SECOND_ELEMENT_INDEX];
		}

		// Handle SSH URLs (git@github.com:user/repo.git or git@github.com:/user/repo.git)
		const sshMatch: null | RegExpExecArray = /git@[\w.-]+:\/?([\\w-]+)\/[\w.-]+?(?:\.git)?$/.exec(remoteUrl);

		if (sshMatch?.[SECOND_ELEMENT_INDEX]) {
			return sshMatch[SECOND_ELEMENT_INDEX];
		}

		// Handle HTTPS URLs (https://github.com/user/repo.git) and git+https URLs
		const httpsMatch: null | RegExpExecArray = /(?:git\+)?https?:\/\/[\w.-]+\/([\w-]+)\/[\w.-]+?(?:\.git)?$/.exec(remoteUrl);

		if (httpsMatch?.[SECOND_ELEMENT_INDEX]) {
			return httpsMatch[SECOND_ELEMENT_INDEX];
		}

		// Handle git:// URLs
		const gitMatch: null | RegExpExecArray = /git:\/\/[\w.-]+\/([\w-]+)\/[\w.-]+?(?:\.git)?$/.exec(remoteUrl);

		if (gitMatch?.[SECOND_ELEMENT_INDEX]) {
			return gitMatch[SECOND_ELEMENT_INDEX];
		}

		return undefined;
	}
}
