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
		// Clear environment variables
		delete process.env.OPENAI_API_KEY;
		delete process.env.ANTHROPIC_API_KEY;
		delete process.env.GOOGLE_API_KEY;
		delete process.env.AZURE_OPENAI_API_KEY;
		delete process.env.AWS_BEDROCK_API_KEY;
		delete process.env.OLLAMA_API_KEY;
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
				.mockResolvedValueOnce("https://myazure.openai.azure.com");
			// Mock model selection
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce("gpt-4-deployment");

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
			vi.mocked(mockCliInterface.prompt)
				.mockResolvedValueOnce("aws-access-key-id")
				.mockResolvedValueOnce("aws-secret-access-key")
				.mockResolvedValueOnce("us-east-1");

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getProvider()).toBe(ELLMProvider.AWS_BEDROCK);
			const parsedCredentials = JSON.parse(result.getApiKey().getValue());
			expect(parsedCredentials.accessKeyId).toBe("aws-access-key-id");
			expect(parsedCredentials.secretAccessKey).toBe("aws-secret-access-key");
			expect(parsedCredentials.region).toBe("us-east-1");
			expect(result.getModel()).toBe(EAWSBedrockModel.CLAUDE_3_5_SONNET);
		});

		it("should configure AWS Bedrock provider with custom model", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select)
				.mockResolvedValueOnce(ELLMProvider.AWS_BEDROCK)
				.mockResolvedValueOnce("custom");
			vi.mocked(mockCliInterface.prompt)
				.mockResolvedValueOnce("aws-access-key-id")
				.mockResolvedValueOnce("aws-secret-access-key")
				.mockResolvedValueOnce("us-west-2")
				.mockResolvedValueOnce("custom.model.id");

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getModel()).toBe("custom.model.id");
			const parsedCredentials = JSON.parse(result.getApiKey().getValue());
			expect(parsedCredentials.region).toBe("us-west-2");
		});

		it("should configure Ollama provider without API key", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.OLLAMA);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("http://localhost:11434");
			// Mock model selection
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce("llama2");

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getProvider()).toBe(ELLMProvider.OLLAMA);
			expect(result.getApiKey().getValue()).toBe("ollama-local"); // Placeholder value for Ollama
			expect(result.getModel()).toBe("llama2");
			expect(result.getBaseUrl()).toBe("http://localhost:11434");
		});

		it("should use default values when empty input provided", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.OLLAMA);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("http://localhost:11434");
			// Mock model selection
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce("llama2");

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
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("test-api-key");
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(EOpenAIModel.GPT_4O);

			// Act
			await useCase.execute();

			// Assert
			const modelSelectCall = vi.mocked(mockCliInterface.select).mock.calls[1];
			expect(modelSelectCall[0]).toBe("Select OpenAI model:");
			expect(modelSelectCall[1]).toHaveLength(12); // Updated to match new model count
			expect(modelSelectCall[1].map(opt => opt.value)).toContain(EOpenAIModel.GPT_4O);
			expect(modelSelectCall[1].map(opt => opt.value)).toContain(EOpenAIModel.GPT_3_5_TURBO);
		});

		it("should show all Anthropic models", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.ANTHROPIC);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("test-api-key");
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(EAnthropicModel.CLAUDE_3_5_SONNET);

			// Act
			await useCase.execute();

			// Assert
			const modelSelectCall = vi.mocked(mockCliInterface.select).mock.calls[1];
			expect(modelSelectCall[0]).toBe("Select Anthropic model:");
			expect(modelSelectCall[1]).toHaveLength(8); // Updated to match new model count
		});

		it("should show all Google models", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.GOOGLE);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("test-api-key");
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(EGoogleModel.GEMINI_1_5_FLASH);

			// Act
			await useCase.execute();

			// Assert
			const modelSelectCall = vi.mocked(mockCliInterface.select).mock.calls[1];
			expect(modelSelectCall[0]).toBe("Select Google model:");
			expect(modelSelectCall[1]).toHaveLength(15); // Updated to match new model count
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

	describe("environment variable handling", () => {
		it("should use OpenAI API key from environment variable", async () => {
			// Arrange
			process.env.OPENAI_API_KEY = "env-openai-key";
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.OPENAI);
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(EOpenAIModel.GPT_4O);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getApiKey().getValue()).toBe("env-openai-key");
			expect(mockCliInterface.success).toHaveBeenCalledWith("Found API key in environment variable: OPENAI_API_KEY");
			expect(mockCliInterface.prompt).not.toHaveBeenCalledWith("Enter openai API key:");
		});

		it("should use Anthropic API key from environment variable", async () => {
			// Arrange
			process.env.ANTHROPIC_API_KEY = "env-anthropic-key";
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.ANTHROPIC);
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(EAnthropicModel.CLAUDE_3_5_SONNET);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getApiKey().getValue()).toBe("env-anthropic-key");
			expect(mockCliInterface.success).toHaveBeenCalledWith("Found API key in environment variable: ANTHROPIC_API_KEY");
		});

		it("should use AWS Bedrock credentials from environment variable", async () => {
			// Arrange
			process.env.AWS_BEDROCK_API_KEY = "us-east-1|access-key|secret-key";
			vi.mocked(mockCliInterface.select)
				.mockResolvedValueOnce(ELLMProvider.AWS_BEDROCK)
				.mockResolvedValueOnce(EAWSBedrockModel.CLAUDE_3_5_SONNET);

			// Act
			const result = await useCase.execute();

			// Assert
			const parsedCredentials = JSON.parse(result.getApiKey().getValue());
			expect(parsedCredentials.accessKeyId).toBe("access-key");
			expect(parsedCredentials.secretAccessKey).toBe("secret-key");
			expect(parsedCredentials.region).toBe("us-east-1");
			expect(mockCliInterface.success).toHaveBeenCalledWith("Found AWS Bedrock credentials in environment variable: AWS_BEDROCK_API_KEY");
		});

		it("should prompt for AWS Bedrock credentials if environment variable has invalid format", async () => {
			// Arrange
			process.env.AWS_BEDROCK_API_KEY = "invalid-format";
			vi.mocked(mockCliInterface.select)
				.mockResolvedValueOnce(ELLMProvider.AWS_BEDROCK)
				.mockResolvedValueOnce(EAWSBedrockModel.CLAUDE_3_5_SONNET);
			vi.mocked(mockCliInterface.prompt)
				.mockResolvedValueOnce("access-key-id")
				.mockResolvedValueOnce("secret-access-key")
				.mockResolvedValueOnce("us-west-2");

			// Act
			const result = await useCase.execute();

			// Assert
			expect(mockCliInterface.info).toHaveBeenCalledWith("Invalid AWS Bedrock credentials format in AWS_BEDROCK_API_KEY. Expected format: region|access-key-id|secret-access-key");
			const parsedCredentials = JSON.parse(result.getApiKey().getValue());
			expect(parsedCredentials.accessKeyId).toBe("access-key-id");
		});

		it("should use Azure OpenAI configuration from environment variable", async () => {
			// Arrange
			process.env.AZURE_OPENAI_API_KEY = "https://myazure.openai.azure.com|azure-key|deployment";
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.AZURE_OPENAI);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("gpt-4-deployment");

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getApiKey().getValue()).toBe("azure-key");
			expect(result.getBaseUrl()).toBe("https://myazure.openai.azure.com");
			expect(mockCliInterface.success).toHaveBeenCalledWith("Using Azure OpenAI endpoint from environment variable");
		});

		it("should prompt for API key when environment variable is not set", async () => {
			// Arrange
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.GOOGLE);
			vi.mocked(mockCliInterface.prompt).mockResolvedValueOnce("manual-google-key");
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(EGoogleModel.GEMINI_1_5_FLASH);

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getApiKey().getValue()).toBe("manual-google-key");
			expect(mockCliInterface.info).toHaveBeenCalledWith("API key can be set in GOOGLE_API_KEY environment variable");
		});

		it("should use Ollama configuration from environment variable", async () => {
			// Arrange
			process.env.OLLAMA_API_KEY = "http://remote-ollama:11434";
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce(ELLMProvider.OLLAMA);
			// Mock model selection
			vi.mocked(mockCliInterface.select).mockResolvedValueOnce("llama2");

			// Act
			const result = await useCase.execute();

			// Assert
			expect(result.getProvider()).toBe(ELLMProvider.OLLAMA);
			expect(result.getApiKey().getValue()).toBe("http://remote-ollama:11434");
			expect(result.getBaseUrl()).toBe("http://remote-ollama:11434");
			expect(mockCliInterface.success).toHaveBeenCalledWith("Found Ollama configuration in environment variable: OLLAMA_API_KEY");
			expect(mockCliInterface.prompt).toHaveBeenCalledTimes(0); // Should not prompt for baseUrl
		});
	});
}); 