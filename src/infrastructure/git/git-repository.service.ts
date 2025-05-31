import type { IGitRepository } from "../../application/interface/git-repository.interface.js";

import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { RepositoryInfo } from "../../domain/entity/repository-info.entity.js";

const execAsync: (command: string) => Promise<{ stderr: string; stdout: string }> = promisify(exec);

interface IPackageJson {
	dependencies?: Record<string, string>;
	description?: string;
	devDependencies?: Record<string, string>;
}

/**
 * Git repository implementation
 */
export class GitRepositoryService implements IGitRepository {
	/**
	 * Get repository information
	 * @returns {Promise<RepositoryInfo>} Promise resolving to repository information
	 */
	async getRepositoryInfo(): Promise<RepositoryInfo> {
		try {
			// Get repository name
			const { stdout: remoteName }: { stdout: string } = await execAsync("git config --get remote.origin.url");
			const repoName: string = this.extractRepoName(remoteName.trim());

			// Get current directory name as fallback
			const currentDirectory: string = path.basename(process.cwd());
			const name: string = repoName || currentDirectory;

			// Try to get description from package.json
			let description: string = "";
			let codeStats: string = "";

			try {
				const packageJson: string = await fs.readFile("package.json", "utf8");
				const packageData: IPackageJson = JSON.parse(packageJson) as IPackageJson;
				description = packageData.description ?? "";

				// Generate code stats from dependencies
				const deps: number = Object.keys(packageData.dependencies ?? {}).length;
				const developmentDeps: number = Object.keys(packageData.devDependencies ?? {}).length;
				codeStats = `${deps} dependencies, ${developmentDeps} dev dependencies`;
			} catch {
				description = "A software project";
				codeStats = "JavaScript/TypeScript project";
			}

			// Get repository owner
			let owner: string = "";

			try {
				const { stdout: gitUser }: { stdout: string } = await execAsync("git config --get user.name");
				owner = gitUser.trim();
			} catch {
				// Ignore error
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

			try {
				const packageJson: string = await fs.readFile("package.json", "utf8");
				const packageData: IPackageJson = JSON.parse(packageJson) as IPackageJson;
				description = packageData.description ?? "";

				const deps: number = Object.keys(packageData.dependencies ?? {}).length;
				const developmentDeps: number = Object.keys(packageData.devDependencies ?? {}).length;
				codeStats = `${deps} dependencies, ${developmentDeps} dev dependencies`;
			} catch {
				description = "A software project";
				codeStats = "JavaScript/TypeScript project";
			}

			return new RepositoryInfo({
				codeStats,
				description,
				name: currentDirectory,
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
	 * Extract repository name from remote URL
	 * @param {string} remoteUrl - The Git remote URL
	 * @returns {string} The repository name
	 */
	private extractRepoName(remoteUrl: string): string {
		// Handle SSH URLs (git@github.com:user/repo.git)
		const sshMatch: null | RegExpExecArray = /git@[\w.-]+:[\w-]+\/([\w.-]+?)(?:\.git)?$/.exec(remoteUrl);

		if (sshMatch?.[1]) {
			return sshMatch[1];
		}

		// Handle HTTPS URLs (https://github.com/user/repo.git)
		const httpsMatch: null | RegExpExecArray = /https?:\/\/[\w.-]+\/[\w-]+\/([\w.-]+?)(?:\.git)?$/.exec(remoteUrl);

		if (httpsMatch?.[1]) {
			return httpsMatch[1];
		}

		// Fallback to extracting the last path segment
		const parts: Array<string> = remoteUrl.split("/");
		const lastPartIndex: number = parts.length - 1;
		const lastPart: string | undefined = lastPartIndex >= 0 ? parts[lastPartIndex] : undefined;

		return lastPart ? lastPart.replace(/\.git$/, "") : "repository";
	}
}
