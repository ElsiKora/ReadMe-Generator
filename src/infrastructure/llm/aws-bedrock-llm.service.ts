import type { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

import type { ILlmPromptContext, ILlmService } from "../../application/interface/llm-service.interface.js";
import type { IPromptBuilder } from "../../application/interface/prompt-builder.interface.js";
import type { IReadmeResponseParser } from "../../application/interface/readme-response-parser.interface.js";
import type { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";
import type { LLMConfiguration } from "../../domain/index.js";
import type { Readme } from "../../domain/index.js";

import { BedrockRuntimeClient as BedrockRuntimeClientImpl, InvokeModelCommand as InvokeModelCommandImpl } from "@aws-sdk/client-bedrock-runtime";

import { DEFAULT_TEMPERATURE } from "../../domain/constant/numeric.constant.js";
import { EAWSBedrockModel } from "../../domain/enum/aws-bedrock-model.enum.js";
import { AWS_BEDROCK_MAX_TOKENS } from "../constant/llm.constant.js";

/**
 * AWS Bedrock implementation of the LLM service
 */
export class AWSBedrockLlmService implements ILlmService {
	private readonly PROMPT_BUILDER: IPromptBuilder;

	private readonly RESPONSE_PARSER: IReadmeResponseParser;

	constructor(promptBuilder: IPromptBuilder, responseParser: IReadmeResponseParser) {
		this.PROMPT_BUILDER = promptBuilder;
		this.RESPONSE_PARSER = responseParser;
	}

	/**
	 * Generate a README using AWS Bedrock
	 * @param {ILlmPromptContext} context - The context for generating the README
	 * @param {LLMConfiguration} configuration - The LLM configuration
	 * @returns {Promise<Readme>} Promise resolving to the generated README
	 */
	async generateReadme(context: ILlmPromptContext, configuration: LLMConfiguration): Promise<Readme> {
		const region: string = configuration.getBaseUrl() ?? "us-east-1";

		const client: BedrockRuntimeClient = new BedrockRuntimeClientImpl({
			credentials: undefined, // Let AWS SDK use default credential chain
			region,
		});

		const modelId: string = configuration.getModel() ?? EAWSBedrockModel.CLAUDE_3_5_SONNET;

		const systemPrompt: string = this.PROMPT_BUILDER.buildSystemPrompt(context);
		const userPrompt: string = this.PROMPT_BUILDER.buildUserPrompt(context);

		const payload: object = this.buildPayload(modelId, systemPrompt, userPrompt);

		const command: InvokeModelCommand = new InvokeModelCommandImpl({
			body: JSON.stringify(payload),
			contentType: "application/json",
			modelId,
		});

		const response: { body: Uint8Array } = await client.send(command);
		const responseBody: string = new TextDecoder().decode(response.body);
		const parsedResponse: unknown = JSON.parse(responseBody);

		const content: string = this.extractContent(modelId, parsedResponse);

		return this.RESPONSE_PARSER.parseResponse(content, context);
	}

	/**
	 * Check if the service supports the given configuration
	 * @param {LLMConfiguration} configuration - The LLM configuration to check
	 * @returns {boolean} True if the service supports the configuration
	 */
	supports(configuration: LLMConfiguration): boolean {
		return configuration.getProvider() === ("aws-bedrock" as ELLMProvider);
	}

	/**
	 * Build the payload for the AWS Bedrock API
	 * @param {string} modelId - The model ID
	 * @param {string} systemPrompt - The system prompt
	 * @param {string} userPrompt - The user prompt
	 * @returns {object} The payload object
	 */
	private buildPayload(modelId: string, systemPrompt: string, userPrompt: string): object {
		if (modelId.includes("claude")) {
			return {
				anthropic_version: "bedrock-2023-05-31",
				max_tokens: AWS_BEDROCK_MAX_TOKENS,
				messages: [{ content: userPrompt, role: "user" }],
				system: systemPrompt,
				temperature: DEFAULT_TEMPERATURE,
			};
		}

		// Add support for other models as needed
		throw new Error(`Unsupported model: ${modelId}`);
	}

	/**
	 * Extract content from the AWS Bedrock response
	 * @param {string} modelId - The model ID
	 * @param {unknown} response - The response from AWS Bedrock
	 * @returns {string} The extracted content
	 */
	private extractContent(modelId: string, response: unknown): string {
		if (modelId.includes("claude")) {
			interface IClaudeResponse {
				content?: Array<{ text?: string }>;
			}

			const claudeResponse: IClaudeResponse = response as IClaudeResponse;
			const textContent: string | undefined = claudeResponse.content?.find((c: { text?: string }) => c.text)?.text;

			if (!textContent) {
				throw new Error("No text content in response");
			}

			return textContent;
		}

		throw new Error(`Unsupported model: ${modelId}`);
	}
}
