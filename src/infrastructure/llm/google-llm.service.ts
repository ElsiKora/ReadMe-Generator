import type { GenerateContentResult } from "@google/generative-ai";

import type { ILlmPromptContext, ILlmService } from "../../application/interface/llm-service.interface.js";
import type { IPromptBuilder } from "../../application/interface/prompt-builder.interface.js";
import type { IReadmeResponseParser } from "../../application/interface/readme-response-parser.interface.js";
import type { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";
import type { LLMConfiguration } from "../../domain/index.js";
import type { Readme } from "../../domain/index.js";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { EGoogleModel } from "../../domain/enum/google-model.enum.js";

/**
 * Google implementation of the LLM service
 */
export class GoogleLlmService implements ILlmService {
	private readonly PROMPT_BUILDER: IPromptBuilder;

	private readonly RESPONSE_PARSER: IReadmeResponseParser;

	constructor(promptBuilder: IPromptBuilder, responseParser: IReadmeResponseParser) {
		this.PROMPT_BUILDER = promptBuilder;
		this.RESPONSE_PARSER = responseParser;
	}

	/**
	 * Generate a README using Google Generative AI
	 * @param {ILlmPromptContext} context - The context for generating the README
	 * @param {LLMConfiguration} configuration - The LLM configuration
	 * @returns {Promise<Readme>} Promise resolving to the generated README
	 */
	async generateReadme(context: ILlmPromptContext, configuration: LLMConfiguration): Promise<Readme> {
		const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(configuration.getApiKey().getValue());

		const model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]> = genAI.getGenerativeModel({
			generationConfig: {
				responseMimeType: "application/json",
			},
			model: configuration.getModel() ?? EGoogleModel.GEMINI_1_5_PRO_LATEST,
		});

		const systemPrompt: string = this.PROMPT_BUILDER.buildSystemPrompt(context);
		const userPrompt: string = this.PROMPT_BUILDER.buildUserPrompt(context);

		const result: GenerateContentResult = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);

		const content: string | undefined = result.response.text();

		if (!content) {
			throw new Error("No response from Google Generative AI");
		}

		return this.RESPONSE_PARSER.parseResponse(content, context);
	}

	/**
	 * Check if the service supports the given configuration
	 * @param {LLMConfiguration} configuration - The LLM configuration to check
	 * @returns {boolean} True if the service supports the configuration
	 */
	supports(configuration: LLMConfiguration): boolean {
		return configuration.getProvider() === ("google" as ELLMProvider);
	}
}
