import type { InvokeModelCommandOutput } from "@aws-sdk/client-bedrock-runtime";

import type { ILlmPromptContext, ILlmService } from "../../application/interface/llm-service.interface.js";
import type { ELLMProvider } from "../../domain/enum/llm-provider.enum.js";
import type { LLMConfiguration } from "../../domain/index.js";
import type { ReadmeBuilder } from "../service/readme-builder.service.js";

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

import { DEFAULT_TEMPERATURE } from "../../domain/constant/numeric.constant.js";
import { Badge, Readme } from "../../domain/index.js";

// Maximum tokens for AWS Bedrock models
const AWS_BEDROCK_MAX_TOKENS: number = 4096;

/**
 * AWS Bedrock implementation of the LLM service
 */
export class AWSBedrockLlmService implements ILlmService {
	private readonly README_BUILDER: ReadmeBuilder;

	constructor(readmeBuilder: ReadmeBuilder) {
		this.README_BUILDER = readmeBuilder;
	}

	/**
	 * Generate a README using AWS Bedrock
	 * @param {ILlmPromptContext} context - The context for generating the README
	 * @param {LLMConfiguration} configuration - The LLM configuration
	 * @returns {Promise<Readme>} Promise resolving to the generated README
	 */
	async generateReadme(context: ILlmPromptContext, configuration: LLMConfiguration): Promise<Readme> {
		const modelId: string = configuration.getModel();

		if (!modelId) {
			throw new Error("AWS Bedrock requires a model ID");
		}

		// Configure AWS client
		const client: BedrockRuntimeClient = new BedrockRuntimeClient({
			credentials: {
				accessKeyId: configuration.getApiKey().getValue(),
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
			},
			region: process.env.AWS_REGION ?? "us-east-1",
		});

		const systemPrompt: string = this.buildSystemPrompt(context);
		const userPrompt: string = this.buildUserPrompt(context);

		// Build request body based on model type
		let requestBody: Record<string, unknown>;

		if (modelId.includes("claude")) {
			// Claude models on Bedrock
			requestBody = {
				anthropic_version: "bedrock-2023-05-31",
				max_tokens: AWS_BEDROCK_MAX_TOKENS,
				messages: [
					{
						content: `${systemPrompt}\n\n${userPrompt}`,
						role: "user",
					},
				],
				temperature: DEFAULT_TEMPERATURE,
			};
		} else if (modelId.includes("titan")) {
			// Amazon Titan models
			requestBody = {
				inputText: `${systemPrompt}\n\n${userPrompt}`,
				textGenerationConfig: {
					maxTokenCount: AWS_BEDROCK_MAX_TOKENS,
					temperature: DEFAULT_TEMPERATURE,
				},
			};
		} else {
			// Generic format
			requestBody = {
				max_tokens: AWS_BEDROCK_MAX_TOKENS,
				prompt: `${systemPrompt}\n\n${userPrompt}`,
				temperature: DEFAULT_TEMPERATURE,
			};
		}

		const command: InvokeModelCommand = new InvokeModelCommand({
			body: JSON.stringify(requestBody),
			contentType: "application/json",
			modelId,
		});

		const response: InvokeModelCommandOutput = await client.send(command);
		const responseBody: string = new TextDecoder().decode(response.body);
		const parsedResponse: Record<string, unknown> = JSON.parse(responseBody) as Record<string, unknown>;

		// Extract content based on model type
		let content: null | string = null;

		if (modelId.includes("claude")) {
			// Claude response format
			const responseContent: Array<{ text: string }> | undefined = parsedResponse.content as Array<{ text: string }> | undefined;
			content = responseContent?.[0]?.text ?? null;
		} else if (modelId.includes("titan")) {
			// Titan response format
			const results: Array<{ outputText: string }> | undefined = parsedResponse.results as Array<{ outputText: string }> | undefined;
			content = results?.[0]?.outputText ?? null;
		} else {
			// Generic response format
			content = (parsedResponse.completion as string) ?? (parsedResponse.text as string) ?? null;
		}

		if (!content) {
			throw new Error("No response from AWS Bedrock");
		}

		return this.parseReadmeResponse(content);
	}

	/**
	 * Check if the service supports the given configuration
	 * @param {LLMConfiguration} configuration - The LLM configuration to check
	 * @returns {boolean} True if the service supports the configuration
	 */
	supports(configuration: LLMConfiguration): boolean {
		return configuration.getProvider() === ("aws-bedrock" as ELLMProvider);
	}

