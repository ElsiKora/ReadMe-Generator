import type { IGitStats, IPackageInfo } from "../../application/interface/git-repository.interface";

/**
 * Detected infrastructure tools
 */
export interface IDetectedTools {
	bundlers: Array<string>;
	cicd: Array<string>;
	containerization: Array<string>;
	linting: Array<string>;
	packageManagers: Array<string>;
	testing: Array<string>;
}

/**
 * Language statistics entry
 */
export interface ILanguageStatEntry {
	extension: string;
	fileCount: number;
	lines: number;
	name: string;
	percentage: number;
}

/**
 * Repository information entity
 */
export class RepositoryInfo {
	private readonly CODE_STATS?: string;

	private readonly DEFAULT_BRANCH?: string;

	private readonly DESCRIPTION: string;

	private readonly DETECTED_TOOLS?: IDetectedTools;

	private readonly DIRECTORY_TREE?: string;

	private readonly GIT_STATS?: IGitStats;

	private readonly LANGUAGE_STATS?: Array<ILanguageStatEntry>;

	private readonly NAME: string;

	private readonly OWNER?: string;

	private readonly PACKAGE_INFO?: IPackageInfo;

	constructor(data: { codeStats?: string; defaultBranch?: string; description: string; detectedTools?: IDetectedTools; directoryTree?: string; gitStats?: IGitStats; languageStats?: Array<ILanguageStatEntry>; name: string; owner?: string; packageInfo?: IPackageInfo }) {
		this.NAME = data.name;
		this.DESCRIPTION = data.description;
		this.OWNER = data.owner;
		this.DEFAULT_BRANCH = data.defaultBranch;
		this.CODE_STATS = data.codeStats;
		this.GIT_STATS = data.gitStats;
		this.PACKAGE_INFO = data.packageInfo;
		this.LANGUAGE_STATS = data.languageStats;
		this.DETECTED_TOOLS = data.detectedTools;
		this.DIRECTORY_TREE = data.directoryTree;
	}

	/**
	 * Get code statistics
	 * @returns {string} The code statistics
	 */
	getCodeStats(): string {
		return this.CODE_STATS ?? "";
	}

	/**
	 * Get default branch
	 * @returns {string} The default branch
	 */
	getDefaultBranch(): string {
		return this.DEFAULT_BRANCH ?? "main";
	}

	/**
	 * Get description
	 * @returns {string} The description
	 */
	getDescription(): string {
		return this.DESCRIPTION;
	}

	/**
	 * Get detected infrastructure tools
	 * @returns {IDetectedTools | undefined} The detected tools
	 */
	getDetectedTools(): IDetectedTools | undefined {
		return this.DETECTED_TOOLS;
	}

	/**
	 * Get directory tree string
	 * @returns {string | undefined} The directory tree
	 */
	getDirectoryTree(): string | undefined {
		return this.DIRECTORY_TREE;
	}

	/**
	 * Get git history statistics
	 * @returns {IGitStats | undefined} The git statistics
	 */
	getGitStats(): IGitStats | undefined {
		return this.GIT_STATS;
	}

	/**
	 * Get language statistics
	 * @returns {Array<ILanguageStatEntry> | undefined} The language statistics
	 */
	getLanguageStats(): Array<ILanguageStatEntry> | undefined {
		return this.LANGUAGE_STATS;
	}

	/**
	 * Get name
	 * @returns {string} The name
	 */
	getName(): string {
		return this.NAME;
	}

	/**
	 * Get owner
	 * @returns {string | undefined} The owner
	 */
	getOwner(): string | undefined {
		return this.OWNER;
	}

	/**
	 * Get extended package info
	 * @returns {IPackageInfo | undefined} The package info
	 */
	getPackageInfo(): IPackageInfo | undefined {
		return this.PACKAGE_INFO;
	}

	/**
	 * Create a new RepositoryInfo with a different owner
	 * @param {string} owner - The new owner
	 * @returns {RepositoryInfo} A new RepositoryInfo with the updated owner
	 */
	withOwner(owner: string): RepositoryInfo {
		return new RepositoryInfo({
			codeStats: this.CODE_STATS,
			defaultBranch: this.DEFAULT_BRANCH,
			description: this.DESCRIPTION,
			detectedTools: this.DETECTED_TOOLS,
			directoryTree: this.DIRECTORY_TREE,
			gitStats: this.GIT_STATS,
			languageStats: this.LANGUAGE_STATS,
			name: this.NAME,
			owner,
			packageInfo: this.PACKAGE_INFO,
		});
	}
}
