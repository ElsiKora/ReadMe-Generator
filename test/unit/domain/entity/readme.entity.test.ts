import { describe, it, expect, beforeEach } from "vitest";

import { Readme } from "../../../../src/domain/entity/readme.entity.js";
import { Badge } from "../../../../src/domain/value-object/badge.value-object.js";

describe("Readme Entity", () => {
	describe("constructor", () => {
		it("should create a valid README with all properties", () => {
			// Arrange
			const data = {
				title: "My Project",
				shortDescription: "A short description",
				longDescription: "A detailed description",
				logoUrl: "https://example.com/logo.png",
				badges: [new Badge("TypeScript", "blue", "typescript", "white")],
				features: ["Feature 1", "Feature 2"],
				installation: "npm install my-project",
				usage: "npm start",
				roadmap: "| Task | Status |\n|------|--------|\n| Feature | ✅ |",
				faq: "Q: What is this?\nA: A project",
				license: "MIT",
				content: "# Full README content",
			};

			// Act
			const readme = new Readme(data);

			// Assert
			expect(readme.getTitle()).toBe(data.title);
			expect(readme.getShortDescription()).toBe(data.shortDescription);
			expect(readme.getLongDescription()).toBe(data.longDescription);
			expect(readme.getLogoUrl()).toBe(data.logoUrl);
			expect(readme.getBadges()).toEqual(data.badges);
			expect(readme.getFeatures()).toEqual(data.features);
			expect(readme.getInstallation()).toBe(data.installation);
			expect(readme.getUsage()).toBe(data.usage);
			expect(readme.getRoadmap()).toBe(data.roadmap);
			expect(readme.getFaq()).toBe(data.faq);
			expect(readme.getLicense()).toBe(data.license);
			expect(readme.getContent()).toBe(data.content);
		});

		it("should create a README with minimal properties", () => {
			// Arrange
			const data = {
				title: "Minimal Project",
				shortDescription: "Minimal description",
				longDescription: "",
				logoUrl: "",
				badges: [],
				features: [],
				installation: "",
				usage: "",
				roadmap: "",
				faq: "",
				license: "",
				content: "",
			};

			// Act
			const readme = new Readme(data);

			// Assert
			expect(readme.getTitle()).toBe(data.title);
			expect(readme.getShortDescription()).toBe(data.shortDescription);
			expect(readme.getLongDescription()).toBe("");
			expect(readme.getLogoUrl()).toBe("");
			expect(readme.getBadges()).toEqual([]);
			expect(readme.getFeatures()).toEqual([]);
			expect(readme.getInstallation()).toBe("");
			expect(readme.getUsage()).toBe("");
			expect(readme.getRoadmap()).toBe("");
			expect(readme.getFaq()).toBe("");
			expect(readme.getLicense()).toBe("");
			expect(readme.getContent()).toBe("");
		});
	});

	describe("getters", () => {
		let readme: Readme;

		beforeEach(() => {
			readme = new Readme({
				title: "Test Project",
				shortDescription: "Test description",
				longDescription: "Detailed test description",
				logoUrl: "https://test.com/logo.png",
				badges: [
					new Badge("JavaScript", "yellow", "javascript", "black"),
					new Badge("Node.js", "green", "node.js", "white"),
				],
				features: ["Fast", "Reliable", "Scalable"],
				installation: "npm install test-project",
				usage: "const test = require('test-project');",
				roadmap: "| Feature | Status |\n|---------|--------|\n| API v2 | 🚧 |",
				faq: "Q: Is it tested?\nA: Yes, extensively",
				license: "Apache-2.0",
				content: "# Test Project\n\nThis is a test project.",
			});
		});

		it("should return correct title", () => {
			expect(readme.getTitle()).toBe("Test Project");
		});

		it("should return correct short description", () => {
			expect(readme.getShortDescription()).toBe("Test description");
		});

		it("should return correct long description", () => {
			expect(readme.getLongDescription()).toBe("Detailed test description");
		});

		it("should return correct logo URL", () => {
			expect(readme.getLogoUrl()).toBe("https://test.com/logo.png");
		});

		it("should return correct badges", () => {
			const badges = readme.getBadges();
			expect(badges).toHaveLength(2);
			expect(badges[0].getName()).toBe("JavaScript");
			expect(badges[1].getName()).toBe("Node.js");
		});

		it("should return correct features", () => {
			expect(readme.getFeatures()).toEqual(["Fast", "Reliable", "Scalable"]);
		});

		it("should return correct installation instructions", () => {
			expect(readme.getInstallation()).toBe("npm install test-project");
		});

		it("should return correct usage instructions", () => {
			expect(readme.getUsage()).toBe("const test = require('test-project');");
		});

		it("should return correct roadmap", () => {
			expect(readme.getRoadmap()).toContain("API v2");
		});

		it("should return correct FAQ", () => {
			expect(readme.getFaq()).toContain("Is it tested?");
		});

		it("should return correct license", () => {
			expect(readme.getLicense()).toBe("Apache-2.0");
		});

		it("should return correct content", () => {
			expect(readme.getContent()).toContain("Test Project");
		});
	});
}); 