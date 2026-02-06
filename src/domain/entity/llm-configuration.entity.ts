import type { ELLMProvider } from "../enum/llm-provider.enum";

import { ApiKey } from "../value-object/api-key.value-object";

/**
 * LLM Configuration entity
 */
export class LLMConfiguration {
	private readonly API_KEY: ApiKey;

	private readonly BASE_URL?: string;

	private readonly MODEL: string;

	private readonly PROVIDER: ELLMProvider;

	constructor(apiKey: string, provider: ELLMProvider, model: string, baseUrl?: string) {
		this.API_KEY = new ApiKey(apiKey);
		this.PROVIDER = provider;
		this.MODEL = model;
		this.BASE_URL = baseUrl;
	}

	/**
	 * Get the API key
	 * @returns {ApiKey} The API key
	 */
	getApiKey(): ApiKey {
		return this.API_KEY;
	}

	/**
	 * Get the base URL
	 * @returns {string | undefined} The base URL
	 */
	getBaseUrl(): string | undefined {
		return this.BASE_URL;
	}

	/**
	 * Get the model
	 * @returns {string} The model
	 */
	getModel(): string {
		return this.MODEL;
	}

	/**
	 * Get the provider
	 * @returns {ELLMProvider} The provider
	 */
	getProvider(): ELLMProvider {
		return this.PROVIDER;
	}

	/**
	 * Create a new configuration with a different API key
	 * @param {string} apiKey - The new API key string
	 * @returns {LLMConfiguration} A new configuration with the updated API key
	 */
	withApiKey(apiKey: string): LLMConfiguration {
		return new LLMConfiguration(apiKey, this.PROVIDER, this.MODEL, this.BASE_URL);
	}

	/**
	 * Create a new configuration with a different model
	 * @param {string} model - The new model name
	 * @returns {LLMConfiguration} A new configuration with the updated model
	 */
	withModel(model: string): LLMConfiguration {
		return new LLMConfiguration(this.API_KEY.getValue(), this.PROVIDER, model, this.BASE_URL);
	}

	/**
	 * Create a new configuration with a different provider
	 * @param {ELLMProvider} provider - The new provider
	 * @returns {LLMConfiguration} A new configuration with the updated provider
	 */
	withProvider(provider: ELLMProvider): LLMConfiguration {
		return new LLMConfiguration(this.API_KEY.getValue(), provider, this.MODEL, this.BASE_URL);
	}
}
