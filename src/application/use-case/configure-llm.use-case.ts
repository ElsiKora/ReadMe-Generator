import type { ICliInterfaceService } from "../interface/cli-interface-service.interface";
import type { IConfigService } from "../interface/config-service.interface";
import type { IConfig } from "../interface/config.interface";

import { EAnthropicModel, EAWSBedrockModel, EAzureOpenAIModel, EGoogleModel, ELLMProvider, EOllamaModel, EOpenAIModel, LLMConfiguration } from "../../domain/index";

/**
 * Use case for configuring LLM settings
 */
export class ConfigureLLMUseCase {
	private readonly CLI_INTERFACE: ICliInterfaceService;

	private readonly CONFIG_SERVICE?: IConfigService;

	constructor(cliInterface: ICliInterfaceService, configService?: IConfigService) {
		this.CLI_INTERFACE = cliInterface;
		this.CONFIG_SERVICE = configService;
	}

	/**
	 * Execute the use case
	 * @returns {Promise<LLMConfiguration>} Promise resolving to the LLM configuration
	 */
	async execute(): Promise<LLMConfiguration> {
		// Check for saved LLM configuration (provider and model only, NOT API key)
		let savedLlmConfig: IConfig["llm"] | undefined;
		let savedProvider: ELLMProvider | undefined;
		let savedModel: string | undefined;

		if (this.CONFIG_SERVICE) {
			const config: IConfig = await this.CONFIG_SERVICE.get();
			savedLlmConfig = config.llm;

			if (savedLlmConfig?.provider && savedLlmConfig?.model) {
				const useSaved: boolean = await this.CLI_INTERFACE.confirm("Use saved LLM provider and model?");

				if (useSaved) {
					savedProvider = savedLlmConfig.provider as ELLMProvider;
					savedModel = savedLlmConfig.model;
				}
			}
		}

		// Select provider
		let provider: ELLMProvider;

		if (savedProvider) {
			provider = savedProvider;
			this.CLI_INTERFACE.info(`Using saved provider: ${provider}`);
		} else {
			provider = await this.CLI_INTERFACE.select<ELLMProvider>("Select LLM provider:", [
				{ label: "OpenAI (GPT-5, GPT-4o)", value: ELLMProvider.OPENAI },
				{ label: "Anthropic (Claude)", value: ELLMProvider.ANTHROPIC },
				{ label: "Google (Gemini)", value: ELLMProvider.GOOGLE },
				{ label: "Azure OpenAI", value: ELLMProvider.AZURE_OPENAI },
				{ label: "AWS Bedrock", value: ELLMProvider.AWS_BEDROCK },
				{ label: "Ollama (Local)", value: ELLMProvider.OLLAMA },
			]);
		}

		// Get authentication value
		// eslint-disable-next-line @elsikora/no-secrets/no-pattern-match
		let apiKeyValue: string = "";

		// Define environment variable names
		const environmentVariableNames: Record<string, string> = {
			[ELLMProvider.ANTHROPIC]: "ANTHROPIC_API_KEY",
			[ELLMProvider.AWS_BEDROCK]: "AWS_BEDROCK_API_KEY",
			[ELLMProvider.AZURE_OPENAI]: "AZURE_OPENAI_API_KEY",
			[ELLMProvider.GOOGLE]: "GOOGLE_API_KEY",
			[ELLMProvider.OLLAMA]: "OLLAMA_API_KEY",
			[ELLMProvider.OPENAI]: "OPENAI_API_KEY",
		};

		const environmentVariableName: string = environmentVariableNames[provider] ?? "";
		const environmentApiKey: string | undefined = process.env[environmentVariableName];

		// Constants for AWS Bedrock credential parsing
		const AWS_BEDROCK_PARTS_COUNT: number = 3;
		const AZURE_MIN_PARTS_COUNT: number = 2;
		const AWS_REGION_INDEX: number = 0;
		const AWS_ACCESS_KEY_INDEX: number = 1;
		const AWS_SECRET_KEY_INDEX: number = 2;
		const AZURE_ENDPOINT_INDEX: number = 0;
		const AZURE_API_KEY_INDEX: number = 1;

		if (provider === ELLMProvider.OLLAMA) {
			// Ollama can use environment variable for host:port or default value
			if (environmentApiKey?.trim()) {
				this.CLI_INTERFACE.success(`Found Ollama configuration in environment variable: ${environmentVariableName}`);
				apiKeyValue = environmentApiKey.trim();
			} else {
				apiKeyValue = "ollama-local";
			}
		} else if (provider === ELLMProvider.AWS_BEDROCK) {
			// AWS Bedrock requires both access key ID and secret access key
			if (environmentApiKey?.trim()) {
				// Expected format: region|access-key-id|secret-access-key
				const parts: Array<string> = environmentApiKey.trim().split("|");

				if (parts.length === AWS_BEDROCK_PARTS_COUNT) {
					this.CLI_INTERFACE.success(`Found AWS Bedrock credentials in environment variable: ${environmentVariableName}`);
					apiKeyValue = JSON.stringify({
						accessKeyId: parts[AWS_ACCESS_KEY_INDEX],
						region: parts[AWS_REGION_INDEX],
						secretAccessKey: parts[AWS_SECRET_KEY_INDEX],
					});
				} else {
					this.CLI_INTERFACE.info(`Invalid AWS Bedrock credentials format in ${environmentVariableName}. Expected format: region|access-key-id|secret-access-key`);
					const accessKeyId: string = await this.CLI_INTERFACE.prompt("Enter AWS Access Key ID:");
					const secretAccessKey: string = await this.CLI_INTERFACE.prompt("Enter AWS Secret Access Key:");
					const region: string = await this.CLI_INTERFACE.prompt("Enter AWS Region:", "us-east-1");

					apiKeyValue = JSON.stringify({
						accessKeyId,
						region,
						secretAccessKey,
					});
				}
			} else {
				this.CLI_INTERFACE.info(`AWS Bedrock credentials can be set in ${environmentVariableName} environment variable (format: region|access-key-id|secret-access-key)`);
				const accessKeyId: string = await this.CLI_INTERFACE.prompt("Enter AWS Access Key ID:");
				const secretAccessKey: string = await this.CLI_INTERFACE.prompt("Enter AWS Secret Access Key:");
				const region: string = await this.CLI_INTERFACE.prompt("Enter AWS Region:", "us-east-1");

				apiKeyValue = JSON.stringify({
					accessKeyId,
					region,
					secretAccessKey,
				});
			}
		} else {
			// For other providers, check environment variable first
			if (environmentApiKey?.trim()) {
				this.CLI_INTERFACE.success(`Found API key in environment variable: ${environmentVariableName}`);
				apiKeyValue = environmentApiKey.trim();
			} else {
				this.CLI_INTERFACE.info(`API key can be set in ${environmentVariableName} environment variable`);
				apiKeyValue = await this.CLI_INTERFACE.prompt(`Enter ${provider} API key:`);
			}
		}

		// Select model based on provider
		let model: string;

		if (savedModel && savedProvider === provider) {
			model = savedModel;
			this.CLI_INTERFACE.info(`Using saved model: ${model}`);
		} else {
			model = await this.selectModel(provider);
		}

		// Get base URL for custom endpoints
		let baseUrl: string | undefined;

		if (provider === ELLMProvider.OLLAMA) {
			// For Ollama, check if base URL is part of the environment variable
			if (environmentApiKey?.includes("://")) {
				// If environment variable contains a URL, use it as base URL
				baseUrl = environmentApiKey;
			} else {
				const defaultUrl: string = "http://localhost:11434";
				baseUrl = await this.CLI_INTERFACE.prompt("Enter base URL:", defaultUrl);
			}
		} else if (provider === ELLMProvider.AZURE_OPENAI) {
			// Azure OpenAI can have endpoint|api-key|deployment-name format
			if (environmentApiKey?.includes("|")) {
				const parts: Array<string> = environmentApiKey.split("|");

				if (parts.length >= AZURE_MIN_PARTS_COUNT && parts[AZURE_ENDPOINT_INDEX]?.includes("://")) {
					baseUrl = parts[AZURE_ENDPOINT_INDEX];

					if (parts[AZURE_API_KEY_INDEX]) {
						apiKeyValue = parts[AZURE_API_KEY_INDEX];
					}

					this.CLI_INTERFACE.success("Using Azure OpenAI endpoint from environment variable");
				} else {
					baseUrl = await this.CLI_INTERFACE.prompt("Enter base URL:");
				}
			} else {
				baseUrl = await this.CLI_INTERFACE.prompt("Enter base URL:");
			}
		}

		const llmConfig: LLMConfiguration = new LLMConfiguration(apiKeyValue, provider, model, baseUrl);

		// Save LLM configuration (provider and model only, NOT API key)
		if (this.CONFIG_SERVICE) {
			await this.CONFIG_SERVICE.setProperty("llm", {
				model,
				provider,
			});
			this.CLI_INTERFACE.info("💾 LLM provider and model saved");
		}

		return llmConfig;
	}

