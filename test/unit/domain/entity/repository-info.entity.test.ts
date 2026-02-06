import { describe, it, expect, beforeEach } from "vitest";

import { RepositoryInfo } from "../../../../src/domain/entity/repository-info.entity";

describe("RepositoryInfo Entity", () => {
	describe("constructor", () => {
		it("should create a repository info with all properties", () => {
			// Arrange
			const data = {
				name: "my-awesome-project",
				description: "An awesome project that does amazing things",
				owner: "john-doe",
				defaultBranch: "main",
				codeStats: "TypeScript: 85%, JavaScript: 10%, CSS: 5%",
			};

			// Act
			const repoInfo = new RepositoryInfo(data);

			// Assert
			expect(repoInfo.getName()).toBe(data.name);
			expect(repoInfo.getDescription()).toBe(data.description);
			expect(repoInfo.getOwner()).toBe(data.owner);
			expect(repoInfo.getDefaultBranch()).toBe(data.defaultBranch);
			expect(repoInfo.getCodeStats()).toBe(data.codeStats);
		});

		it("should create a repository info with minimal properties", () => {
			// Arrange
			const data = {
				name: "minimal-project",
				description: "Minimal description",
			};

			// Act
			const repoInfo = new RepositoryInfo(data);

			// Assert
			expect(repoInfo.getName()).toBe(data.name);
			expect(repoInfo.getDescription()).toBe(data.description);
			expect(repoInfo.getOwner()).toBeUndefined();
			expect(repoInfo.getDefaultBranch()).toBe("main"); // Default value
			expect(repoInfo.getCodeStats()).toBe(""); // Default value
		});

		it("should create a repository info with empty optional properties", () => {
			// Arrange
			const data = {
				name: "test-project",
				description: "Test description",
				owner: undefined,
				defaultBranch: undefined,
				codeStats: undefined,
			};

			// Act
			const repoInfo = new RepositoryInfo(data);

			// Assert
			expect(repoInfo.getName()).toBe(data.name);
			expect(repoInfo.getDescription()).toBe(data.description);
			expect(repoInfo.getOwner()).toBeUndefined();
			expect(repoInfo.getDefaultBranch()).toBe("main");
			expect(repoInfo.getCodeStats()).toBe("");
		});
	});

	describe("getters", () => {
		describe("with all properties", () => {
			let repoInfo: RepositoryInfo;

			beforeEach(() => {
				repoInfo = new RepositoryInfo({
					name: "full-project",
					description: "A project with all properties",
					owner: "organization-name",
					defaultBranch: "develop",
					codeStats: "Java: 60%, Kotlin: 30%, XML: 10%",
				});
			});

			it("should return correct name", () => {
				expect(repoInfo.getName()).toBe("full-project");
			});

			it("should return correct description", () => {
				expect(repoInfo.getDescription()).toBe("A project with all properties");
			});

			it("should return correct owner", () => {
				expect(repoInfo.getOwner()).toBe("organization-name");
			});

			it("should return correct default branch", () => {
				expect(repoInfo.getDefaultBranch()).toBe("develop");
			});

			it("should return correct code stats", () => {
				expect(repoInfo.getCodeStats()).toBe("Java: 60%, Kotlin: 30%, XML: 10%");
			});
		});

		describe("with default values", () => {
			let repoInfo: RepositoryInfo;

			beforeEach(() => {
				repoInfo = new RepositoryInfo({
					name: "default-project",
					description: "A project with default values",
				});
			});

			it("should return empty string for undefined code stats", () => {
				expect(repoInfo.getCodeStats()).toBe("");
			});

			it("should return 'main' for undefined default branch", () => {
				expect(repoInfo.getDefaultBranch()).toBe("main");
			});

			it("should return undefined for undefined owner", () => {
				expect(repoInfo.getOwner()).toBeUndefined();
			});
		});

		describe("with custom default branch", () => {
			it("should handle 'master' as default branch", () => {
				const repoInfo = new RepositoryInfo({
					name: "legacy-project",
					description: "A legacy project",
					defaultBranch: "master",
				});

				expect(repoInfo.getDefaultBranch()).toBe("master");
			});

			it("should handle custom branch names", () => {
				const repoInfo = new RepositoryInfo({
					name: "custom-project",
					description: "A project with custom branch",
					defaultBranch: "production",
				});

				expect(repoInfo.getDefaultBranch()).toBe("production");
			});
		});
	});

	describe("edge cases", () => {
		it("should handle empty strings", () => {
			// Arrange
			const data = {
				name: "",
				description: "",
				owner: "",
				defaultBranch: "",
				codeStats: "",
			};

			// Act
			const repoInfo = new RepositoryInfo(data);

			// Assert
			expect(repoInfo.getName()).toBe("");
			expect(repoInfo.getDescription()).toBe("");
			expect(repoInfo.getOwner()).toBe("");
			expect(repoInfo.getDefaultBranch()).toBe(""); // Empty string overrides default
			expect(repoInfo.getCodeStats()).toBe("");
		});

		it("should handle long descriptions", () => {
			// Arrange
			const longDescription = "This is a very long description ".repeat(20);
			const repoInfo = new RepositoryInfo({
				name: "long-desc-project",
				description: longDescription,
			});

			// Act & Assert
			expect(repoInfo.getDescription()).toBe(longDescription);
		});

		it("should handle special characters in names", () => {
			// Arrange
			const repoInfo = new RepositoryInfo({
				name: "@scope/package-name",
				description: "A scoped package",
				owner: "user@domain.com",
			});

			// Act & Assert
			expect(repoInfo.getName()).toBe("@scope/package-name");
			expect(repoInfo.getOwner()).toBe("user@domain.com");
		});
	});
});
