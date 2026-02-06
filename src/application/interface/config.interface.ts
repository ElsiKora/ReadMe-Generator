import type { ELogoType } from "../../domain/enum/logo-type.enum";

/**
 * Main configuration interface for README Generator
 */
export interface IConfig {
	/**
	 * Default additional context template
	 */
	contextTemplate?: string;

	/**
	 * Preferred language for README
	 */
	language?: string;

	/**
	 * LLM provider preferences
	 */
	llm?: {
		/**
		 * Model to use
		 */
		model?: string;

		/**
		 * Preferred provider (openai, anthropic, etc.)
		 */
		provider?: string;
	};

	/**
	 * Preferred logo type
	 */
	logoType?: ELogoType;

	/**
	 * Custom logo URL if using custom logo
	 */
	logoUrl?: string;

	/**
	 * Default repository owner (GitHub username or organization)
	 */
	repositoryOwner?: string;

	/**
	 * Repository source preference (local or remote)
	 */
	repositorySource?: "local" | "remote";

	/**
	 * Default scan depth for project files
	 */
	scanDepth?: number;

	/**
	 * Whether to include contributing guidelines section
	 */
	shouldIncludeContributing?: boolean;

	/**
	 * Whether to include contributors section
	 */
	shouldIncludeContributors?: boolean;

	/**
	 * Whether to include dynamic GitHub badges (stars, forks, issues, etc.)
	 */
	shouldIncludeGithubBadges?: boolean;

	/**
	 * Whether to skip confirmation prompts
	 */
	shouldSkipConfirmations?: boolean;
}
