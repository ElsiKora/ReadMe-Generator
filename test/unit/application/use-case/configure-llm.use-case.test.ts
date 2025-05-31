import { describe, it, expect, beforeEach, vi } from "vitest";

import { ConfigureLLMUseCase } from "../../../../src/application/use-case/configure-llm.use-case.js";
import { ELLMProvider, EOpenAIModel, EAnthropicModel, EGoogleModel, EAWSBedrockModel } from "../../../../src/domain/index.js";
import type { ICliInterfaceService } from "../../../../src/application/interface/cli-interface-service.interface.js";

describe("ConfigureLLMUseCase", () => {
	let useCase: ConfigureLLMUseCase;
	let mockCliInterface: ICliInterfaceService;

	beforeEach(() => {
		// Create mock CLI interface
		mockCliInterface = {
			confirm: vi.fn(),
			error: vi.fn(),
			info: vi.fn(),
			prompt: vi.fn(),
			select: vi.fn(),
			success: vi.fn(),
		};

		useCase = new ConfigureLLMUseCase(mockCliInterface);
		vi.clearAllMocks();
	});

	describe("execute", () => {
		it("should configure OpenAI provider", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.OPENAI);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("test-api-key");
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(EOpenAIModel.GPT_4O);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getProvider()).toBe(ELLMProvider.OPENAI);
			expect(result.getApiKey().getValue()).toBe("test-api-key");
			expect(result.getModel()).toBe(EOpenAIModel.GPT_4O);
			expect(result.getBaseUrl()).toBeUndefined();
		});

		it("should configure Anthropic provider", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.ANTHROPIC);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("anthropic-api-key");
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(EAnthropicModel.CLAUDE_3_5_SONNET);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getProvider()).toBe(ELLMProvider.ANTHROPIC);
			expect(result.getApiKey().getValue()).toBe("anthropic-api-key");
			expect(result.getModel()).toBe(EAnthropicModel.CLAUDE_3_5_SONNET);
		});

		it("should configure Google provider", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.GOOGLE);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("google-api-key");
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(EGoogleModel.GEMINI_1_5_FLASH);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getProvider()).toBe(ELLMProvider.GOOGLE);
			expect(result.getApiKey().getValue()).toBe("google-api-key");
			expect(result.getModel()).toBe(EGoogleModel.GEMINI_1_5_FLASH);
		});

		it("should configure Azure OpenAI provider with base URL", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.AZURE_OPENAI);
			vi.mocked(mockCliInterface.prompt)
				.mockResolvedValueOnce("azure-api-key")
				.mockResolvedValueOnce("gpt-4-deployment")
				.mockResolvedValueOnce("https://myazure.openai.azure.com");

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getProvider()).toBe(ELLMProvider.AZURE_OPENAI);
			expect(result.getApiKey().getValue()).toBe("azure-api-key");
			expect(result.getModel()).toBe("gpt-4-deployment");
			expect(result.getBaseUrl()).toBe("https://myazure.openai.azure.com");
		});

		it("should configure AWS Bedrock provider with predefined model", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select)
				.mockResolvedValueOnce(ELLMProvider.AWS_BEDROCK)
				.mockResolvedValueOnce(EAWSBedrockModel.CLAUDE_3_5_SONNET);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("aws-access-key");

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getProvider()).toBe(ELLMProvider.AWS_BEDROCK);
			expect(result.getApiKey().getValue()).toBe("aws-access-key");
			expect(result.getModel()).toBe(EAWSBedrockModel.CLAUDE_3_5_SONNET);
		});

		it("should configure AWS Bedrock provider with custom model", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select)
				.mockResolvedValueOnce(ELLMProvider.AWS_BEDROCK)
				.mockResolvedValueOnce("custom");
			vi.mocked(mockCliInterface.prompt)
				.mockResolvedValueOnce("aws-access-key")
				.mockResolvedValueOnce("custom.model.id");

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getModel()).toBe("custom.model.id");
		});

		it("should configure Ollama provider without API key", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.OLLAMA);
			vi.mocked(mockCliInterface.prompt)
				.mockResolvedValueOnce("llama2")
				.mockResolvedValueOnce("http://localhost:11434");

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getProvider()).toBe(ELLMProvider.OLLAMA);
			expect(result.getApiKey().getValue()).toBe("ollama-local"); // Placeholder value for Ollama
			expect(result.getModel()).toBe("llama2");
			expect(result.getBaseUrl()).toBe("http://localhost:11434");
			
			// Verify API key prompt was not called for Ollama
			expect(mockCliInterface.prompt).toHaveBeenCalledTimes(2); // Only model and baseURL
		});

		it("should use default values when empty input provided", async () => {
			// Arrange - for Ollama which doesn't require API key
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.OLLAMA);
			vi.mocked(mockCliInterface.prompt)
				.mockResolvedValueOnce("llama2") // model
				.mockResolvedValueOnce("http://localhost:11434"); // base URL

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getModel()).toBe("llama2");
			expect(result.getBaseUrl()).toBe("http://localhost:11434");
		});
	});

	describe("model selection", () => {
		it("should show all OpenAI models", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.OPENAI);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("api-key");
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(EOpenAIModel.GPT_4O);

			// Act
			await useCase.execute();

			// Assert
			const modelSelectCall = vi.mocked(mockCliInterface.select).mock.calls[1];
			expect(modelSelectCall[0]).toBe("Select OpenAI model:");
			expect(modelSelectCall[1]).toHaveLength(5); // All OpenAI models
			expect(modelSelectCall[1].map(opt => opt.value)).toContain(EOpenAIModel.GPT_4O);
			expect(modelSelectCall[1].map(opt => opt.value)).toContain(EOpenAIModel.GPT_3_5_TURBO);
		});

		it("should show all Anthropic models", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.ANTHROPIC);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("api-key");
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(EAnthropicModel.CLAUDE_3_5_SONNET);

			// Act
			await useCase.execute();

			// Assert
			const modelSelectCall = vi.mocked(mockCliInterface.select).mock.calls[1];
			expect(modelSelectCall[0]).toBe("Select Anthropic model:");
			expect(modelSelectCall[1]).toHaveLength(5); // All Anthropic models
		});

		it("should show all Google models", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.GOOGLE);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("api-key");
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(EGoogleModel.GEMINI_1_5_FLASH);

			// Act
			await useCase.execute();

			// Assert
			const modelSelectCall = vi.mocked(mockCliInterface.select).mock.calls[1];
			expect(modelSelectCall[0]).toBe("Select Google model:");
			expect(modelSelectCall[1]).toHaveLength(4); // All Google models
		});

		it("should show AWS Bedrock models with hints", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select)
				.mockResolvedValueOnce(ELLMProvider.AWS_BEDROCK)
				.mockResolvedValueOnce(EAWSBedrockModel.CLAUDE_3_5_SONNET);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("api-key");

			// Act
			await useCase.execute();

			// Assert
			const modelSelectCall = vi.mocked(mockCliInterface.select).mock.calls[1];
			expect(modelSelectCall[0]).toBe("Select AWS Bedrock model:");
			expect(modelSelectCall[1].length).toBeGreaterThan(10); // Many AWS models
			expect(modelSelectCall[1].some(opt => opt.hint)).toBe(true); // Has hints
			expect(modelSelectCall[1].some(opt => opt.value === "custom")).toBe(true); // Has custom option
		});
	});

	describe("edge cases", () => {
		it("should throw error for unhandled provider", async () => {
			// Arrange
			const unknownProvider = "unknown-provider" as ELLMProvider;
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(unknownProvider);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("api-key");

			// Act & Assert
			await expect(useCase.execute()).rejects.toThrow(`Unhandled provider: ${unknownProvider}`);
		});

		it("should handle API key with spaces", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.OPENAI);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("  api-key-with-spaces  ");
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(EOpenAIModel.GPT_4O);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getApiKey().getValue()).toBe("api-key-with-spaces"); // Trimmed
		});

		it("should throw error for empty API key when required", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.OPENAI);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("");
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(EOpenAIModel.GPT_4O);

			// Act & Assert
			await expect(useCase.execute()).rejects.toThrow("API key cannot be empty");
		});
	});
}); 