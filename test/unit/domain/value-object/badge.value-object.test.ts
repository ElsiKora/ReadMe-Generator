import { describe, it, expect, beforeEach } from "vitest";

import { Badge } from "../../../../src/domain/value-object/badge.value-object.js";

describe("Badge Value Object", () => {
	describe("constructor", () => {
		it("should create a valid badge with all properties", () => {
			// Arrange
			const name = "TypeScript";
			const color = "blue";
			const logo = "typescript";
			const logoColor = "white";

			// Act
			const badge = new Badge(name, color, logo, logoColor);

			// Assert
			expect(badge.getName()).toBe(name);
			expect(badge.getColor()).toBe(color);
			expect(badge.getLogo()).toBe(logo);
			expect(badge.getLogoColor()).toBe(logoColor);
		});

		it("should accept badges with special characters in name", () => {
			// Arrange
			const name = "Node.js 18+";
			const color = "green";
			const logo = "node.js";
			const logoColor = "white";

			// Act
			const badge = new Badge(name, color, logo, logoColor);

			// Assert
			expect(badge.getName()).toBe(name);
		});
	});

	describe("getters", () => {
		let badge: Badge;

		beforeEach(() => {
			badge = new Badge("React", "61DAFB", "react", "000000");
		});

		it("should return correct name", () => {
			expect(badge.getName()).toBe("React");
		});

		it("should return correct color", () => {
			expect(badge.getColor()).toBe("61DAFB");
		});

		it("should return correct logo", () => {
			expect(badge.getLogo()).toBe("react");
		});

		it("should return correct logo color", () => {
			expect(badge.getLogoColor()).toBe("000000");
		});
	});

	describe("toUrl", () => {
		it("should generate correct shield.io URL", () => {
			// Arrange
			const badge = new Badge("TypeScript", "3178C6", "typescript", "white");

			// Act
			const url = badge.toUrl();

			// Assert
			expect(url).toBe("https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white");
		});

		it("should encode special characters in name", () => {
			// Arrange
			const badge = new Badge("C++", "00599C", "cplusplus", "white");

			// Act
			const url = badge.toUrl();

			// Assert
			expect(url).toContain("C%2B%2B");
			expect(url).toBe("https://img.shields.io/badge/C%2B%2B-00599C.svg?style=for-the-badge&logo=cplusplus&logoColor=white");
		});

		it("should handle spaces in name", () => {
			// Arrange
			const badge = new Badge("Visual Studio Code", "007ACC", "visualstudiocode", "white");

			// Act
			const url = badge.toUrl();

			// Assert
			expect(url).toContain("Visual%20Studio%20Code");
		});

		it("should handle complex names", () => {
			// Arrange
			const badge = new Badge("Node.js >= 18.0.0", "339933", "node.js", "white");

			// Act
			const url = badge.toUrl();

			// Assert
			expect(url).toContain(encodeURIComponent("Node.js >= 18.0.0"));
		});

		it("should generate URL with hex colors with encoded hash", () => {
			// Arrange
			const badge = new Badge("Python", "#3776AB", "python", "#FFFFFF");

			// Act
			const url = badge.toUrl();

			// Assert
			expect(url).toContain("%233776AB"); // %23 is encoded #
			expect(url).toContain("%23FFFFFF"); // %23 is encoded #
			expect(url).toBe("https://img.shields.io/badge/Python-%233776AB.svg?style=for-the-badge&logo=python&logoColor=%23FFFFFF");
		});
	});

	describe("edge cases", () => {
		it("should handle empty strings", () => {
			// Arrange & Act
			const badge = new Badge("", "", "", "");

			// Assert
			expect(badge.getName()).toBe("");
			expect(badge.getColor()).toBe("");
			expect(badge.getLogo()).toBe("");
			expect(badge.getLogoColor()).toBe("");
			expect(badge.toUrl()).toBe("https://img.shields.io/badge/-.svg?style=for-the-badge&logo=&logoColor=");
		});

		it("should handle very long names", () => {
			// Arrange
			const longName = "This is a very long badge name that might break things";
			const badge = new Badge(longName, "red", "generic", "white");

			// Act
			const url = badge.toUrl();

			// Assert
			expect(url).toContain(encodeURIComponent(longName));
		});
	});
}); 