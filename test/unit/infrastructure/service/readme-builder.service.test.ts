import { describe, it, expect, beforeEach } from "vitest";

import { ReadmeBuilder } from "../../../../src/infrastructure/service/readme-builder.service";
import { Readme } from "../../../../src/domain/entity/readme.entity";
import { Badge } from "../../../../src/domain/value-object/badge.value-object";
import { RepositoryInfo } from "../../../../src/domain/entity/repository-info.entity";

describe("ReadmeBuilder Service", () => {
	let builder: ReadmeBuilder;
	let repositoryInfo: RepositoryInfo;

	beforeEach(() => {
		builder = new ReadmeBuilder();
		repositoryInfo = new RepositoryInfo({
			name: "test-repo",
			description: "Test repository",
			owner: "test-owner",
		});
	});

	describe("build", () => {
		it("should build a complete README with all sections", () => {
			// Arrange
			const badges = [new Badge("TypeScript", "blue", "typescript", "white"), new Badge("Node.js", "green", "node.js", "white")];

			const data = {
				title: "Awesome Project",
				shortDescription: "A short description of the project",
				longDescription: "This is a detailed description of what the project does and why it's awesome.",
				logoUrl: "https://example.com/logo.png",
				badges: badges,
				features: ["Feature 1", "Feature 2", "Feature 3"],
				installation: "npm install awesome-project",
				usage: "const awesome = require('awesome-project');\nawesome.doSomething();",
				roadmap: "| Task | Status |\n|------|--------|\n| Feature A | ✅ Done |\n| Feature B | 🚧 In Progress |",
				faq: "### Q: Is this project awesome?\nA: Yes, it is!\n\n### Q: How can I contribute?\nA: Check our contributing guide!",
				license: "MIT",
				repositoryInfo,
			};

			// Act
			const result = builder.build(data);

			// Assert
			expect(result).toContain('<h1 align="center">Awesome Project</h1>');
			expect(result).toContain("A short description of the project");
			expect(result).toContain(`<img src="https://example.com/logo.png" width="700" alt="project-logo">`);
			expect(result).toContain(`<img src="${badges[0].toUrl()}" alt="TypeScript">`);
			expect(result).toContain("## 📖 Description");
			expect(result).toContain("This is a detailed description");
			expect(result).toContain("## 🚀 Features");
			expect(result).toContain("- ✨ **Feature 1**");
			expect(result).toContain("## 🛠 Installation");
			expect(result).toContain("npm install awesome-project");
			expect(result).toContain("## 💡 Usage");
			expect(result).toContain("awesome.doSomething()");
			expect(result).toContain("## 🛣 Roadmap");
			expect(result).toContain("| Feature A | ✅ Done |");
			expect(result).toContain("## ❓ FAQ");
			expect(result).toContain("### Q: Is this project awesome?");
			expect(result).toContain("## 🔒 License");
			expect(result).toContain("This project is licensed under **MIT**");
		});

		it("should build README with default badges when none provided", () => {
			// Arrange
			const data = {
				title: "Minimal Project",
				shortDescription: "Minimal description",
				longDescription: "Description",
				badges: [],
				features: ["Feature"],
				installation: "npm install",
				usage: "Use it",
				roadmap: "Coming soon",
				faq: "No questions yet",
				license: "MIT",
				repositoryInfo,
			};

			// Act
			const result = builder.build(data);

			// Assert
			expect(result).toContain('<h1 align="center">Minimal Project</h1>');
			expect(result).toContain("Minimal description");
			// Should use Socialify URL with repository info
			expect(result).toContain("socialify.git.ci/test-owner/test-repo");
			// Should have default badges (Node.js, TypeScript, npm)
			expect(result).toContain(`alt="Node.js"`);
			expect(result).toContain(`alt="TypeScript"`);
			expect(result).toContain(`alt="npm"`);
		});

		it("should handle README with custom badges", () => {
			// Arrange
			const badges = [new Badge("JavaScript", "yellow", "javascript", "black")];
			const data = {
				title: "Partial Project",
				shortDescription: "A project with some sections",
				longDescription: "Detailed description here",
				badges: badges,
				features: ["Cool feature"],
				installation: "",
				usage: "Just use it!",
				roadmap: "",
				faq: "",
				license: "Apache-2.0",
				repositoryInfo,
			};

			// Act
			const result = builder.build(data);

			// Assert
			expect(result).toContain('<h1 align="center">Partial Project</h1>');
			expect(result).toContain(`<img src="${badges[0].toUrl()}" alt="JavaScript">`);
			expect(result).toContain("## 📖 Description");
			expect(result).toContain("## 🚀 Features");
			expect(result).toContain("- ✨ **Cool feature**");
			expect(result).toContain("## 💡 Usage");
			expect(result).toContain("Just use it!");
			expect(result).toContain("Apache-2.0");
		});

		it("should properly format multi-line content", () => {
			// Arrange
			const data = {
				title: "Multi-line Project",
				shortDescription: "Testing multi-line content",
				longDescription: "Line 1\n\nLine 2\n\nLine 3",
				badges: [],
				features: ["Feature 1\nwith details", "Feature 2\nwith more details"],
				installation: "Step 1: Do this\nStep 2: Do that\nStep 3: Done",
				usage: "```javascript\n// Example code\nconst x = 1;\n```",
				roadmap: "",
				faq: "",
				license: "",
				repositoryInfo,
			};

			// Act
			const result = builder.build(data);

			// Assert
			expect(result).toContain("Line 1\n\nLine 2\n\nLine 3");
			expect(result).toContain("- ✨ **Feature 1\nwith details**");
			expect(result).toContain("Step 1: Do this\nStep 2: Do that");
			expect(result).toContain("```javascript\n// Example code");
		});

		it("should handle special characters in content", () => {
			// Arrange
			const data = {
				title: "Project with <Special> Characters & Symbols",
				shortDescription: "Testing & validating < > \" ' characters",
				longDescription: "Contains [brackets], {braces}, and (parentheses)",
				badges: [],
				features: ["Feature with * asterisk", "Feature with _ underscore"],
				installation: "npm install --save @scope/package",
				usage: "",
				roadmap: "",
				faq: "",
				license: "",
				repositoryInfo,
			};

			// Act
			const result = builder.build(data);

			// Assert
			expect(result).toContain('<h1 align="center">Project with <Special> Characters & Symbols</h1>');
			expect(result).toContain("Testing & validating < > \" ' characters");
			expect(result).toContain("Contains [brackets], {braces}, and (parentheses)");
			expect(result).toContain("- ✨ **Feature with * asterisk**");
			expect(result).toContain("npm install --save @scope/package");
		});

		it("should generate proper badge HTML", () => {
			// Arrange
			const badges = [new Badge("Build", "success", "github-actions", "white"), new Badge("Coverage", "90%25", "codecov", "white"), new Badge("Version", "1.0.0", "npm", "white")];

			const data = {
				title: "Badge Test",
				shortDescription: "Testing badges",
				longDescription: "",
				badges: badges,
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "",
				repositoryInfo,
			};

			// Act
			const result = builder.build(data);

			// Assert
			expect(result).toContain(`<img src="${badges[0].toUrl()}" alt="Build">`);
			expect(result).toContain(`<img src="${badges[1].toUrl()}" alt="Coverage">`);
			expect(result).toContain(`<img src="${badges[2].toUrl()}" alt="Version">`);
		});

		it("should include table of contents", () => {
			// Arrange
			const data = {
				title: "TOC Test",
				shortDescription: "Testing table of contents",
				longDescription: "Description content",
				badges: [],
				features: ["Feature 1"],
				installation: "npm install",
				usage: "",
				roadmap: "",
				faq: "",
				license: "",
				repositoryInfo,
			};

			// Act
			const result = builder.build(data);

			// Assert
			expect(result).toContain("## 📚 Table of Contents");
			expect(result).toContain("- [Description](#-description)");
			expect(result).toContain("- [Features](#-features)");
			expect(result).toContain("- [Installation](#-installation)");
			expect(result).toContain("- [Usage](#-usage)");
			expect(result).toContain("- [Roadmap](#-roadmap)");
			expect(result).toContain("- [FAQ](#-faq)");
			expect(result).toContain("- [License](#-license)");
		});

		it("should clean code blocks from installation instructions", () => {
			// Arrange
			const data = {
				title: "Clean Install Test",
				shortDescription: "Testing installation cleaning",
				longDescription: "",
				badges: [],
				features: [],
				installation: "```bash\nnpm install package\n```",
				usage: "",
				roadmap: "",
				faq: "",
				license: "",
				repositoryInfo,
			};

			// Act
			const result = builder.build(data);

			// Assert
			// Should remove the ```bash markers
			expect(result).toContain("## 🛠 Installation\n```bash\nnpm install package\n```");
			expect(result).not.toContain("```bash\n```bash");
		});

		it("should include ElsiKora badge for ElsiKora repositories", () => {
			// Arrange
			const elsiKoraRepo = new RepositoryInfo({
				name: "test-repo",
				description: "Test repository",
				owner: "ElsiKora",
			});

			const data = {
				title: "ElsiKora Test",
				shortDescription: "Testing ElsiKora badge",
				longDescription: "",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "",
				repositoryInfo: elsiKoraRepo,
			};

			// Act
			const result = builder.build(data);

			// Assert
			expect(result).toContain('<a aria-label="ElsiKora logo" href="https://elsikora.com">');
			expect(result).toContain("MADE%20BY%20ElsiKora-333333.svg?style=for-the-badge");
		});

		it("should NOT include ElsiKora badge for non-ElsiKora repositories", () => {
			// Arrange
			const data = {
				title: "Other Test",
				shortDescription: "Testing non-ElsiKora repo",
				longDescription: "",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "",
				repositoryInfo, // This uses the default test-owner
			};

			// Act
			const result = builder.build(data);

			// Assert
			expect(result).not.toContain('<a aria-label="ElsiKora logo" href="https://elsikora.com">');
			expect(result).not.toContain("MADE%20BY%20ElsiKora");
		});

		it("should generate Socialify URL with custom configuration", () => {
			// Arrange
			const data = {
				title: "Socialify Test",
				shortDescription: "Testing custom Socialify config",
				longDescription: "",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "",
				repositoryInfo,
				socialifyConfig: {
					shouldShowDescription: true,
					shouldShowForks: true,
					shouldShowIssues: true,
					toUseFont: "Source Code Pro" as const,
					toUsePattern: "Floating Cogs" as const,
					toUseTheme: "Dark" as const,
				},
			};

			// Act
			const result = builder.build(data);

			// Assert
			expect(result).toContain("socialify.git.ci/test-owner/test-repo");
			expect(result).toContain("theme=Dark");
			expect(result).toContain("pattern=Floating+Cogs");
			expect(result).toContain("font=Source+Code+Pro");
		});

		it("should handle repository without owner", () => {
			// Arrange
			const repoWithoutOwner = new RepositoryInfo({
				name: "no-owner-repo",
				description: "Repository without owner",
			});

			const data = {
				title: "No Owner Test",
				shortDescription: "Testing repository without owner",
				longDescription: "",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "",
				repositoryInfo: repoWithoutOwner,
			};

			// Act
			const result = builder.build(data);

			// Assert
			expect(result).toContain("socialify.git.ci/your-username/no-owner-repo");
		});
	});
});
