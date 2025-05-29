import type { ICliInterfaceService, ISelectOption } from "../interface/cli-interface-service.interface.js";

import { EAnthropicModel, EAWSBedrockModel, EGoogleModel, ELLMProvider, EOpenAIModel, LLMConfiguration } from "../../domain/index.js";

/**
 * Use case for configuring LLM settings
 */
export class ConfigureLLMUseCase {
	constructor(private readonly cliInterface: ICliInterfaceService) {}

	/**
	 * Execute the use case
	 * @returns {Promise<LLMConfiguration>} Promise resolving to the LLM configuration
	 */
	async execute(): Promise<LLMConfiguration> {
		// Select provider
		const providerOptions: Array<ISelectOption<ELLMProvider>> = [
			{ label: "OpenAI", value: ELLMProvider.OPENAI },
			{ label: "Anthropic", value: ELLMProvider.ANTHROPIC },
			{ label: "Google", value: ELLMProvider.GOOGLE },
			{ label: "Azure OpenAI", value: ELLMProvider.AZURE_OPENAI },
			{ label: "AWS Bedrock", value: ELLMProvider.AWS_BEDROCK },
			{ label: "Ollama (Local)", value: ELLMProvider.OLLAMA },
		];

		const provider: ELLMProvider = await this.cliInterface.select<ELLMProvider>("Select LLM provider:", providerOptions);

		// Get authentication value
		// eslint-disable-next-line @elsikora/no-secrets/no-pattern-match
		let apiKeyValue: string = "";

		if (provider === ELLMProvider.OLLAMA) {
			// Ollama doesn't require an API key, but our domain model requires a non-empty value
			apiKeyValue = "ollama-local";
		} else {
			apiKeyValue = await this.cliInterface.prompt(`Enter ${provider} API key:`);
		}

		// Select model based on provider
		const model: string = await this.selectModel(provider);

		// Get base URL for custom endpoints
		let baseUrl: string | undefined;

		if (provider === ELLMProvider.OLLAMA || provider === ELLMProvider.AZURE_OPENAI) {
			const defaultUrl: string = provider === ELLMProvider.OLLAMA ? "http://localhost:11434" : "";
			baseUrl = await this.cliInterface.prompt("Enter base URL:", defaultUrl);
		}

		return new LLMConfiguration(apiKeyValue, provider, model, baseUrl);
	}

	private async selectModel(provider: ELLMProvider): Promise<string> {
		switch (provider) {
			case ELLMProvider.ANTHROPIC: {
				const options: Array<ISelectOption> = [
					{ label: "Claude 3.5 Sonnet", value: EAnthropicModel.CLAUDE_3_5_SONNET },
					{ label: "Claude 3.5 Haiku", value: EAnthropicModel.CLAUDE_3_5_HAIKU },
					{ label: "Claude 3 Opus", value: EAnthropicModel.CLAUDE_3_OPUS },
					{ label: "Claude 3 Sonnet", value: EAnthropicModel.CLAUDE_3_SONNET },
					{ label: "Claude 3 Haiku", value: EAnthropicModel.CLAUDE_3_HAIKU },
				];

				return this.cliInterface.select("Select Anthropic model:", options);
			}

			case ELLMProvider.AWS_BEDROCK: {
				const options: Array<ISelectOption> = [
					{ hint: "Latest Claude 3.5 Sonnet", label: "Claude 3.5 Sonnet (Latest)", value: EAWSBedrockModel.CLAUDE_3_5_SONNET },
					{ hint: "Latest Claude 3.5 Haiku", label: "Claude 3.5 Haiku", value: EAWSBedrockModel.CLAUDE_3_5_HAIKU },
					{ hint: "Claude 3 Opus", label: "Claude 3 Opus", value: EAWSBedrockModel.CLAUDE_3_OPUS },
					{ hint: "Claude 3 Sonnet", label: "Claude 3 Sonnet", value: EAWSBedrockModel.CLAUDE_3_SONNET },
					{ hint: "Claude 3 Haiku", label: "Claude 3 Haiku", value: EAWSBedrockModel.CLAUDE_3_HAIKU },
					{ hint: "Amazon Titan Express", label: "Titan Text Express", value: EAWSBedrockModel.TITAN_TEXT_EXPRESS },
					{ hint: "Amazon Titan Lite", label: "Titan Text Lite", value: EAWSBedrockModel.TITAN_TEXT_LITE },
					{ hint: "Llama 3.1 8B", label: "Llama 3.1 8B", value: EAWSBedrockModel.LLAMA_3_1_8B },
					{ hint: "Llama 3.1 70B", label: "Llama 3.1 70B", value: EAWSBedrockModel.LLAMA_3_1_70B },
					{ hint: "Mistral 7B", label: "Mistral 7B", value: EAWSBedrockModel.MISTRAL_7B },
					{ hint: "Custom model ID", label: "Other (Enter custom model ID)", value: "custom" },
				];

				const selection: string = await this.cliInterface.select("Select AWS Bedrock model:", options);

				if (selection === "custom") {
					return this.cliInterface.prompt("Enter AWS Bedrock model ID:");
				}

				return selection;
			}

			case ELLMProvider.AZURE_OPENAI: {
				return this.cliInterface.prompt("Enter Azure OpenAI deployment name:");
			}

			case ELLMProvider.GOOGLE: {
				const options: Array<ISelectOption> = [
					{ label: "Gemini 1.5 Flash", value: EGoogleModel.GEMINI_1_5_FLASH },
					{ label: "Gemini 1.5 Flash 8B", value: EGoogleModel.GEMINI_1_5_FLASH_8B },
					{ label: "Gemini 1.5 Pro", value: EGoogleModel.GEMINI_1_5_PRO },
					{ label: "Gemini Pro", value: EGoogleModel.GEMINI_PRO },
				];

				return this.cliInterface.select("Select Google model:", options);
			}

			case ELLMProvider.OLLAMA: {
				return this.cliInterface.prompt("Enter Ollama model name:", "llama2");
			}

			case ELLMProvider.OPENAI: {
				const options: Array<ISelectOption> = [
					{ label: "GPT-4o", value: EOpenAIModel.GPT_4O },
					{ label: "GPT-4o Mini", value: EOpenAIModel.GPT_4O_MINI },
					{ label: "GPT-4 Turbo", value: EOpenAIModel.GPT_4_TURBO },
					{ label: "GPT-4", value: EOpenAIModel.GPT_4 },
					{ label: "GPT-3.5 Turbo", value: EOpenAIModel.GPT_3_5_TURBO },
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
