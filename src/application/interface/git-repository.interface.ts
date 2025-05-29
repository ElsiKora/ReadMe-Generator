import type { RepositoryInfo } from "../../domain/index.js";

/**
 * Interface for Git repository operations
 */
export interface IGitRepository {
	/**
	 * Get repository information
	 * @returns {Promise<RepositoryInfo>} Promise resolving to repository information
	 */
	getRepositoryInfo(): Promise<RepositoryInfo>;

	/**
	 * Check if the current directory is a Git repository
	 * @returns {Promise<boolean>} Promise resolving to true if it's a Git repository
	 */
	isGitRepository(): Promise<boolean>;
}
