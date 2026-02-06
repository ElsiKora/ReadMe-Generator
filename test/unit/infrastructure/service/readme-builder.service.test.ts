import { describe, it, expect, beforeEach } from "vitest";

import { ReadmeBuilder } from "../../../../src/infrastructure/service/readme-builder.service";
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
			expect(result).toContain("socialify.git.ci/test-owner/test-repo");
			expect(result).toContain(`alt="Node.js"`);
			expect(result).toContain(`alt="TypeScript"`);
			expect(result).toContain(`alt="npm"`);
		});

		it("should include highlights callout when provided", () => {
			const data = {
				title: "Highlight Project",
				shortDescription: "Test highlights",
				longDescription: "Description",
				badges: [],
				features: ["Feature"],
				installation: "npm install",
				usage: "Use it",
				roadmap: "",
				faq: "",
				license: "MIT",
				repositoryInfo,
				highlights: ["Blazing fast performance", "Zero configuration", "Type-safe APIs"],
			};

			const result = builder.build(data);

			expect(result).toContain("## 💡 Highlights");
			expect(result).toContain("- Blazing fast performance");
			expect(result).toContain("- Zero configuration");
			expect(result).toContain("- Type-safe APIs");
		});

		it("should include tech stack table when provided", () => {
			const data = {
				title: "Stack Project",
				shortDescription: "Test tech stack",
				longDescription: "Description",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "MIT",
				repositoryInfo,
				techStack: {
					Language: ["TypeScript", "JavaScript"],
					Runtime: ["Node.js"],
					Testing: ["Vitest"],
				},
			};

			const result = builder.build(data);

			expect(result).toContain("## 🛠️ Tech Stack");
			expect(result).toContain("| **Language** | TypeScript, JavaScript |");
			expect(result).toContain("| **Runtime** | Node.js |");
			expect(result).toContain("| **Testing** | Vitest |");
		});

		it("should include mermaid architecture diagram", () => {
			const data = {
				title: "Diagram Project",
				shortDescription: "Test diagrams",
				longDescription: "Description",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "MIT",
				repositoryInfo,
				mermaidDiagrams: {
					architecture: "flowchart TD\n    A[Client] --> B[Server]",
					dataFlow: "sequenceDiagram\n    User->>API: Request",
				},
			};

			const result = builder.build(data);

			expect(result).toContain("## 🏗 Architecture");
			expect(result).toContain("### System Architecture");
			expect(result).toContain("```mermaid\nflowchart TD\n    A[Client] --> B[Server]\n```");
			expect(result).toContain("### Data Flow");
			expect(result).toContain("```mermaid\nsequenceDiagram\n    User->>API: Request\n```");
		});

		it("should include prerequisites when provided", () => {
			const data = {
				title: "Prereq Project",
				shortDescription: "Test prereqs",
				longDescription: "Description",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "MIT",
				repositoryInfo,
				prerequisites: ["Node.js >= 18.0.0", "npm >= 9.0.0"],
			};

			const result = builder.build(data);

			expect(result).toContain("## 📋 Prerequisites");
			expect(result).toContain("- Node.js >= 18.0.0");
			expect(result).toContain("- npm >= 9.0.0");
		});

		it("should include contributing section when flag is enabled", () => {
			const data = {
				title: "Contributing Project",
				shortDescription: "Test contributing",
				longDescription: "Description",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "MIT",
				repositoryInfo,
				contributing: "Please read CONTRIBUTING.md before submitting a PR.",
				shouldIncludeContributing: true,
			};

			const result = builder.build(data);

			expect(result).toContain("## 🤝 Contributing");
			expect(result).toContain("Please read CONTRIBUTING.md before submitting a PR.");
		});

		it("should NOT include contributing section when flag is disabled", () => {
			const data = {
				title: "No Contributing Project",
				shortDescription: "Test no contributing",
				longDescription: "Description",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "MIT",
				repositoryInfo,
				contributing: "Please read CONTRIBUTING.md before submitting a PR.",
				shouldIncludeContributing: false,
			};

			const result = builder.build(data);

			expect(result).not.toContain("## 🤝 Contributing");
		});

		it("should include collapsible FAQ and roadmap sections", () => {
			const data = {
				title: "Collapsible Test",
				shortDescription: "Test collapsible",
				longDescription: "Description",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "| Task | Status |\n|------|--------|\n| Feature | ✅ Done |",
				faq: "Q: Test?\nA: Yes",
				license: "MIT",
				repositoryInfo,
			};

			const result = builder.build(data);

			expect(result).toContain("<details>");
			expect(result).toContain("<summary>Click to expand</summary>");
		});

		it("should include project structure when directoryTree is set", () => {
			const repoWithTree = new RepositoryInfo({
				name: "test-repo",
				description: "Test",
				owner: "test-owner",
				directoryTree: "src/\n├── index.ts\n└── utils/",
			});

			const data = {
				title: "Tree Test",
				shortDescription: "Test tree",
				longDescription: "Description",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "MIT",
				repositoryInfo: repoWithTree,
			};

			const result = builder.build(data);

			expect(result).toContain("## 📁 Project Structure");
			expect(result).toContain("src/");
			expect(result).toContain("├── index.ts");
		});

		it("should include dynamic GitHub badges when shouldIncludeGithubBadges is true", () => {
			const data = {
				title: "GitHub Badge Test",
				shortDescription: "Test badges",
				longDescription: "Description",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "MIT",
				repositoryInfo,
				shouldIncludeGithubBadges: true,
			};

			const result = builder.build(data);

			expect(result).toContain("img.shields.io/github/stars/test-owner/test-repo");
			expect(result).toContain("img.shields.io/github/forks/test-owner/test-repo");
			expect(result).toContain("img.shields.io/github/issues/test-owner/test-repo");
			expect(result).toContain("img.shields.io/github/last-commit/test-owner/test-repo");
		});

		it("should NOT include dynamic GitHub badges when shouldIncludeGithubBadges is false", () => {
			const data = {
				title: "No GitHub Badge Test",
				shortDescription: "Test no badges",
				longDescription: "Description",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "MIT",
				repositoryInfo,
				shouldIncludeGithubBadges: false,
			};

			const result = builder.build(data);

			expect(result).not.toContain("img.shields.io/github/stars");
		});

		it("should include contributors section when git stats available", () => {
			const repoWithContributors = new RepositoryInfo({
				name: "test-repo",
				description: "Test",
				owner: "test-owner",
				gitStats: {
					commitCount: 100,
					contributors: [
						{ name: "Alice", email: "alice@test.com", commits: 60 },
						{ name: "Bob", email: "bob@test.com", commits: 40 },
					],
					branchCount: 3,
					tags: [],
				},
			});

			const data = {
				title: "Contributors Test",
				shortDescription: "Test contributors",
				longDescription: "Description",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "MIT",
				repositoryInfo: repoWithContributors,
				shouldIncludeContributors: true,
			};

			const result = builder.build(data);

			expect(result).toContain("## 👥 Contributors");
			expect(result).toContain("contrib.rocks/image?repo=test-owner/test-repo");
			expect(result).toContain("| Alice | 60 |");
			expect(result).toContain("| Bob | 40 |");
		});

		it("should include footer with back-to-top link", () => {
			const data = {
				title: "Footer Test",
				shortDescription: "Test footer",
				longDescription: "Description",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "MIT",
				repositoryInfo,
			};

			const result = builder.build(data);

			expect(result).toContain('<a href="#top">Back to Top</a>');
			expect(result).toContain('<a id="top"></a>');
		});

		it("should include ElsiKora badge for ElsiKora repositories", () => {
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

			const result = builder.build(data);

			expect(result).toContain('<a aria-label="ElsiKora logo" href="https://elsikora.com">');
			expect(result).toContain("MADE%20BY%20ElsiKora-333333.svg?style=for-the-badge");
		});

		it("should NOT include ElsiKora badge for non-ElsiKora repositories", () => {
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
				repositoryInfo,
			};

			const result = builder.build(data);

			expect(result).not.toContain('<a aria-label="ElsiKora logo" href="https://elsikora.com">');
			expect(result).not.toContain("MADE%20BY%20ElsiKora");
		});

		it("should include table of contents with dynamic entries", () => {
			const data = {
				title: "TOC Test",
				shortDescription: "Testing table of contents",
				longDescription: "Description",
				badges: [],
				features: [],
				installation: "npm install",
				usage: "",
				roadmap: "",
				faq: "",
				license: "",
				repositoryInfo,
				techStack: { Language: ["TypeScript"] },
				prerequisites: ["Node.js >= 18"],
				contributing: "Contribute here",
				shouldIncludeContributing: true,
				acknowledgments: "Thanks",
				mermaidDiagrams: { architecture: "flowchart TD\n  A-->B" },
			};

			const result = builder.build(data);

			expect(result).toContain("## 📚 Table of Contents");
			expect(result).toContain("- [Description](#-description)");
			expect(result).toContain("- [Tech Stack](#-tech-stack)");
			expect(result).toContain("- [Features](#-features)");
			expect(result).toContain("- [Architecture](#-architecture)");
			expect(result).toContain("- [Prerequisites](#-prerequisites)");
			expect(result).toContain("- [Installation](#-installation)");
			expect(result).toContain("- [Usage](#-usage)");
			expect(result).toContain("- [Contributing](#-contributing)");
			expect(result).toContain("- [Roadmap](#-roadmap)");
			expect(result).toContain("- [FAQ](#-faq)");
			expect(result).toContain("- [License](#-license)");
			expect(result).toContain("- [Acknowledgments](#-acknowledgments)");
		});

		it("should handle repository without owner", () => {
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

			const result = builder.build(data);

			expect(result).toContain("socialify.git.ci/your-username/no-owner-repo");
		});
	});
});
