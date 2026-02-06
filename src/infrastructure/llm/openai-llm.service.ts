import type { ILlmPromptContext, ILlmService } from "../../application/interface/llm-service.interface";
import type { IPromptBuilder } from "../../application/interface/prompt-builder.interface";
import type { IReadmeResponseParser } from "../../application/interface/readme-response-parser.interface";
import type { ELLMProvider } from "../../domain/enum/llm-provider.enum";
import type { LLMConfiguration } from "../../domain/index";
import type { Readme } from "../../domain/index";

import OpenAI from "openai";

import { DEFAULT_TEMPERATURE, OPENAI_MAX_TOKENS } from "../../domain/constant/numeric.constant";
import { EOpenAIModel } from "../../domain/enum/openai-model.enum";

/**
 * OpenAI implementation of the LLM service
 */
export class OpenAILlmService implements ILlmService {
	private readonly PROMPT_BUILDER: IPromptBuilder;

	private readonly RESPONSE_PARSER: IReadmeResponseParser;

	constructor(promptBuilder: IPromptBuilder, responseParser: IReadmeResponseParser) {
		this.PROMPT_BUILDER = promptBuilder;
		this.RESPONSE_PARSER = responseParser;
	}

	/**
	 * Generate a README using OpenAI
	 * @param {ILlmPromptContext} context - The context for generating the README
	 * @param {LLMConfiguration} configuration - The LLM configuration
	 * @returns {Promise<Readme>} Promise resolving to the generated README
	 */
	async generateReadme(context: ILlmPromptContext, configuration: LLMConfiguration): Promise<Readme> {
		const openai: OpenAI = new OpenAI({
			apiKey: configuration.getApiKey().getValue(),
			baseURL: configuration.getBaseUrl(),
		});

		const systemPrompt: string = this.PROMPT_BUILDER.buildSystemPrompt(context);
		const userPrompt: string = this.PROMPT_BUILDER.buildUserPrompt(context);

		const response: OpenAI.Chat.Completions.ChatCompletion = await openai.chat.completions.create({
			max_tokens: OPENAI_MAX_TOKENS,
			messages: [
				{ content: systemPrompt, role: "system" },
				{ content: userPrompt, role: "user" },
			],
			model: configuration.getModel() ?? EOpenAIModel.GPT_5_2,
			response_format: { type: "json_object" },
			temperature: DEFAULT_TEMPERATURE,
		});

		const content: null | string = response.choices[0]?.message?.content ?? null;

		if (!content) {
			throw new Error("No response from OpenAI");
		}

		return this.RESPONSE_PARSER.parseResponse(content, context);
	}

	/**
	 * Check if the service supports the given configuration
	 * @param {LLMConfiguration} configuration - The LLM configuration to check
	 * @returns {boolean} True if the service supports the configuration
	 */
	supports(configuration: LLMConfiguration): boolean {
		return configuration.getProvider() === ("openai" as ELLMProvider);
	}
}
