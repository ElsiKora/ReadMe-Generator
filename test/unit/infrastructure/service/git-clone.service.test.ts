import type { IGitCloneService } from "../../../../src/application/interface/git-clone-service.interface";

import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

// Use vi.hoisted to ensure mocks are created before module loading
const { mockExecAsync } = vi.hoisted(() => {
	return {
		mockExecAsync: vi.fn(),
	};
});

// Mock the promisified exec before importing the service
vi.mock("node:util", () => ({
	promisify: () => mockExecAsync,
}));

// Mock other modules
vi.mock("node:fs/promises");
vi.mock("node:os");

// Import the service after mocking
import { GitCloneService } from "../../../../src/infrastructure/service/git-clone.service";

describe("GitCloneService", () => {
	let service: IGitCloneService;
	const mockFs = vi.mocked(fs);
	const mockOs = vi.mocked(os);

	beforeEach(() => {
		vi.clearAllMocks();
		service = new GitCloneService();
	});

	describe("cloneRepository", () => {
		it("should clone repository successfully", async () => {
			// Arrange
			const repositoryUrl = "https://github.com/user/repo.git";
			const tempDir = "/tmp/readme-generator-123";
			const expectedPath = path.join(tempDir, "repo");

			mockOs.tmpdir.mockReturnValue("/tmp");
			mockFs.mkdtemp.mockResolvedValue(tempDir);
			mockExecAsync.mockResolvedValue({ stdout: "Cloning into 'repo'...", stderr: "" });

			// Act
			const result = await service.cloneRepository(repositoryUrl);

			// Assert
			expect(result).toBe(expectedPath);
			expect(mockFs.mkdtemp).toHaveBeenCalledWith(path.join("/tmp", "readme-generator-"));
			expect(mockExecAsync).toHaveBeenCalledWith(`git clone --depth 1 "${repositoryUrl}" "${expectedPath}"`, {
				cwd: tempDir,
				env: expect.objectContaining({
					GIT_TERMINAL_PROMPT: "0",
				}),
			});
		});

		it("should handle SSH URLs correctly", async () => {
			// Arrange
			const repositoryUrl = "git@github.com:user/repo.git";
			const tempDir = "/tmp/readme-generator-456";
			const expectedPath = path.join(tempDir, "repo");

			mockOs.tmpdir.mockReturnValue("/tmp");
			mockFs.mkdtemp.mockResolvedValue(tempDir);
			mockExecAsync.mockResolvedValue({ stdout: "Cloning into 'repo'...", stderr: "" });

			// Act
			const result = await service.cloneRepository(repositoryUrl);

			// Assert
			expect(result).toBe(expectedPath);
		});

		it("should sanitize repository names with special characters", async () => {
			// Arrange
			const repositoryUrl = "https://github.com/user/my-repo.test.git";
			const tempDir = "/tmp/readme-generator-789";
			const expectedPath = path.join(tempDir, "my-repo_test");

			mockOs.tmpdir.mockReturnValue("/tmp");
			mockFs.mkdtemp.mockResolvedValue(tempDir);
			mockExecAsync.mockResolvedValue({ stdout: "Cloning into 'my-repo.test'...", stderr: "" });

			// Act
			const result = await service.cloneRepository(repositoryUrl);

			// Assert
			expect(result).toBe(expectedPath);
		});

		it("should cleanup on clone failure", async () => {
			// Arrange
			const repositoryUrl = "https://github.com/user/nonexistent.git";
			const tempDir = "/tmp/readme-generator-999";
			const cloneError = new Error("Repository not found");

			mockOs.tmpdir.mockReturnValue("/tmp");
			mockFs.mkdtemp.mockResolvedValue(tempDir);
			mockExecAsync.mockRejectedValue(cloneError);
			mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any);
			mockFs.rm.mockResolvedValue();

			// Act & Assert
			await expect(service.cloneRepository(repositoryUrl)).rejects.toThrow("Failed to clone repository");
			expect(mockFs.rm).toHaveBeenCalledWith(tempDir, { force: true, recursive: true });
		});
	});

	describe("cleanupRepository", () => {
		it("should remove directory successfully", async () => {
			// Arrange
			const directoryPath = "/tmp/readme-generator-123";
			mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any);
			mockFs.rm.mockResolvedValue();

			// Act
			await service.cleanupRepository(directoryPath);

			// Assert
			expect(mockFs.rm).toHaveBeenCalledWith(directoryPath, { force: true, recursive: true });
		});

		it("should handle non-existent directory gracefully", async () => {
			// Arrange
			const directoryPath = "/tmp/nonexistent";
			const error = new Error("ENOENT: no such file or directory");
			(error as any).code = "ENOENT";
			mockFs.stat.mockRejectedValue(error);

			// Act & Assert
			await expect(service.cleanupRepository(directoryPath)).resolves.not.toThrow();
		});

		it("should log warning for other cleanup errors", async () => {
			// Arrange
			const directoryPath = "/tmp/protected";
			const error = new Error("Permission denied");
			(error as any).code = "EACCES";
			mockFs.stat.mockRejectedValue(error);

			const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

			// Act
			await service.cleanupRepository(directoryPath);

			// Assert
			expect(consoleWarnSpy).toHaveBeenCalledWith(`Warning: Failed to clean up directory ${directoryPath}: Permission denied`);

			consoleWarnSpy.mockRestore();
		});
	});
});
