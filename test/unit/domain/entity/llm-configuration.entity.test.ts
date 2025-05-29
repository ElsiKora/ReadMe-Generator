import { describe, it, expect } from "vitest";

import { LLMConfiguration } from "../../../../src/domain/entity/llm-configuration.entity.js";
import { ELLMProvider } from "../../../../src/domain/enum/llm-provider.enum.js";

describe("LLMConfiguration Entity", () => {
	it("should create a valid LLM configuration", () => {
		// Arrange
		const apiKey = "test-api-key";
		const provider = ELLMProvider.OPENAI;
		const model = "gpt-4";

		// Act
		const config = new LLMConfiguration(apiKey, provider, model);

		// Assert
		expect(config.getApiKey().getValue()).toBe(apiKey);
		expect(config.getProvider()).toBe(provider);
		expect(config.getModel()).toBe(model);
		expect(config.getBaseUrl()).toBeUndefined();
	});

	it("should create a configuration with base URL", () => {
		// Arrange
		const apiKey = "test-api-key";
		const provider = ELLMProvider.OLLAMA;
		const model = "llama2";
		const baseUrl = "http://localhost:11434";

		// Act
		const config = new LLMConfiguration(apiKey, provider, model, baseUrl);

		// Assert
		expect(config.getBaseUrl()).toBe(baseUrl);
	});

	it("should throw error for empty API key", () => {
		// Arrange
		const provider = ELLMProvider.OPENAI;
		const model = "gpt-4";

		// Act & Assert
		expect(() => new LLMConfiguration("", provider, model)).toThrow("API key cannot be empty");
	});
});
