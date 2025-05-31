import { describe, it, expect, beforeEach, vi } from "vitest";
import OpenAI from "openai";

import { OpenAILlmService } from "../../../../src/infrastructure/llm/openai-llm.service.js";
import { LLMConfiguration } from "../../../../src/domain/entity/llm-configuration.entity.js";
import { ELLMProvider } from "../../../../src/domain/enum/llm-provider.enum.js";
import { EOpenAIModel } from "../../../../src/domain/enum/openai-model.enum.js";
import type { ILlmPromptContext } from "../../../../src/application/interface/llm-service.interface.js";
import { createMockLlmPromptContext } from "../../../helpers/test-utils.js";
import { ReadmeBuilder } from "../../../../src/infrastructure/service/readme-builder.service.js";

// Mock OpenAI
vi.mock("openai");

describe("OpenAILlmService", () => {
	let service: OpenAILlmService;
	let mockOpenAI: any;
	let mockCreate: any;
	let readmeBuilder: ReadmeBuilder;

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();

		// Create dependencies
		readmeBuilder = new ReadmeBuilder();

		// Create service with dependencies
		service = new OpenAILlmService(readmeBuilder);

		// Setup OpenAI mock
		mockCreate = vi.fn();
		mockOpenAI = {
			chat: {
				completions: {
					create: mockCreate,
				},
			},
		};

		vi.mocked(OpenAI).mockImplementation(() => mockOpenAI as any);
	});

	describe("supports", () => {
		it("should support OpenAI provider", () => {
			// Arrange
			const config = new LLMConfiguration("api-key", ELLMProvider.OPENAI, EOpenAIModel.GPT_4O);

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
			mockConfig = new LLMConfiguration("test-api-key", ELLMProvider.OPENAI, EOpenAIModel.GPT_4O);
		});

		it("should generate README successfully", async () => {
			// Arrange
			const mockResponse = {
				choices: [{
					message: {
						content: JSON.stringify({
							title: "Test Project",
							short_description: "A test project",
							long_description: "Detailed description",
							logoUrl: "https://example.com/logo.png",
							badges: [
								{ name: "TypeScript", color: "blue", logo: "typescript", logoColor: "white" }
							],
							features: ["Feature 1", "Feature 2"],
							installation: "npm install",
							usage: "npm start",
							roadmap: "| Task | Status |\n|------|--------|\n| Test | ✅ |",
							faq: "Q: Test?\nA: Yes",
							license: "MIT",
						}),
					},
				}],
			};

			mockCreate.mockResolvedValueOnce(mockResponse);

			// Act
			const result = await service.generateReadme(mockContext, mockConfig);

			// Assert
			expect(result).toBeDefined();
			expect(result.getTitle()).toBe("Test Project");
			expect(result.getShortDescription()).toBe("A test project");
			expect(result.getBadges()).toHaveLength(1);
			expect(result.getFeatures()).toEqual(["Feature 1", "Feature 2"]);

			// Verify OpenAI was called correctly
			expect(vi.mocked(OpenAI)).toHaveBeenCalledWith({
				apiKey: "test-api-key",
				baseURL: undefined,
			});

			expect(mockCreate).toHaveBeenCalledWith({
				max_tokens: expect.any(Number),
				messages: [
					{ content: expect.stringContaining("creative technical writer"), role: "system" },
					{ content: expect.stringContaining("test-project"), role: "user" },
				],
				model: EOpenAIModel.GPT_4O,
				response_format: { type: "json_object" },
				temperature: expect.any(Number),
			});
		});

		it("should use custom base URL when provided", async () => {
			// Arrange
			const configWithBaseUrl = new LLMConfiguration(
				"test-api-key",
				ELLMProvider.OPENAI,
				EOpenAIModel.GPT_4O,
				"https://custom.openai.com"
			);

			mockCreate.mockResolvedValueOnce({
				choices: [{
					message: {
						content: JSON.stringify({
							title: "Test",
							short_description: "Test",
							badges: [],
							features: [],
						}),
					},
				}],
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

			mockCreate.mockResolvedValueOnce({
				choices: [{
					message: {
						content: JSON.stringify({
							title: "Proyecto de Prueba",
							short_description: "Un proyecto de prueba",
						}),
					},
				}],
			});

			// Act
			await service.generateReadme(contextWithLanguage, mockConfig);

			// Assert
			const systemMessage = mockCreate.mock.calls[0][0].messages[0];
			expect(systemMessage.content).toContain("español");
		});

		it("should throw error when no response from OpenAI", async () => {
			// Arrange
			mockCreate.mockResolvedValueOnce({
				choices: [{
					message: {
						content: null,
					},
				}],
			});

			// Act & Assert
			await expect(service.generateReadme(mockContext, mockConfig))
				.rejects.toThrow("No response from OpenAI");
		});

		it("should throw error for invalid JSON response", async () => {
			// Arrange
			mockCreate.mockResolvedValueOnce({
				choices: [{
					message: {
						content: "Invalid JSON",
					},
				}],
			});

			// Act & Assert
			await expect(service.generateReadme(mockContext, mockConfig))
				.rejects.toThrow("Failed to parse README response");
		});

		it("should throw error for missing required fields", async () => {
			// Arrange
			mockCreate.mockResolvedValueOnce({
				choices: [{
					message: {
						content: JSON.stringify({
							// Missing title and short_description
							badges: [],
						}),
					},
				}],
			});

			// Act & Assert
			await expect(service.generateReadme(mockContext, mockConfig))
				.rejects.toThrow("Missing required fields in response");
		});

		it("should handle empty optional fields", async () => {
			// Arrange
			mockCreate.mockResolvedValueOnce({
				choices: [{
					message: {
						content: JSON.stringify({
							title: "Test",
							short_description: "Test",
							// All other fields missing
						}),
					},
				}],
			});

			// Act
			const result = await service.generateReadme(mockContext, mockConfig);

			// Assert
			expect(result.getBadges()).toEqual([]);
			expect(result.getFeatures()).toEqual([]);
			expect(result.getLicense()).toBe("MIT"); // Default
			expect(result.getLogoUrl()).toBe("");
		});

		it("should include changelog in prompt when provided", async () => {
			// Arrange
			mockCreate.mockResolvedValueOnce({
				choices: [{
					message: {
						content: JSON.stringify({
							title: "Test",
							short_description: "Test",
						}),
					},
				}],
			});

			// Act
			await service.generateReadme(mockContext, mockConfig);

			// Assert
			const userMessage = mockCreate.mock.calls[0][0].messages[1];
			expect(userMessage.content).toContain("CHANGELOG file contents");
			expect(userMessage.content).toContain("# Changelog");
		});

		it("should handle API errors", async () => {
			// Arrange
			mockCreate.mockRejectedValueOnce(new Error("API Error"));

			// Act & Assert
			await expect(service.generateReadme(mockContext, mockConfig))
				.rejects.toThrow("API Error");
		});
	});

	describe("edge cases", () => {
		it("should handle extremely long content", async () => {
			// Arrange
			const longDescription = "Long ".repeat(1000);
			const mockConfig = new LLMConfiguration("key", ELLMProvider.OPENAI, EOpenAIModel.GPT_4O);

			const mockResponse = {
				choices: [{
					message: {
						content: JSON.stringify({
							title: "Test",
							short_description: "Test",
							long_description: longDescription,
						}),
					},
				}],
			};

			mockCreate.mockResolvedValueOnce(mockResponse);

			// Act
			const result = await service.generateReadme(createMockLlmPromptContext(), mockConfig);

			// Assert
			expect(result.getLongDescription()).toBe(longDescription);
		});

		it("should handle special characters in content", async () => {
			// Arrange
			const mockConfig = new LLMConfiguration("key", ELLMProvider.OPENAI, EOpenAIModel.GPT_4O);

			const mockResponse = {
				choices: [{
					message: {
						content: JSON.stringify({
							title: "Test \"Project\" with 'quotes'",
							short_description: "Description with\nnewlines\tand\ttabs",
						}),
					},
				}],
			};

			mockCreate.mockResolvedValueOnce(mockResponse);

			// Act
			const result = await service.generateReadme(createMockLlmPromptContext(), mockConfig);

			// Assert
			expect(result.getTitle()).toBe("Test \"Project\" with 'quotes'");
			expect(result.getShortDescription()).toContain("newlines");
		});
	});
}); 