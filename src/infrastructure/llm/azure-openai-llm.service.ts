import type { ILlmPromptContext, ILlmService } from "../../application/interface/llm-service.interface";
import type { IPromptBuilder } from "../../application/interface/prompt-builder.interface";
import type { IReadmeResponseParser } from "../../application/interface/readme-response-parser.interface";
import type { ELLMProvider } from "../../domain/enum/llm-provider.enum";
import type { LLMConfiguration } from "../../domain/index";
import type { Readme } from "../../domain/index";

import OpenAI from "openai";

import { DEFAULT_TEMPERATURE, OPENAI_MAX_TOKENS } from "../../domain/constant/numeric.constant";

/**
 * Azure OpenAI implementation of the LLM service
 */
export class AzureOpenAILlmService implements ILlmService {
	private readonly PROMPT_BUILDER: IPromptBuilder;

	private readonly RESPONSE_PARSER: IReadmeResponseParser;

	constructor(promptBuilder: IPromptBuilder, responseParser: IReadmeResponseParser) {
		this.PROMPT_BUILDER = promptBuilder;
		this.RESPONSE_PARSER = responseParser;
	}

	/**
	 * Generate a README using Azure OpenAI
	 * @param {ILlmPromptContext} context - The context for generating the README
	 * @param {LLMConfiguration} configuration - The LLM configuration
	 * @returns {Promise<Readme>} Promise resolving to the generated README
	 */
	async generateReadme(context: ILlmPromptContext, configuration: LLMConfiguration): Promise<Readme> {
		const baseURL: string | undefined = configuration.getBaseUrl();

		if (!baseURL) {
			throw new Error("Azure OpenAI requires a base URL");
		}

		// Azure OpenAI expects the deployment name as the model
		const deploymentName: string = configuration.getModel();

		if (!deploymentName) {
			throw new Error("Azure OpenAI requires a deployment name");
		}

		const openai: OpenAI = new OpenAI({
			apiKey: configuration.getApiKey().getValue(),
			baseURL: `${baseURL}/openai/deployments/${deploymentName}`,
			defaultHeaders: {
				"api-key": configuration.getApiKey().getValue(),
			},
			defaultQuery: { "api-version": "2024-02-15-preview" },
		});

		const systemPrompt: string = this.PROMPT_BUILDER.buildSystemPrompt(context);
		const userPrompt: string = this.PROMPT_BUILDER.buildUserPrompt(context);

		const response: OpenAI.Chat.Completions.ChatCompletion = await openai.chat.completions.create({
			max_tokens: OPENAI_MAX_TOKENS,
			messages: [
				{ content: systemPrompt, role: "system" },
				{ content: userPrompt, role: "user" },
			],
			model: deploymentName,
			response_format: { type: "json_object" },
			temperature: DEFAULT_TEMPERATURE,
		});

		const content: null | string = response.choices[0]?.message?.content ?? null;

		if (!content) {
			throw new Error("No response from Azure OpenAI");
		}

		return this.RESPONSE_PARSER.parseResponse(content, context);
	}

	/**
	 * Check if the service supports the given configuration
	 * @param {LLMConfiguration} configuration - The LLM configuration to check
	 * @returns {boolean} True if the service supports the configuration
	 */
	supports(configuration: LLMConfiguration): boolean {
		return configuration.getProvider() === ("azure-openai" as ELLMProvider);
	}
}
