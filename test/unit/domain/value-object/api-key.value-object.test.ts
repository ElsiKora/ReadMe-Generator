import { describe, it, expect } from "vitest";

import { ApiKey } from "../../../../src/domain/value-object/api-key.value-object.js";

describe("ApiKey Value Object", () => {
	it("should create a valid API key", () => {
		// Arrange
		const value = "test-api-key-123";

		// Act
		const apiKey = new ApiKey(value);

		// Assert
		expect(apiKey.getValue()).toBe(value);
	});

	it("should trim whitespace from API key", () => {
		// Arrange
		const value = "  test-api-key-123  ";

		// Act
		const apiKey = new ApiKey(value);

		// Assert
		expect(apiKey.getValue()).toBe("test-api-key-123");
	});

	it("should throw error for empty API key", () => {
		// Act & Assert
		expect(() => new ApiKey("")).toThrow("API key cannot be empty");
	});

	it("should throw error for whitespace-only API key", () => {
		// Act & Assert
		expect(() => new ApiKey("   ")).toThrow("API key cannot be empty");
	});

	it("should correctly compare equal API keys", () => {
		// Arrange
		const apiKey1 = new ApiKey("test-key");
		const apiKey2 = new ApiKey("test-key");

		// Act & Assert
		expect(apiKey1.equals(apiKey2)).toBe(true);
	});

	it("should correctly compare different API keys", () => {
		// Arrange
		const apiKey1 = new ApiKey("test-key-1");
		const apiKey2 = new ApiKey("test-key-2");

		// Act & Assert
		expect(apiKey1.equals(apiKey2)).toBe(false);
	});
});
