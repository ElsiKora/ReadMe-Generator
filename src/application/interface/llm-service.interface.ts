import type { ELogoType, LLMConfiguration, Readme, RepositoryInfo } from "../../domain/index";

/**
 * Context for generating README with LLM
 */
export interface ILlmPromptContext {
	changelogContent?: string;
	language?: string;
	logoType?: ELogoType;
	logoUrl?: string;
	projectContext?: string;
	repositoryInfo: RepositoryInfo;
	scanDepth?: number;
	scannedFiles?: Array<{
		content: string;
		path: string;
		size: number;
	}>;
}

/**
 * Interface for LLM service implementations
 */
export interface ILlmService {
	/**
	 * Generate a README using the LLM
	 * @param {ILlmPromptContext} context - The context for generating the README
	 * @param {LLMConfiguration} configuration - The LLM configuration
	 * @returns {Promise<Readme>} Promise resolving to the generated README
	 */
	generateReadme(context: ILlmPromptContext, configuration: LLMConfiguration): Promise<Readme>;

	/**
	 * Check if the service supports the given configuration
	 * @param {LLMConfiguration} configuration - The LLM configuration to check
	 * @returns {boolean} True if the service supports the configuration
	 */
	supports(configuration: LLMConfiguration): boolean;
}
