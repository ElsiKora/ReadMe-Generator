import type { AxiosResponse } from "axios";

import type { ILlmPromptContext, ILlmService } from "../../application/interface/llm-service.interface";
import type { IPromptBuilder } from "../../application/interface/prompt-builder.interface";
import type { IReadmeResponseParser } from "../../application/interface/readme-response-parser.interface";
import type { ELLMProvider } from "../../domain/enum/llm-provider.enum";
import type { LLMConfiguration } from "../../domain/index";
import type { Readme } from "../../domain/index";

import axios from "axios";

import { DEFAULT_TEMPERATURE } from "../../domain/constant/numeric.constant";
import { EOllamaModel } from "../../domain/enum/ollama-model.enum";

/**
 * Ollama implementation of the LLM service
 */
export class OllamaLlmService implements ILlmService {
	private readonly PROMPT_BUILDER: IPromptBuilder;

	private readonly RESPONSE_PARSER: IReadmeResponseParser;

	constructor(promptBuilder: IPromptBuilder, responseParser: IReadmeResponseParser) {
		this.PROMPT_BUILDER = promptBuilder;
		this.RESPONSE_PARSER = responseParser;
	}

	/**
	 * Generate a README using Ollama
	 * @param {ILlmPromptContext} context - The context for generating the README
	 * @param {LLMConfiguration} configuration - The LLM configuration
	 * @returns {Promise<Readme>} Promise resolving to the generated README
	 */
	async generateReadme(context: ILlmPromptContext, configuration: LLMConfiguration): Promise<Readme> {
		const baseURL: string = configuration.getBaseUrl() ?? "http://localhost:11434";
		const model: string = configuration.getModel() ?? EOllamaModel.LLAMA3_3;

		const systemPrompt: string = this.PROMPT_BUILDER.buildSystemPrompt(context);
		const userPrompt: string = this.PROMPT_BUILDER.buildUserPrompt(context);

		const response: AxiosResponse<{ response: string }> = await axios.post(
			`${baseURL}/api/generate`,
			{
				format: "json",
				model,
				options: {
					temperature: DEFAULT_TEMPERATURE,
				},
				prompt: `${systemPrompt}\n\n${userPrompt}`,
				shouldStream: false,
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		const content: string = response.data.response;

		if (!content) {
			throw new Error("No response from Ollama");
		}

		return this.RESPONSE_PARSER.parseResponse(content, context);
	}

	/**
	 * Check if the service supports the given configuration
	 * @param {LLMConfiguration} configuration - The LLM configuration to check
	 * @returns {boolean} True if the service supports the configuration
	 */
	supports(configuration: LLMConfiguration): boolean {
		return configuration.getProvider() === ("ollama" as ELLMProvider);
	}
}
