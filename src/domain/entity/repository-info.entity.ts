/**
 * Repository information entity
 */
export class RepositoryInfo {
	private readonly CODE_STATS?: string;

	private readonly DEFAULT_BRANCH?: string;

	private readonly DESCRIPTION: string;

	private readonly NAME: string;

	private readonly OWNER?: string;

	constructor(data: { codeStats?: string; defaultBranch?: string; description: string; name: string; owner?: string }) {
		this.NAME = data.name;
		this.DESCRIPTION = data.description;
		this.OWNER = data.owner;
		this.DEFAULT_BRANCH = data.defaultBranch;
		this.CODE_STATS = data.codeStats;
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
}
