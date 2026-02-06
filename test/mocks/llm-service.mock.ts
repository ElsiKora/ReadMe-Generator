import { vi } from "vitest";

import type { ILlmService } from "../../src/application/interface/llm-service.interface";
import { Readme } from "../../src/domain/entity/readme.entity";
import { Badge } from "../../src/domain/value-object/badge.value-object";

/**
 * Create a mock LLM service
 */
export function createMockLlmService(): ILlmService {
	return {
		generateReadme: vi.fn().mockResolvedValue(
			new Readme({
				title: "Mock README",
				shortDescription: "Mock short description",
				longDescription: "Mock long description",
				logoUrl: "https://example.com/mock-logo.png",
				badges: [new Badge("Mock", "blue", "mock", "white")],
				features: ["Mock feature 1", "Mock feature 2"],
				installation: "npm install mock",
				usage: "npm run mock",
				roadmap: "| Task | Status |\n|------|--------|\n| Mock Task | ✅ Done |",
				faq: "Q: Is this a mock?\nA: Yes",
				license: "MIT",
				content: "# Mock README Content",
			}),
		),
		supports: vi.fn().mockReturnValue(true),
	};
}
