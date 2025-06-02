/**
 * Interface for Git cloning operations
 */
export interface IGitCloneService {
	/**
	 * Clean up a cloned repository directory
	 * @param {string} directoryPath - The path to the directory to clean up
	 * @returns {Promise<void>}
	 */
	cleanupRepository(directoryPath: string): Promise<void>;

	/**
	 * Clone a Git repository to a temporary directory
	 * @param {string} repositoryUrl - The Git repository URL to clone
	 * @returns {Promise<string>} The path to the cloned repository
	 */
	cloneRepository(repositoryUrl: string): Promise<string>;
}
