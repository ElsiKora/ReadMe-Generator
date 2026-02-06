import type { LLMConfiguration, Readme } from "../../domain/index";
import type { ILlmPromptContext, ILlmService } from "../interface/llm-service.interface";

/**
 * Use case for generating a README
 */
export class GenerateReadmeUseCase {
	private readonly LLM_SERVICES: Array<ILlmService>;

	constructor(llmServices: Array<ILlmService>) {
		this.LLM_SERVICES = llmServices;
	}

	/**
	 * Execute the use case
	 * @param {ILlmPromptContext} context - The context for generating the README
	 * @param {LLMConfiguration} configuration - The LLM configuration
	 * @returns {Promise<Readme>} Promise resolving to the generated README
	 */
	async execute(context: ILlmPromptContext, configuration: LLMConfiguration): Promise<Readme> {
		// Find a service that supports the configuration
		const llmService: ILlmService | undefined = this.LLM_SERVICES.find((service: ILlmService) => service.supports(configuration));

		if (!llmService) {
			throw new Error(`No LLM service found for provider: ${configuration.getProvider()}`);
		}

		// Generate the README
		return llmService.generateReadme(context, configuration);
	}
}