	private async selectModel(provider: ELLMProvider): Promise<string> {
		switch (provider) {
			case ELLMProvider.ANTHROPIC: {
				return this.CLI_INTERFACE.select<string>(
					"Select Anthropic model:",
					[
						{ label: "Claude Opus 4.6 (Latest, most capable)", value: EAnthropicModel.CLAUDE_OPUS_4_6 },
						{ label: "Claude Opus 4.5 (Most capable)", value: EAnthropicModel.CLAUDE_OPUS_4_5 },
						{ label: "Claude Sonnet 4.5 (Balanced)", value: EAnthropicModel.CLAUDE_SONNET_4_5 },
						{ label: "Claude Haiku 4.5 (Fastest)", value: EAnthropicModel.CLAUDE_HAIKU_4_5 },
						{ label: "Claude Opus 4", value: EAnthropicModel.CLAUDE_OPUS_4 },
						{ label: "Claude Sonnet 4", value: EAnthropicModel.CLAUDE_SONNET_4 },
						{ label: "Claude 3.7 Sonnet (Extended thinking)", value: EAnthropicModel.CLAUDE_3_7_SONNET },
						{ label: "Claude 3.5 Sonnet", value: EAnthropicModel.CLAUDE_3_5_SONNET },
						{ label: "Claude 3.5 Haiku (Fast)", value: EAnthropicModel.CLAUDE_3_5_HAIKU },
					],
					EAnthropicModel.CLAUDE_SONNET_4_5,
				);
			}

			case ELLMProvider.AWS_BEDROCK: {
				const selection: string = await this.CLI_INTERFACE.select<string>(
					"Select AWS Bedrock model:",
					[
						{ label: "Claude Opus 4.6 (Latest, most capable)", value: EAWSBedrockModel.CLAUDE_OPUS_4_6 },
						{ label: "Claude Opus 4.5 (Most capable)", value: EAWSBedrockModel.CLAUDE_OPUS_4_5 },
						{ label: "Claude Sonnet 4.5 (Balanced)", value: EAWSBedrockModel.CLAUDE_SONNET_4_5 },
						{ label: "Claude Haiku 4.5 (Fastest)", value: EAWSBedrockModel.CLAUDE_HAIKU_4_5 },
						{ label: "Claude Opus 4", value: EAWSBedrockModel.CLAUDE_OPUS_4 },
						{ label: "Claude Sonnet 4", value: EAWSBedrockModel.CLAUDE_SONNET_4 },
						{ label: "Claude 3.5 Sonnet v2", value: EAWSBedrockModel.CLAUDE_3_5_SONNET_V2 },
						{ label: "Amazon Nova Pro", value: EAWSBedrockModel.NOVA_PRO },
						{ label: "DeepSeek R1 (Advanced reasoning)", value: EAWSBedrockModel.DEEPSEEK_R1 },
						{ label: "Llama 3.2 90B", value: EAWSBedrockModel.LLAMA_3_2_90B },
						{ label: "Mistral Large", value: EAWSBedrockModel.MISTRAL_LARGE_2_24_11 },
						{ label: "Other (Enter custom model ID)", value: "custom" },
					],
					EAWSBedrockModel.CLAUDE_SONNET_4_5,
				);

				if (selection === "custom") {
					return this.CLI_INTERFACE.prompt("Enter AWS Bedrock model ID:");
				}

				return selection;
			}

			case ELLMProvider.AZURE_OPENAI: {
				const selection: string = await this.CLI_INTERFACE.select<string>(
					"Select Azure OpenAI model:",
					[
						{ label: "GPT-5.2 (Latest, most capable)", value: EAzureOpenAIModel.GPT_5_2 },
						{ label: "GPT-5.2 Pro (Enhanced performance)", value: EAzureOpenAIModel.GPT_5_2_PRO },
						{ label: "GPT-5.1", value: EAzureOpenAIModel.GPT_5_1 },
						{ label: "GPT-5", value: EAzureOpenAIModel.GPT_5 },
						{ label: "GPT-5 Mini (Fast)", value: EAzureOpenAIModel.GPT_5_MINI },
						{ label: "GPT-5 Nano (Fastest)", value: EAzureOpenAIModel.GPT_5_NANO },
						{ label: "GPT-4o", value: EAzureOpenAIModel.GPT_4O },
						{ label: "GPT-4o Mini", value: EAzureOpenAIModel.GPT_4O_MINI },
						{ label: "O3 (Enhanced reasoning)", value: EAzureOpenAIModel.O3 },
						{ label: "O4 Mini (Fast reasoning)", value: EAzureOpenAIModel.O4_MINI },
						{ label: "Custom Deployment", value: "custom" },
					],
					EAzureOpenAIModel.GPT_5_2,
				);

				if (selection === "custom") {
					return this.CLI_INTERFACE.prompt("Enter Azure OpenAI deployment name:");
				}

				return selection;
			}

			case ELLMProvider.GOOGLE: {
				return this.CLI_INTERFACE.select<string>(
					"Select Google model:",
					[
						{ label: "Gemini 3 Pro Preview (Latest)", value: EGoogleModel.GEMINI_3_PRO_PREVIEW },
						{ label: "Gemini 3 Flash Preview (Latest, fast)", value: EGoogleModel.GEMINI_3_FLASH_PREVIEW },
						{ label: "Gemini 2.5 Pro (Most capable)", value: EGoogleModel.GEMINI_2_5_PRO },
						{ label: "Gemini 2.5 Flash (Fast)", value: EGoogleModel.GEMINI_2_5_FLASH },
						{ label: "Gemini 2.5 Flash Lite (Lightweight)", value: EGoogleModel.GEMINI_2_5_FLASH_LITE },
						{ label: "Gemini 2.0 Flash", value: EGoogleModel.GEMINI_2_0_FLASH },
						{ label: "Gemini 2.0 Flash Lite", value: EGoogleModel.GEMINI_2_0_FLASH_LITE },
						{ label: "Gemini 1.5 Pro (Stable)", value: EGoogleModel.GEMINI_1_5_PRO },
						{ label: "Gemini 1.5 Flash (Fast, stable)", value: EGoogleModel.GEMINI_1_5_FLASH },
					],
					EGoogleModel.GEMINI_3_FLASH_PREVIEW,
				);
			}

			case ELLMProvider.OLLAMA: {
				const selection: string = await this.CLI_INTERFACE.select<string>(
					"Select Ollama model:",
					[
						{ label: "Llama 4 (Latest)", value: EOllamaModel.LLAMA4 },
						{ label: "Llama 3.3", value: EOllamaModel.LLAMA3_3 },
						{ label: "Llama 3.2", value: EOllamaModel.LLAMA3_2 },
						{ label: "Llama 3.1", value: EOllamaModel.LLAMA3_1 },
						{ label: "Qwen 3 (Latest Alibaba)", value: EOllamaModel.QWEN3 },
						{ label: "Qwen 3 Coder (Code-focused)", value: EOllamaModel.QWEN3_CODER },
						{ label: "Phi 4 (Microsoft)", value: EOllamaModel.PHI4 },
						{ label: "Gemma 3 (Google)", value: EOllamaModel.GEMMA3 },
						{ label: "Mixtral (Mistral)", value: EOllamaModel.MIXTRAL },
						{ label: "CodeLlama", value: EOllamaModel.CODELLAMA },
						{ label: "Custom Model", value: EOllamaModel.CUSTOM },
					],
					EOllamaModel.LLAMA3_3,
				);

				if (selection === "custom") {
					return this.CLI_INTERFACE.prompt("Enter Ollama model name:");
				}

				return selection;
			}

			case ELLMProvider.OPENAI: {
				return this.CLI_INTERFACE.select<string>(
					"Select OpenAI model:",
					[
						{ label: "GPT-5.2 (Latest, most capable)", value: EOpenAIModel.GPT_5_2 },
						{ label: "GPT-5.2 Pro (Enhanced performance)", value: EOpenAIModel.GPT_5_2_PRO },
						{ label: "GPT-5.1", value: EOpenAIModel.GPT_5_1 },
						{ label: "GPT-5", value: EOpenAIModel.GPT_5 },
						{ label: "GPT-5 Mini (Fast)", value: EOpenAIModel.GPT_5_MINI },
						{ label: "GPT-5 Nano (Fastest)", value: EOpenAIModel.GPT_5_NANO },
						{ label: "GPT-4o", value: EOpenAIModel.GPT_4O },
						{ label: "GPT-4o Mini (Faster, cheaper)", value: EOpenAIModel.GPT_4O_MINI },
						{ label: "O3 (Enhanced reasoning)", value: EOpenAIModel.O3 },
						{ label: "O4 Mini (Fast reasoning)", value: EOpenAIModel.O4_MINI },
						{ label: "GPT-3.5 Turbo (Legacy)", value: EOpenAIModel.GPT_35_TURBO },
					],
					EOpenAIModel.GPT_5_2,
				);
			}

			default: {
				// This ensures exhaustiveness - TypeScript will error if a case is missing
				const exhaustiveCheck: never = provider;

				throw new Error(`Unhandled provider: ${exhaustiveCheck as string}`);
			}
		}
	}
}
