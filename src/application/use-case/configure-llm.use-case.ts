import type { ICliInterfaceService, ISelectOption } from "../interface/cli-interface-service.interface.js";
import type { IConfigService } from "../interface/config-service.interface.js";
import type { IConfig } from "../interface/config.interface.js";

import { EAnthropicModel, EAWSBedrockModel, EAzureOpenAIModel, EGoogleModel, ELLMProvider, EOllamaModel, EOpenAIModel, LLMConfiguration } from "../../domain/index.js";

/**
 * Use case for configuring LLM settings
 */
export class ConfigureLLMUseCase {
	constructor(
		private readonly cliInterface: ICliInterfaceService,
		private readonly configService?: IConfigService,
	) {}

	/**
	 * Execute the use case
	 * @returns {Promise<LLMConfiguration>} Promise resolving to the LLM configuration
	 */
	async execute(): Promise<LLMConfiguration> {
		// Check for saved LLM configuration (provider and model only, NOT API key)
		let savedLlmConfig: IConfig["llm"] | undefined;
		let savedProvider: ELLMProvider | undefined;
		let savedModel: string | undefined;

		if (this.configService) {
			const config: IConfig = await this.configService.get();
			savedLlmConfig = config.llm;

			if (savedLlmConfig?.provider && savedLlmConfig?.model) {
				const useSaved: boolean = await this.cliInterface.confirm("Use saved LLM provider and model?");

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
			this.cliInterface.info(`Using saved provider: ${provider}`);
		} else {
			const providerOptions: Array<ISelectOption<ELLMProvider>> = [
				{ label: "OpenAI", value: ELLMProvider.OPENAI },
				{ label: "Anthropic", value: ELLMProvider.ANTHROPIC },
				{ label: "Google", value: ELLMProvider.GOOGLE },
				{ label: "Azure OpenAI", value: ELLMProvider.AZURE_OPENAI },
				{ label: "AWS Bedrock", value: ELLMProvider.AWS_BEDROCK },
				{ label: "Ollama (Local)", value: ELLMProvider.OLLAMA },
			];

			provider = await this.cliInterface.select<ELLMProvider>("Select LLM provider:", providerOptions);
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
				this.cliInterface.success(`Found Ollama configuration in environment variable: ${environmentVariableName}`);
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
					this.cliInterface.success(`Found AWS Bedrock credentials in environment variable: ${environmentVariableName}`);
					apiKeyValue = JSON.stringify({
						accessKeyId: parts[AWS_ACCESS_KEY_INDEX],
						region: parts[AWS_REGION_INDEX],
						secretAccessKey: parts[AWS_SECRET_KEY_INDEX],
					});
				} else {
					this.cliInterface.info(`Invalid AWS Bedrock credentials format in ${environmentVariableName}. Expected format: region|access-key-id|secret-access-key`);
					const accessKeyId: string = await this.cliInterface.prompt("Enter AWS Access Key ID:");
					const secretAccessKey: string = await this.cliInterface.prompt("Enter AWS Secret Access Key:");
					const region: string = await this.cliInterface.prompt("Enter AWS Region:", "us-east-1");

					apiKeyValue = JSON.stringify({
						accessKeyId,
						region,
						secretAccessKey,
					});
				}
			} else {
				this.cliInterface.info(`AWS Bedrock credentials can be set in ${environmentVariableName} environment variable (format: region|access-key-id|secret-access-key)`);
				const accessKeyId: string = await this.cliInterface.prompt("Enter AWS Access Key ID:");
				const secretAccessKey: string = await this.cliInterface.prompt("Enter AWS Secret Access Key:");
				const region: string = await this.cliInterface.prompt("Enter AWS Region:", "us-east-1");

				apiKeyValue = JSON.stringify({
					accessKeyId,
					region,
					secretAccessKey,
				});
			}
		} else {
			// For other providers, check environment variable first
			if (environmentApiKey?.trim()) {
				this.cliInterface.success(`Found API key in environment variable: ${environmentVariableName}`);
				apiKeyValue = environmentApiKey.trim();
			} else {
				this.cliInterface.info(`API key can be set in ${environmentVariableName} environment variable`);
				apiKeyValue = await this.cliInterface.prompt(`Enter ${provider} API key:`);
			}
		}

