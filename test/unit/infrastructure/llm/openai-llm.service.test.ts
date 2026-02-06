import { describe, it, expect, beforeEach, vi } from "vitest";
import OpenAI from "openai";

import { OpenAILlmService } from "../../../../src/infrastructure/llm/openai-llm.service";
import { LLMConfiguration } from "../../../../src/domain/entity/llm-configuration.entity";
import { ELLMProvider } from "../../../../src/domain/enum/llm-provider.enum";
import { EOpenAIModel } from "../../../../src/domain/enum/openai-model.enum";
import type { ILlmPromptContext } from "../../../../src/application/interface/llm-service.interface";
import type { IPromptBuilder } from "../../../../src/application/interface/prompt-builder.interface";
import type { IReadmeResponseParser } from "../../../../src/application/interface/readme-response-parser.interface";
import { createMockLlmPromptContext } from "../../../helpers/test-utils";
import { Readme } from "../../../../src/domain/entity/readme.entity";

// Mock OpenAI with a proper constructor
vi.mock("openai", () => {
	const MockOpenAI = vi.fn();

	return { default: MockOpenAI };
});

describe("OpenAILlmService", () => {
	let service: OpenAILlmService;
	let mockCreate: ReturnType<typeof vi.fn>;
	let mockPromptBuilder: IPromptBuilder;
	let mockResponseParser: IReadmeResponseParser;

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();

		// Create mock prompt builder
		mockPromptBuilder = {
			buildSystemPrompt: vi.fn().mockReturnValue("System prompt"),
			buildUserPrompt: vi.fn().mockReturnValue("User prompt"),
		};

		// Create mock response parser
		mockResponseParser = {
			parseResponse: vi.fn().mockReturnValue(
				new Readme({
					title: "Test Project",
					shortDescription: "A test project",
					longDescription: "Detailed description",
					logoUrl: "https://example.com/logo.png",
					badges: [],
					features: ["Feature 1", "Feature 2"],
					installation: "npm install",
					usage: "npm start",
					roadmap: "| Task | Status |\n|------|--------|\n| Test | Done |",
					faq: "Q: Test?\nA: Yes",
					license: "MIT",
					content: "Generated README content",
				}),
			),
		};

		// Create service with dependencies
		service = new OpenAILlmService(mockPromptBuilder, mockResponseParser);

		// Setup OpenAI mock - make the constructor return our mock object
		mockCreate = vi.fn();
		vi.mocked(OpenAI).mockImplementation(function () {
			return {
				chat: {
					completions: {
						create: mockCreate,
					},
				},
			} as unknown as OpenAI;
		});
	});

	describe("supports", () => {
		it("should support OpenAI provider", () => {
			// Arrange
			const config = new LLMConfiguration("api-key", ELLMProvider.OPENAI, EOpenAIModel.GPT_5_2);

			// Act
			const result = service.supports(config);

			// Assert
			expect(result).toBe(true);
		});

		it("should not support other providers", () => {
			// Arrange
			const config = new LLMConfiguration("api-key", ELLMProvider.ANTHROPIC, "claude-3");

			// Act
			const result = service.supports(config);

			// Assert
			expect(result).toBe(false);
		});
	});

	describe("generateReadme", () => {
		let mockContext: ILlmPromptContext;
		let mockConfig: LLMConfiguration;

		beforeEach(() => {
			mockContext = createMockLlmPromptContext();
			mockConfig = new LLMConfiguration("test-api-key", ELLMProvider.OPENAI, EOpenAIModel.GPT_5_2);
		});

		it("should generate README successfully", async () => {
			// Arrange
			const mockResponse = {
				choices: [
					{
						message: {
							content: JSON.stringify({
								title: "Test Project",
								short_description: "A test project",
								long_description: "Detailed description",
								logoUrl: "https://example.com/logo.png",
								badges: [{ name: "TypeScript", color: "blue", logo: "typescript", logoColor: "white" }],
								features: ["Feature 1", "Feature 2"],
								installation: "npm install",
								usage: "npm start",
								roadmap: "| Task | Status |\n|------|--------|\n| Test | ✅ |",
								faq: "Q: Test?\nA: Yes",
								license: "MIT",
							}),
						},
					},
				],
			};

			mockCreate.mockResolvedValueOnce(mockResponse);

			// Act
			const result = await service.generateReadme(mockContext, mockConfig);

			// Assert
			expect(result).toBeDefined();
			expect(result.getTitle()).toBe("Test Project");
			expect(result.getShortDescription()).toBe("A test project");
			expect(result.getFeatures()).toEqual(["Feature 1", "Feature 2"]);

			// Verify prompt builder was called
			expect(mockPromptBuilder.buildSystemPrompt).toHaveBeenCalledWith(mockContext);
			expect(mockPromptBuilder.buildUserPrompt).toHaveBeenCalledWith(mockContext);

			// Verify response parser was called
			expect(mockResponseParser.parseResponse).toHaveBeenCalledWith(mockResponse.choices[0].message.content, mockContext);

			// Verify OpenAI was called correctly
			expect(vi.mocked(OpenAI)).toHaveBeenCalledWith({
				apiKey: "test-api-key",
				baseURL: undefined,
			});

			expect(mockCreate).toHaveBeenCalledWith({
				max_tokens: expect.any(Number),
				messages: [
					{ content: "System prompt", role: "system" },
					{ content: "User prompt", role: "user" },
				],
				model: EOpenAIModel.GPT_5_2,
				response_format: { type: "json_object" },
				temperature: expect.any(Number),
			});
		});

		it("should use custom base URL when provided", async () => {
			// Arrange
			const configWithBaseUrl = new LLMConfiguration("test-api-key", ELLMProvider.OPENAI, EOpenAIModel.GPT_5_2, "https://custom.openai.com");

			mockCreate.mockResolvedValueOnce({
				choices: [
					{
						message: {
							content: JSON.stringify({
								title: "Test",
								short_description: "Test",
								badges: [],
								features: [],
							}),
						},
					},
				],
			});

			// Act
			await service.generateReadme(mockContext, configWithBaseUrl);

			// Assert
			expect(vi.mocked(OpenAI)).toHaveBeenCalledWith({
				apiKey: "test-api-key",
				baseURL: "https://custom.openai.com",
			});
		});

		it("should handle different languages", async () => {
			// Arrange
			const contextWithLanguage = {
				...mockContext,
				language: "es",
			};

			mockPromptBuilder.buildSystemPrompt = vi.fn().mockReturnValue("Sistema prompt en español");

			mockCreate.mockResolvedValueOnce({
				choices: [
					{
						message: {
							content: JSON.stringify({
								title: "Proyecto de Prueba",
								short_description: "Un proyecto de prueba",
							}),
						},
					},
				],
			});

			// Act
			await service.generateReadme(contextWithLanguage, mockConfig);

			// Assert
			expect(mockPromptBuilder.buildSystemPrompt).toHaveBeenCalledWith(contextWithLanguage);
		});

		it("should throw error when no response from OpenAI", async () => {
			// Arrange
			mockCreate.mockResolvedValueOnce({
				choices: [
					{
						message: {
							content: null,
						},
					},
				],
			});

			// Act & Assert
			await expect(service.generateReadme(mockContext, mockConfig)).rejects.toThrow("No response from OpenAI");
		});

		it("should throw error for invalid JSON response", async () => {
			// Arrange
			mockCreate.mockResolvedValueOnce({
				choices: [
					{
						message: {
							content: "Invalid JSON",
						},
					},
				],
			});

			// Mock parser to throw error
			mockResponseParser.parseResponse = vi.fn().mockImplementation(() => {
				throw new Error("Failed to parse README response");
			});

			// Act & Assert
			await expect(service.generateReadme(mockContext, mockConfig)).rejects.toThrow("Failed to parse README response");
		});

		it("should throw error for missing required fields", async () => {
			// Arrange
			mockCreate.mockResolvedValueOnce({
				choices: [
					{
						message: {
							content: JSON.stringify({
								// Missing title and short_description
								badges: [],
							}),
						},
					},
				],
			});

			// Mock parser to throw error
			mockResponseParser.parseResponse = vi.fn().mockImplementation(() => {
				throw new Error("Missing required fields in response");
			});

			// Act & Assert
			await expect(service.generateReadme(mockContext, mockConfig)).rejects.toThrow("Missing required fields in response");
		});

		it("should handle empty optional fields", async () => {
			// Arrange
			mockCreate.mockResolvedValueOnce({
				choices: [
					{
						message: {
							content: JSON.stringify({
								title: "Test",
								short_description: "Test",
								// All other fields missing
							}),
						},
					},
				],
			});

			// Act
			const result = await service.generateReadme(mockContext, mockConfig);

			// Assert
			expect(result).toBeDefined();
			expect(result.getTitle()).toBe("Test Project"); // From mock parser
		});

		it("should include changelog in prompt when provided", async () => {
			// Arrange
			mockPromptBuilder.buildUserPrompt = vi.fn().mockReturnValue("User prompt with changelog");

			mockCreate.mockResolvedValueOnce({
				choices: [
					{
						message: {
							content: JSON.stringify({
								title: "Test",
								short_description: "Test",
							}),
						},
					},
				],
			});

			// Act
			await service.generateReadme(mockContext, mockConfig);

			// Assert
			expect(mockPromptBuilder.buildUserPrompt).toHaveBeenCalledWith(mockContext);
		});

		it("should handle API errors", async () => {
			// Arrange
			mockCreate.mockRejectedValueOnce(new Error("API Error"));

			// Act & Assert
			await expect(service.generateReadme(mockContext, mockConfig)).rejects.toThrow("API Error");
		});
	});

	describe("edge cases", () => {
		it("should handle extremely long content", async () => {
			// Arrange
			const longDescription = "Long ".repeat(1000);
			const edgeCaseConfig = new LLMConfiguration("key", ELLMProvider.OPENAI, EOpenAIModel.GPT_5_2);

			const mockResponse = {
				choices: [
					{
						message: {
							content: JSON.stringify({
								title: "Test",
								short_description: "Test",
								long_description: longDescription,
							}),
						},
					},
				],
			};

			mockCreate.mockResolvedValueOnce(mockResponse);

			// Act
			const result = await service.generateReadme(createMockLlmPromptContext(), edgeCaseConfig);

			// Assert
			expect(result).toBeDefined();
		});

		it("should handle special characters in content", async () => {
			// Arrange
			const edgeCaseConfig = new LLMConfiguration("key", ELLMProvider.OPENAI, EOpenAIModel.GPT_5_2);

			const mockResponse = {
				choices: [
					{
						message: {
							content: JSON.stringify({
								title: "Test \"Project\" with 'quotes'",
								short_description: "Description with\nnewlines\tand\ttabs",
							}),
						},
					},
				],
			};

			mockCreate.mockResolvedValueOnce(mockResponse);

			// Act
			const result = await service.generateReadme(createMockLlmPromptContext(), edgeCaseConfig);

			// Assert
			expect(result).toBeDefined();
		});
	});
});
