import type { ELLMProvider } from "../enum/llm-provider.enum.js";

import { ApiKey } from "../value-object/api-key.value-object.js";

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
}