	private buildSystemPrompt(context: ILlmPromptContext): string {
		const lang: string = context.language ?? "en";

		const languageInstructions: Record<string, string> = {
			de: "Erstellen Sie die README auf Deutsch.",
			en: "Generate the README in English.",
			es: "Genera el README en español.",
			fr: "Générez le README en français.",
			ru: "Создайте README на русском языке.",
		};

		return `You are a creative technical writer tasked with generating an engaging README for a software project. Based on the provided details, generate a complete README structure in JSON format with imaginative and compelling content. ${languageInstructions[lang] ?? languageInstructions.en}

The JSON must follow this structure:
{
  "title": string,             // Project name, can include emoji but no separators
  "short_description": string, // Subtitle/tagline to be shown below title
  "long_description": string,  // Detailed overview with real-world use cases
  "logoUrl": string,           // Suggest a thematic image URL or leave empty for default
  "badges": [                  // Relevant tech stack badges
    {
      "name": string,
      "color": string,
      "logo": string,
      "logoColor": string
    }
  ],
  "features": string[],        // List of compelling features with benefits
  "installation": string,      // Clear step-by-step instructions
  "usage": string,             // Detailed usage with multiple code examples
  "roadmap": string,           // Future development possibilities as markdown table
  "faq": string,               // Anticipated user questions and answers
  "license": string            // License information
}

IMPORTANT: In the "usage" field, provide a rich, detailed usage section with multiple subsections, code blocks, and examples.
For the roadmap field, create a markdown table with columns: | Task / Feature | Status |
ONLY JSON OBJECT IN RESPONSE WITH NO ANY ADDITIONAL TEXT.`;
	}

	private buildUserPrompt(context: ILlmPromptContext): string {
		const { changelogContent, projectContext, repositoryInfo }: ILlmPromptContext = context;

		let prompt: string = `Generate a comprehensive README for the following project:

Project information:
- Name: "${repositoryInfo.getName()}"
- Description: "${repositoryInfo.getDescription()}"
- Code stats: "${repositoryInfo.getCodeStats()}"`;

		if (repositoryInfo.getOwner()) {
			prompt += `\n- Owner: "${repositoryInfo.getOwner()}"`;
		}

		if (projectContext) {
			prompt += `\n\nAdditional Project Context:\n${projectContext}`;
		}

		if (changelogContent) {
			prompt += `\n\nCHANGELOG file contents:\n${changelogContent}`;
		}

		prompt += "\n\nCreate an engaging narrative around this project. Infer the project's purpose, potential applications, and target audience from the available information.";

		return prompt;
	}

	private parseReadmeResponse(content: string): Readme {
		try {
			// Clean up the content - remove any markdown code blocks if present
			let cleanContent: string = content.trim();
			cleanContent = cleanContent.replace(/^```(?:json)?\s*/i, "").replace(/```$/m, "");

			interface IReadmeJson {
				badges: Array<{
					color: string;
					logo: string;
					logoColor: string;
					name: string;
				}>;
				faq: string;
				features: Array<string>;
				installation: string;
				license: string;
				logoUrl: string;
				long_description: string;
				roadmap: string;
				short_description: string;
				title: string;
				usage: string;
			}

			const parsed: IReadmeJson = JSON.parse(cleanContent) as IReadmeJson;

			// Validate required fields
			if (!parsed.title || !parsed.short_description) {
				throw new Error("Missing required fields in response");
			}

			// Create Badge objects
			const badges: Array<Badge> = parsed.badges?.map((b: IReadmeJson["badges"][0]) => new Badge(b.name, b.color, b.logo, b.logoColor)) ?? [];

			// Build the final README content
			const readmeContent: string = this.README_BUILDER.build({
				badges,
				faq: parsed.faq || "",
				features: parsed.features || [],
				installation: parsed.installation || "",
				license: parsed.license || "MIT",
				logoUrl: parsed.logoUrl,
				longDescription: parsed.long_description,
				roadmap: parsed.roadmap || "",
				shortDescription: parsed.short_description,
				title: parsed.title,
				usage: parsed.usage || "",
			});

			return new Readme({
				badges,
				content: readmeContent,
				faq: parsed.faq || "",
				features: parsed.features || [],
				installation: parsed.installation || "",
				license: parsed.license || "MIT",
				logoUrl: parsed.logoUrl || "",
				longDescription: parsed.long_description,
				roadmap: parsed.roadmap || "",
				shortDescription: parsed.short_description,
				title: parsed.title,
				usage: parsed.usage || "",
			});
		} catch (error) {
			throw new Error(`Failed to parse README response: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}
}
