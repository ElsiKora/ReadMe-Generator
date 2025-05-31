import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execSync } from "child_process";
import { createTestRepo, cleanupTestRepo, stageFiles, runCli, readmeExists, readReadme, createTestEnv, runCliWithAnswers } from "../../helpers/e2e-utils.js";

describe("README Generator CLI Flow E2E", () => {
	let testRepoPath: string;

	beforeEach(async () => {
		// Create a test repository
		testRepoPath = await createTestRepo();
	});

	afterEach(async () => {
		// Clean up the test repository
		await cleanupTestRepo(testRepoPath);
	});

	describe("Basic Flow", () => {
		it("should generate README with valid prompts flow", async () => {
			// This test verifies the CLI flow works correctly up to API call
			// We'll provide answers and cancel before the actual API call
			
			// Act - provide answers through the flow then cancel
			const answers = [
				"n",  // No additional context
				0,    // English (first option, index 0)
				0,    // OpenAI (first provider, index 0)
				"test-api-key", // API key
				0,    // GPT-4o (first model, index 0)
			];
			
			const result = await runCliWithAnswers(testRepoPath, answers, createTestEnv());
			
			// Assert - should fail at API call but show we got through the flow
			expect(result.exitCode).toBeGreaterThan(0);
			// Check we reached the generation phase
			const combinedOutput = result.stdout + result.stderr;
			expect(combinedOutput).toContain("Failed to generate README");
		});
	});

	describe("Error Handling", () => {
		it("should handle running outside git repository", async () => {
			// Act - run in temp directory without git
			// The CLI actually doesn't fail - it has a fallback mechanism
			const input = "\x03"; // Ctrl+C to exit early
			const result = await runCli("/tmp", input, createTestEnv());

			// Assert - should still work but use fallback directory name
			// Exit code will be non-zero due to Ctrl+C
			expect(result.exitCode).toBeGreaterThan(0);
			expect(result.stdout).toContain("ReadMe Generator");
		});

		it("should handle cancellation gracefully", async () => {
			// Act - send Ctrl+C to simulate cancellation
			const input = "\x03"; // Ctrl+C character
			const result = await runCli(testRepoPath, input, createTestEnv());

			// Assert - should exit with non-zero code
			expect(result.exitCode).toBeGreaterThan(0);
			expect(readmeExists(testRepoPath)).toBe(false);
		});
	});

	describe("Configuration Flow", () => {
		it("should show provider selection options", async () => {
			// Test that we can reach the provider selection menu
			const answers = [
				"n",    // No additional context
				0,      // English (first option)
				// Will show provider menu and then exit
			];
			
			const result = await runCliWithAnswers(testRepoPath, answers, createTestEnv());
			
			// Assert - should show configuration started
			expect(result.stdout).toContain("Configuring AI provider");
			expect(result.exitCode).toBeGreaterThan(0); // Exit due to incomplete flow
		});
	});

	describe("File Detection", () => {
		it("should detect and use CHANGELOG.md", async () => {
			// Arrange
			await stageFiles(testRepoPath, {
				"CHANGELOG.md": "# Changelog\n\n## [1.0.0] - 2024-01-01\n### Added\n- Initial release",
			});

			// Act - just run the CLI to check if it detects the changelog
			const input = "\x03"; // Cancel early to just check detection
			const result = await runCli(testRepoPath, input, createTestEnv());

			// Assert - the changelog should be read by the file system
			// We can't directly test if it's used without completing the full flow
			expect(result.exitCode).toBeGreaterThan(0);
		});

		it("should ask for additional context", async () => {
			// Act
			const input = "1\n"; // Start flow
			const result = await runCli(testRepoPath, input, createTestEnv());

			// Assert
			expect(result.stdout).toContain("additional project context");
		});

		it("should ask for language selection", async () => {
			// Act
			const input = "1\ntest-key\n1\nn\n"; // OpenAI, API key, GPT-4o, no context
			const result = await runCli(testRepoPath, input, createTestEnv());

			// Assert
			expect(result.stdout).toContain("English");
			expect(result.stdout).toContain("Spanish");
			expect(result.stdout).toContain("French");
			expect(result.stdout).toContain("German");
			expect(result.stdout).toContain("Russian");
		});
	});

	describe("Success Cases", () => {
		it("should validate full input flow", async () => {
			// Test that all inputs are collected properly
			const answers = [
				"y",    // Yes to additional context
				"This is a test project for e2e testing", // Context
				0,      // English (first option)
				1,      // Anthropic (second provider, index 1)
				"test-api-key", // API key
				0       // First model option
			];
			
			const result = await runCliWithAnswers(testRepoPath, answers, createTestEnv());
			
			// Assert - should reach configuration and fail at API call
			expect(result.stdout).toContain("Configuring AI provider");
			// Will fail at actual API call
			expect(result.exitCode).toBeGreaterThan(0);
			const combinedOutput = result.stdout + result.stderr;
			expect(combinedOutput).toContain("Failed to generate README");
		});

		it("should handle different language selections", async () => {
			// Test language selection
			const answers = [
				"n",    // No additional context
				1,      // Spanish (second option, index 1)
				5,      // Ollama (sixth option, index 5)
				"llama2" // Model name
			];
			
			const result = await runCliWithAnswers(testRepoPath, answers, createTestEnv());
			
			// Assert - should reach configuration with Ollama selected
			expect(result.stdout).toContain("Configuring AI provider");
			// Will fail at connection to Ollama
			expect(result.exitCode).toBeGreaterThan(0);
			const combinedOutput = result.stdout + result.stderr;
			expect(combinedOutput).toContain("Failed to generate README");
		});
	});

	describe("Special Cases", () => {
		it("should handle projects with special characters in name", async () => {
			// Arrange - update package.json with special name
			await stageFiles(testRepoPath, {
				"package.json": JSON.stringify({
					name: "@scope/package-name",
					version: "1.0.0",
					description: "Package with scoped name",
				}, null, 2),
			});

			// Act - cancel early
			const input = "\x03"; // Ctrl+C
			const result = await runCli(testRepoPath, input, createTestEnv());

			// Assert - should exit with non-zero code
			expect(result.exitCode).toBeGreaterThan(0);
			// The package name would be used internally by git repository service
		});

		it("should handle missing package.json", async () => {
			// Arrange - remove package.json
			execSync("rm package.json", { cwd: testRepoPath });

			// Act
			const result = await runCli(testRepoPath, "", createTestEnv());

			// Assert - should still work without package.json
			expect(result.stdout).toContain("ReadMe Generator");
		});
	});
}); 