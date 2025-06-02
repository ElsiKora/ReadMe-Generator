import { describe, it, expect, beforeEach, vi } from "vitest";

import { ReadmeResponseParserService } from "../../../../src/infrastructure/service/readme-response-parser.service.js";
import type { IReadmeBuilder } from "../../../../src/application/interface/readme-builder.interface.js";
import type { ILlmPromptContext } from "../../../../src/application/interface/llm-service.interface.js";
import { createMockLlmPromptContext } from "../../../helpers/test-utils.js";
import { Readme } from "../../../../src/domain/entity/readme.entity.js";
import { ELogoType } from "../../../../src/domain/enum/logo-type.enum.js";

describe("ReadmeResponseParserService", () => {
	let service: ReadmeResponseParserService;
	let mockReadmeBuilder: IReadmeBuilder;
	let mockContext: ILlmPromptContext;

	beforeEach(() => {
		// Create mock readme builder
		mockReadmeBuilder = {
			build: vi.fn().mockReturnValue("Generated README content"),
		};

		// Create service
		service = new ReadmeResponseParserService(mockReadmeBuilder);

		// Create mock context
		mockContext = createMockLlmPromptContext();
	});

	describe("parseResponse", () => {
		it("should parse valid JSON response", () => {
			// Arrange
			const jsonResponse = JSON.stringify({
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
				roadmap: "| Task | Status |\n|------|--------|\n| Test | Done |",
				faq: "Q: Test?\nA: Yes",
				license: "MIT",
			});

			// Act
			const result = service.parseResponse(jsonResponse, mockContext);

			// Assert
			expect(result).toBeInstanceOf(Readme);
			expect(result.getTitle()).toBe("Test Project");
			expect(result.getShortDescription()).toBe("A test project");
			expect(result.getBadges()).toHaveLength(1);
			expect(mockReadmeBuilder.build).toHaveBeenCalled();
		});

		it("should handle JSON wrapped in markdown code blocks", () => {
			// Arrange
			const wrappedResponse = `\`\`\`json
{
  "title": "Test Project",
  "short_description": "A test project",
  "long_description": "Detailed description",
  "badges": [],
  "features": [],
  "installation": "npm install",
  "usage": "npm start",
  "roadmap": "",
  "faq": "",
  "license": "MIT",
  "logoUrl": ""
}
\`\`\``;

			// Act
			const result = service.parseResponse(wrappedResponse, mockContext);

			// Assert
			expect(result).toBeInstanceOf(Readme);
			expect(result.getTitle()).toBe("Test Project");
		});

		it("should handle JSON wrapped with extra text", () => {
			// Arrange
			const wrappedResponse = `Here is the README configuration:

\`\`\`json
{
  "title": "Test Project",
  "short_description": "A test project",
  "badges": [],
  "features": [],
  "installation": "npm install",
  "usage": "npm start",
  "license": "MIT"
}
\`\`\`

This should work well for your project.`;

			// Act
			const result = service.parseResponse(wrappedResponse, mockContext);

			// Assert
			expect(result).toBeInstanceOf(Readme);
			expect(result.getTitle()).toBe("Test Project");
		});

		it("should handle JSON without markdown blocks", () => {
			// Arrange
			const response = `{
  "title": "Test Project",
  "short_description": "A test project",
  "badges": [],
  "features": []
}`;

			// Act
			const result = service.parseResponse(response, mockContext);

			// Assert
			expect(result).toBeInstanceOf(Readme);
			expect(result.getTitle()).toBe("Test Project");
		});

		it("should throw error for missing required fields", () => {
			// Arrange
			const invalidResponse = JSON.stringify({
				badges: [],
				features: [],
				// Missing title and short_description
			});

			// Act & Assert
			expect(() => service.parseResponse(invalidResponse, mockContext))
				.toThrow("Missing required fields in response");
		});

		it("should throw error for invalid JSON", () => {
			// Arrange
			const invalidResponse = "Not valid JSON at all";

			// Act & Assert
			expect(() => service.parseResponse(invalidResponse, mockContext))
				.toThrow("Failed to parse README response");
		});

		it("should use logo preferences from context", () => {
			// Arrange
			const jsonResponse = JSON.stringify({
				title: "Test Project",
				short_description: "A test project",
				logoUrl: "https://ai-generated.com/logo.png",
				badges: [],
				features: [],
			});

			const contextWithLogo = {
				...mockContext,
				logoUrl: "https://custom.com/logo.png",
				logoType: ELogoType.CUSTOM,
			};

			// Act
			service.parseResponse(jsonResponse, contextWithLogo);

			// Assert
			expect(mockReadmeBuilder.build).toHaveBeenCalledWith(
				expect.objectContaining({
					logoUrl: "https://custom.com/logo.png",
					logoType: ELogoType.CUSTOM,
				})
			);
		});

		it("should use AI-generated logo when no preferences provided", () => {
			// Arrange
			const jsonResponse = JSON.stringify({
				title: "Test Project",
				short_description: "A test project",
				logoUrl: "https://ai-generated.com/logo.png",
				badges: [],
				features: [],
			});

			// Act
			service.parseResponse(jsonResponse, mockContext);

			// Assert
			expect(mockReadmeBuilder.build).toHaveBeenCalledWith(
				expect.objectContaining({
					logoUrl: "https://ai-generated.com/logo.png",
				})
			);
		});
	});
}); 