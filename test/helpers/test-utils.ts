import { vi } from "vitest";

import { RepositoryInfo } from "../../src/domain/entity/repository-info.entity.js";
import { Badge } from "../../src/domain/value-object/badge.value-object.js";
import { Readme } from "../../src/domain/entity/readme.entity.js";
import { ELLMProvider } from "../../src/domain/enum/llm-provider.enum.js";
import type { ILlmPromptContext } from "../../src/application/interface/llm-service.interface.js";
import type { ICliInterfaceService } from "../../src/application/interface/cli-interface-service.interface.js";
import type { IFileSystemService } from "../../src/application/interface/file-system-service.interface.js";
import type { IGitRepository } from "../../src/application/interface/git-repository.interface.js";

/**
 * Creates a mock function with type safety
 */
export function createMock<T extends (...args: any[]) => any>(): T {
	return vi.fn() as unknown as T;
}

/**
 * Waits for a specific amount of time
 */
export async function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a mock LLM configuration
 */
export function createMockLLMConfiguration() {
	return {
		getProvider: vi.fn().mockReturnValue(ELLMProvider.OPENAI),
		getModel: vi.fn().mockReturnValue("gpt-4o"),
		getApiKey: vi.fn().mockReturnValue({ getValue: () => "test-api-key" }),
		getBaseUrl: vi.fn().mockReturnValue(undefined),
	};
}

/**
 * Creates a mock LLM prompt context
 */
export function createMockLlmPromptContext(): ILlmPromptContext {
	return {
		repositoryInfo: new RepositoryInfo({
			name: "test-project",
			description: "Test project description",
			owner: "test-owner",
			defaultBranch: "main",
			codeStats: "TypeScript: 80%, JavaScript: 20%",
		}),
		changelogContent: "# Changelog\n\n## [1.0.0] - 2023-01-01\n### Added\n- Initial release",
		projectContext: "This is a test project context",
		language: "en",
		scanDepth: 2,
		scannedFiles: [
			{
				path: "src/index.ts",
				content: "console.log('Hello, world!');",
				size: 30,
			},
			{
				path: "package.json",
				content: '{"name": "test-project", "version": "1.0.0"}',
				size: 45,
			},
		],
	};
}

/**
 * Creates a mock README entity
 */
export function createMockReadme(): Readme {
	return new Readme({
		title: "Test Project",
		shortDescription: "A test project",
		longDescription: "This is a test project for unit testing",
		logoUrl: "https://example.com/logo.png",
		badges: [new Badge("TypeScript", "blue", "typescript", "white")],
		features: ["Feature 1", "Feature 2"],
		installation: "npm install test-project",
		usage: "const test = require('test-project');",
		roadmap: "| Task | Status |\n|------|--------|\n| Test | ✅ |",
		faq: "Q: Is this a test?\nA: Yes",
		license: "MIT",
		content: "# Test Project README",
	});
}

/**
 * Creates a mock CLI interface service
 */
export function createMockCliInterface(): ICliInterfaceService {
	return {
		confirm: vi.fn().mockResolvedValue(true),
		error: vi.fn(),
		info: vi.fn(),
		prompt: vi.fn().mockResolvedValue("test-input"),
		select: vi.fn().mockResolvedValue("test-selection"),
		success: vi.fn(),
	};
}

/**
 * Creates a mock file system service
 */
export function createMockFileSystemService(): IFileSystemService {
	return {
		readFile: vi.fn().mockResolvedValue("test file content"),
		writeFile: vi.fn().mockResolvedValue(undefined),
		exists: vi.fn().mockResolvedValue(true),
		getCurrentDirectory: vi.fn().mockReturnValue("/test/directory"),
		joinPath: vi.fn().mockImplementation((...segments) => segments.join("/")),
		listFiles: vi.fn().mockResolvedValue(["src/index.ts", "package.json", "README.md"]),
		isDirectory: vi.fn().mockResolvedValue(true),
		getFileStats: vi.fn().mockResolvedValue({ size: 1024 }),
	};
}

/**
 * Creates a mock git repository service
 */
export function createMockGitRepository(): IGitRepository {
	return {
		getRepositoryInfo: vi.fn().mockResolvedValue(
			new RepositoryInfo({
				name: "mock-repo",
				description: "Mock repository",
				owner: "mock-owner",
				defaultBranch: "main",
				codeStats: "JavaScript: 100%",
			})
		),
		isGitRepository: vi.fn().mockResolvedValue(true),
	};
}

/**
 * Creates a test context with common mocked services
 */
export function createTestContext() {
	return {
		cliInterface: createMockCliInterface(),
		fileSystem: createMockFileSystemService(),
		gitRepository: createMockGitRepository(),
		llmConfiguration: createMockLLMConfiguration(),
		llmPromptContext: createMockLlmPromptContext(),
	};
} 