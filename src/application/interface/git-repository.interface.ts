import type { RepositoryInfo } from "../../domain/index";

/**
 * Interface for Git repository operations
 */
export interface IGitRepository {
	/**
	 * Get extended package.json information
	 * @param {string} [projectPath] - Optional path to project directory
	 * @returns {Promise<IPackageInfo>} Promise resolving to extended package info
	 */
	getExtendedPackageInfo(projectPath?: string): Promise<IPackageInfo>;

	/**
	 * Get git history statistics
	 * @returns {Promise<IGitStats>} Promise resolving to git statistics
	 */
	getGitStats(): Promise<IGitStats>;

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

/**
 * Git history statistics
 */
export interface IGitStats {
	branchCount: number;
	commitCount: number;
	contributors: Array<{ commits: number; email: string; name: string }>;
	firstCommitDate?: string;
	lastCommitDate?: string;
	tags: Array<string>;
}

/**
 * Extended package.json information
 */
export interface IPackageInfo {
	bin?: Record<string, string> | string;
	bugs?: string;
	engines?: Record<string, string>;
	homepage?: string;
	keywords?: Array<string>;
	license?: string;
	peerDependencies?: Record<string, string>;
	scripts?: Record<string, string>;
	version?: string;
}
