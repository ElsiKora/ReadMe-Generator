import type { ILlmPromptContext, ILlmService } from "../../application/interface/llm-service.interface.js";
import type { IPromptBuilder } from "../../application/interface/prompt-builder.interface.js";
import type { IReadmeResponseParser } from "../../application/interface/readme-response-parser.interface.js";
import type { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";
import type { LLMConfiguration } from "../../domain/index.js";
import type { Readme } from "../../domain/index.js";

import { Anthropic } from "@anthropic-ai/sdk";

import { ANTHROPIC_MAX_TOKENS, DEFAULT_TEMPERATURE } from "../../domain/constant/numeric.constant.js";
import { EAnthropicModel } from "../../domain/enum/anthropic-model.enum.js";

/**
 * Anthropic implementation of the LLM service
 */
export class AnthropicLlmService implements ILlmService {
	private readonly PROMPT_BUILDER: IPromptBuilder;

	private readonly RESPONSE_PARSER: IReadmeResponseParser;

	constructor(promptBuilder: IPromptBuilder, responseParser: IReadmeResponseParser) {
		this.PROMPT_BUILDER = promptBuilder;
		this.RESPONSE_PARSER = responseParser;
	}

	/**
	 * Generate a README using Anthropic
	 * @param {ILlmPromptContext} context - The context for generating the README
	 * @param {LLMConfiguration} configuration - The LLM configuration
	 * @returns {Promise<Readme>} Promise resolving to the generated README
	 */
	async generateReadme(context: ILlmPromptContext, configuration: LLMConfiguration): Promise<Readme> {
		const anthropic: Anthropic = new Anthropic({
			apiKey: configuration.getApiKey().getValue(),
			baseURL: configuration.getBaseUrl(),
		});

		const systemPrompt: string = this.PROMPT_BUILDER.buildSystemPrompt(context);
		const userPrompt: string = this.PROMPT_BUILDER.buildUserPrompt(context);

		const response: Anthropic.Message = await anthropic.messages.create({
			max_tokens: ANTHROPIC_MAX_TOKENS,
			messages: [{ content: userPrompt, role: "user" }],
			model: configuration.getModel() ?? EAnthropicModel.CLAUDE_3_5_SONNET,
			system: systemPrompt,
			temperature: DEFAULT_TEMPERATURE,
		});

		const textContent: Anthropic.TextBlock | undefined = response.content.find((c: Anthropic.ContentBlock) => c.type === "text");

		if (!textContent?.text) {
			throw new Error("No text response from Anthropic");
		}

		return this.RESPONSE_PARSER.parseResponse(textContent.text, context);
	}

	/**
	 * Check if the service supports the given configuration
	 * @param {LLMConfiguration} configuration - The LLM configuration to check
	 * @returns {boolean} True if the service supports the configuration
	 */
	supports(configuration: LLMConfiguration): boolean {
		return configuration.getProvider() === ("anthropic" as ELLMProvider);
	}
}
