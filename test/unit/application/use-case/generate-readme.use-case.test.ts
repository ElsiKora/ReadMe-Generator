import { describe, it, expect, vi, beforeEach } from "vitest";

import { GenerateReadmeUseCase } from "../../../../src/application/use-case/generate-readme.use-case";
import type { ILlmService } from "../../../../src/application/interface/llm-service.interface";
import { LLMConfiguration } from "../../../../src/domain/entity/llm-configuration.entity";
import { RepositoryInfo } from "../../../../src/domain/entity/repository-info.entity";
import { Readme } from "../../../../src/domain/entity/readme.entity";
import { Badge } from "../../../../src/domain/value-object/badge.value-object";
import { ELLMProvider } from "../../../../src/domain/enum/llm-provider.enum";

describe("GenerateReadmeUseCase", () => {
	let mockLlmService: ILlmService;
	let useCase: GenerateReadmeUseCase;

	beforeEach(() => {
		mockLlmService = {
			generateReadme: vi.fn(),
			supports: vi.fn(),
		};
		useCase = new GenerateReadmeUseCase([mockLlmService]);
	});

	it("should generate README when supported LLM service is found", async () => {
		// Arrange
		const configuration = new LLMConfiguration("test-key", ELLMProvider.OPENAI, "gpt-4");
		const repositoryInfo = new RepositoryInfo({
			name: "test-repo",
			description: "Test repository",
			codeStats: "10 files",
		});
		const context = {
			repositoryInfo,
			language: "en",
		};

		const expectedReadme = new Readme({
			title: "Test Repo",
			shortDescription: "A test repository",
			longDescription: "This is a test repository for testing",
			logoUrl: "https://example.com/logo.png",
			badges: [new Badge("TypeScript", "blue", "typescript", "white")],
			features: ["Feature 1", "Feature 2"],
			installation: "npm install",
			usage: "npm start",
			roadmap: "| Task | Status |\n|------|--------|\n| Feature 3 | 🚧 In Progress |",
			faq: "Q: Is this real?\nA: No, it's a test.",
			license: "MIT",
			content: "# Test Repo\n...",
		});

		vi.mocked(mockLlmService.supports).mockReturnValue(true);
		vi.mocked(mockLlmService.generateReadme).mockResolvedValue(expectedReadme);

		// Act
		const result = await useCase.execute(context, configuration);

		// Assert
		expect(result).toBe(expectedReadme);
		expect(mockLlmService.supports).toHaveBeenCalledWith(configuration);
		expect(mockLlmService.generateReadme).toHaveBeenCalledWith(context, configuration);
	});

	it("should throw error when no supported LLM service is found", async () => {
		// Arrange
		const configuration = new LLMConfiguration("test-key", ELLMProvider.OPENAI, "gpt-4");
		const repositoryInfo = new RepositoryInfo({
			name: "test-repo",
			description: "Test repository",
			codeStats: "10 files",
		});
		const context = {
			repositoryInfo,
			language: "en",
		};

		vi.mocked(mockLlmService.supports).mockReturnValue(false);

		// Act & Assert
		await expect(useCase.execute(context, configuration)).rejects.toThrow("No LLM service found for provider: openai");
	});

	it("should select the correct LLM service from multiple services", async () => {
		// Arrange
		const mockOpenAIService: ILlmService = {
			generateReadme: vi.fn(),
			supports: vi.fn().mockReturnValue(true),
		};
		const mockAnthropicService: ILlmService = {
			generateReadme: vi.fn(),
			supports: vi.fn().mockReturnValue(false),
		};

		useCase = new GenerateReadmeUseCase([mockAnthropicService, mockOpenAIService]);

		const configuration = new LLMConfiguration("test-key", ELLMProvider.OPENAI, "gpt-4");
		const repositoryInfo = new RepositoryInfo({
			name: "test-repo",
			description: "Test repository",
			codeStats: "10 files",
		});
		const context = {
			repositoryInfo,
			language: "en",
		};

		const expectedReadme = new Readme({
			title: "Test",
			shortDescription: "Test",
			longDescription: "Test",
			logoUrl: "",
			badges: [],
			features: [],
			installation: "",
			usage: "",
			roadmap: "",
			faq: "",
			license: "MIT",
			content: "",
		});

		vi.mocked(mockOpenAIService.generateReadme).mockResolvedValue(expectedReadme);

		// Act
		await useCase.execute(context, configuration);

		// Assert
		expect(mockAnthropicService.generateReadme).not.toHaveBeenCalled();
		expect(mockOpenAIService.generateReadme).toHaveBeenCalledWith(context, configuration);
	});
});