		// Select model based on provider
		let model: string;

		if (savedModel && savedProvider === provider) {
			model = savedModel;
			this.cliInterface.info(`Using saved model: ${model}`);
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
				baseUrl = await this.cliInterface.prompt("Enter base URL:", defaultUrl);
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

					this.cliInterface.success("Using Azure OpenAI endpoint from environment variable");
				} else {
					baseUrl = await this.cliInterface.prompt("Enter base URL:");
				}
			} else {
				baseUrl = await this.cliInterface.prompt("Enter base URL:");
			}
		}

		const llmConfig: LLMConfiguration = new LLMConfiguration(apiKeyValue, provider, model, baseUrl);

		// Save LLM configuration (provider and model only, NOT API key)
		if (this.configService) {
			await this.configService.setProperty("llm", {
				model,
				provider,
			});
			this.cliInterface.info("💾 LLM provider and model saved");
		}

		return llmConfig;
	}

	private async selectModel(provider: ELLMProvider): Promise<string> {
		switch (provider) {
			case ELLMProvider.ANTHROPIC: {
				const options: Array<ISelectOption> = [
					{ label: "Claude Opus 4 (Latest 2025, most capable)", value: EAnthropicModel.CLAUDE_OPUS_4 },
					{ label: "Claude Sonnet 4 (Latest 2025, high-performance)", value: EAnthropicModel.CLAUDE_SONNET_4 },
					{ label: "Claude 3.7 Sonnet (Extended thinking)", value: EAnthropicModel.CLAUDE_3_7_SONNET },
					{ label: "Claude 3.5 Sonnet (Previous flagship)", value: EAnthropicModel.CLAUDE_3_5_SONNET },
					{ label: "Claude 3.5 Haiku (Fastest)", value: EAnthropicModel.CLAUDE_3_5_HAIKU },
					{ label: "Claude 3 Opus (Complex tasks)", value: EAnthropicModel.CLAUDE_3_OPUS },
					{ label: "Claude 3 Sonnet", value: EAnthropicModel.CLAUDE_3_SONNET },
					{ label: "Claude 3 Haiku", value: EAnthropicModel.CLAUDE_3_HAIKU },
				];

				return this.cliInterface.select("Select Anthropic model:", options);
			}

			case ELLMProvider.AWS_BEDROCK: {
				const options: Array<ISelectOption> = [
					{ hint: "Latest Claude 4 Opus", label: "Claude Opus 4 (Latest 2025, most capable)", value: EAWSBedrockModel.CLAUDE_OPUS_4 },
					{ hint: "Latest Claude 4 Sonnet", label: "Claude Sonnet 4 (Latest 2025, balanced)", value: EAWSBedrockModel.CLAUDE_SONNET_4 },
					{ hint: "Claude 3.5 Sonnet v2", label: "Claude 3.5 Sonnet v2 (Previous flagship)", value: EAWSBedrockModel.CLAUDE_3_5_SONNET_V2 },
					{ hint: "Claude 3.5 Haiku", label: "Claude 3.5 Haiku (Fast)", value: EAWSBedrockModel.CLAUDE_3_5_HAIKU },
					{ hint: "Claude 3.5 Sonnet", label: "Claude 3.5 Sonnet", value: EAWSBedrockModel.CLAUDE_3_5_SONNET },
					{ hint: "Claude 3 Opus", label: "Claude 3 Opus", value: EAWSBedrockModel.CLAUDE_3_OPUS },
					{ hint: "Claude 3 Sonnet", label: "Claude 3 Sonnet", value: EAWSBedrockModel.CLAUDE_3_SONNET },
					{ hint: "Claude 3 Haiku", label: "Claude 3 Haiku", value: EAWSBedrockModel.CLAUDE_3_HAIKU },
					{ hint: "Amazon Nova Pro", label: "Amazon Nova Pro (Latest Amazon model)", value: EAWSBedrockModel.NOVA_PRO },
					{ hint: "Amazon Nova Lite", label: "Amazon Nova Lite", value: EAWSBedrockModel.NOVA_LITE },
					{ hint: "DeepSeek R1", label: "DeepSeek R1 (Advanced reasoning)", value: EAWSBedrockModel.DEEPSEEK_R1 },
					{ hint: "Llama 3.2 90B", label: "Llama 3.2 90B (Open source)", value: EAWSBedrockModel.LLAMA_3_2_90B },
					{ hint: "Llama 3.2 11B", label: "Llama 3.2 11B", value: EAWSBedrockModel.LLAMA_3_2_11B },
					{ hint: "Llama 3.1 405B", label: "Llama 3.1 405B", value: EAWSBedrockModel.LLAMA_3_1_405B },
					{ hint: "Llama 3.1 70B", label: "Llama 3.1 70B", value: EAWSBedrockModel.LLAMA_3_1_70B },
					{ hint: "Llama 3.1 8B", label: "Llama 3.1 8B", value: EAWSBedrockModel.LLAMA_3_1_8B },
					{ hint: "Mistral Large", label: "Mistral Large (Latest)", value: EAWSBedrockModel.MISTRAL_LARGE_2_24_11 },
					{ hint: "Mistral Small", label: "Mistral Small", value: EAWSBedrockModel.MISTRAL_SMALL },
					{ hint: "Amazon Titan Express", label: "Titan Text Express", value: EAWSBedrockModel.TITAN_TEXT_EXPRESS },
					{ hint: "Amazon Titan Lite", label: "Titan Text Lite", value: EAWSBedrockModel.TITAN_TEXT_LITE },
					{ hint: "Custom model ID", label: "Other (Enter custom model ID)", value: "custom" },
				];

				const selection: string = await this.cliInterface.select("Select AWS Bedrock model:", options);

				if (selection === "custom") {
					return this.cliInterface.prompt("Enter AWS Bedrock model ID:");
				}

				return selection;
			}

			case ELLMProvider.AZURE_OPENAI: {
				const options: Array<ISelectOption> = [
					{ label: "GPT-4.1 Turbo (Latest 2025, most capable)", value: EAzureOpenAIModel.GPT_4_1_TURBO_2024_12_17 },
					{ label: "GPT-4.1 Preview (Latest preview)", value: EAzureOpenAIModel.GPT_4_1_PREVIEW_2024_12_17 },
					{ label: "GPT-4.1 Mini (Fast 4.1 model)", value: EAzureOpenAIModel.GPT_4_1_MINI_2024_12_17 },
					{ label: "GPT-4o 2024-11 (Enhanced creative)", value: EAzureOpenAIModel.GPT_4O_2024_11_20 },
					{ label: "GPT-4o Mini", value: EAzureOpenAIModel.GPT_4O_MINI_2024_07_18 },
					{ label: "GPT-4 Turbo", value: EAzureOpenAIModel.GPT_4_TURBO },
					{ label: "GPT-3.5 Turbo", value: EAzureOpenAIModel.GPT_35_TURBO },
					{ label: "O3 (Enhanced reasoning)", value: EAzureOpenAIModel.O3_2024_12_17 },
					{ label: "O4 Mini (Fast reasoning)", value: EAzureOpenAIModel.O4_MINI_2024_12_17 },
					{ label: "Custom Deployment", value: "custom" },
				];

				const selection: string = await this.cliInterface.select("Select Azure OpenAI model:", options);

				if (selection === "custom") {
					return this.cliInterface.prompt("Enter Azure OpenAI deployment name:");
				}

				return selection;
			}

			case ELLMProvider.GOOGLE: {
				const options: Array<ISelectOption> = [
					{ label: "Gemini 2.5 Pro (Latest 2025, most capable)", value: EGoogleModel.GEMINI_2_5_PRO },
					{ label: "Gemini 2.5 Flash (Latest 2025, fast)", value: EGoogleModel.GEMINI_2_5_FLASH },
					{ label: "Gemini 2.0 Flash (Experimental)", value: EGoogleModel.GEMINI_2_0_FLASH_EXP },
					{ label: "Gemini 1.5 Pro (Stable, capable)", value: EGoogleModel.GEMINI_1_5_PRO },
					{ label: "Gemini 1.5 Flash (Fast, stable)", value: EGoogleModel.GEMINI_1_5_FLASH },
					{ label: "Gemini 1.5 Flash 8B (Lightweight)", value: EGoogleModel.GEMINI_1_5_FLASH_8B },
					{ label: "Gemini 1.0 Pro", value: EGoogleModel.GEMINI_1_0_PRO },
					{ label: "Gemma 3 27B (Most capable open model)", value: EGoogleModel.GEMMA_3_27B },
					{ label: "Gemma 3 12B (Strong language model)", value: EGoogleModel.GEMMA_3_12B },
					{ label: "Gemma 3 4B (Balanced, multimodal)", value: EGoogleModel.GEMMA_3_4B },
					{ label: "Gemma 3 1B (Lightweight)", value: EGoogleModel.GEMMA_3_1B },
				];

				return this.cliInterface.select("Select Google model:", options);
			}

			case ELLMProvider.OLLAMA: {
				const options: Array<ISelectOption> = [
					{ label: "Llama 3.2 (Latest)", value: EOllamaModel.LLAMA3_2 },
					{ label: "Llama 3.1", value: EOllamaModel.LLAMA3_1 },
					{ label: "Llama 3", value: EOllamaModel.LLAMA3 },
					{ label: "Llama 2", value: EOllamaModel.LLAMA2 },
					{ label: "Mistral", value: EOllamaModel.MISTRAL },
					{ label: "Mixtral", value: EOllamaModel.MIXTRAL },
					{ label: "Gemma 2", value: EOllamaModel.GEMMA2 },
					{ label: "Phi 3", value: EOllamaModel.PHI3 },
					{ label: "Qwen 2.5", value: EOllamaModel.QWEN2_5 },
					{ label: "CodeLlama", value: EOllamaModel.CODELLAMA },
					{ label: "DeepSeek Coder", value: EOllamaModel.DEEPSEEK_CODER },
					{ label: "Custom Model", value: EOllamaModel.CUSTOM },
				];

				const selection: string = await this.cliInterface.select("Select Ollama model:", options);

				if (selection === "custom") {
					return this.cliInterface.prompt("Enter Ollama model name:");
				}

				return selection;
			}

			case ELLMProvider.OPENAI: {
				const options: Array<ISelectOption> = [
					{ label: "GPT-4.1 (Latest 2025, most capable)", value: EOpenAIModel.GPT_4_1 },
					{ label: "GPT-4.1 Nano (Fastest 4.1 model)", value: EOpenAIModel.GPT_4_1_NANO },
					{ label: "GPT-4.1 Mini", value: EOpenAIModel.GPT_4_1_MINI },
					{ label: "GPT-4o (Latest, enhanced creative writing)", value: EOpenAIModel.GPT_4O },
					{ label: "GPT-4o Mini (Faster, cheaper)", value: EOpenAIModel.GPT_4O_MINI },
					{ label: "GPT-4 Turbo", value: EOpenAIModel.GPT_4_TURBO },
					{ label: "GPT-4 (Original)", value: EOpenAIModel.GPT_4 },
					{ label: "GPT-3.5 Turbo (Fastest, cheapest)", value: EOpenAIModel.GPT_3_5_TURBO },
					{ label: "O1 (Enhanced reasoning)", value: EOpenAIModel.O1 },
					{ label: "O1 Mini (Fast reasoning)", value: EOpenAIModel.O1_MINI },
					{ label: "O3 (Enhanced reasoning)", value: EOpenAIModel.O3 },
					{ label: "O3 Mini", value: EOpenAIModel.O3_MINI },
				];

				return this.cliInterface.select("Select OpenAI model:", options);
			}

			default: {
				// This should never happen due to exhaustive check
				throw new Error(`Unhandled provider: ${provider as string}`);
			}
		}
	}
}
