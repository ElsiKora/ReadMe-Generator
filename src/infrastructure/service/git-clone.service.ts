import type { Stats } from "node:fs";

import type { IGitCloneService } from "../../application/interface/git-clone-service.interface";

import { exec } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

interface IExecResult {
	stderr: string;
	stdout: string;
}

const execAsync: (command: string, options?: Record<string, unknown>) => Promise<IExecResult> = promisify(exec);

/**
 * Service for Git cloning operations
 */
export class GitCloneService implements IGitCloneService {
	/**
	 * Clean up a cloned repository directory
	 * @param {string} directoryPath - The path to the directory to clean up
	 * @returns {Promise<void>}
	 */
	async cleanupRepository(directoryPath: string): Promise<void> {
		try {
			// Check if the directory exists
			const stats: Stats = await fs.stat(directoryPath);

			if (stats.isDirectory()) {
				// Remove the directory and all its contents
				// eslint-disable-next-line @elsikora/typescript/naming-convention
				await fs.rm(directoryPath, { force: true, recursive: true });
			}
		} catch (error) {
			// Ignore errors during cleanup (directory might not exist)
			if (error instanceof Error && "code" in error && error.code !== "ENOENT") {
				console.warn(`Warning: Failed to clean up directory ${directoryPath}: ${error.message}`);
			}
		}
	}

	/**
	 * Clone a Git repository to a temporary directory
	 * @param {string} repositoryUrl - The Git repository URL to clone
	 * @returns {Promise<string>} The path to the cloned repository
	 */
	async cloneRepository(repositoryUrl: string): Promise<string> {
		// Create a temporary directory
		const temporaryDirectory: string = await fs.mkdtemp(path.join(os.tmpdir(), "readme-generator-"));

		// Extract repository name from URL for the subdirectory
		const repoName: string = this.extractRepoName(repositoryUrl);
		const clonePath: string = path.join(temporaryDirectory, repoName);

		try {
			// Clone the repository with minimal depth for efficiency
			const cloneCommand: string = `git clone --depth 1 "${repositoryUrl}" "${clonePath}"`;

			await execAsync(cloneCommand, {
				cwd: temporaryDirectory,
				env: {
					...process.env,
					GIT_TERMINAL_PROMPT: "0", // Disable git prompts
				},
			});

			return clonePath;
		} catch (error) {
			// Clean up on failure
			await this.cleanupRepository(temporaryDirectory);

			if (error instanceof Error) {
				throw new TypeError(`Failed to clone repository: ${error.message}`);
			}

			throw new Error("Failed to clone repository: Unknown error");
		}
	}

	/**
	 * Extract repository name from URL
	 * @param {string} repositoryUrl - The repository URL
	 * @returns {string} The repository name
	 */
	private extractRepoName(repositoryUrl: string): string {
		// Remove .git suffix if present
		const cleanUrl: string = repositoryUrl.replace(/\.git$/i, "");

		// Try to extract from URL path
		const urlParts: Array<string> = cleanUrl.split("/");
		const repoName: string = urlParts.pop() ?? "repository";

		// Sanitize the name to be filesystem-safe
		return repoName.replaceAll(/[^\w-]/g, "_");
	}
}
