import type { ICliInterfaceService } from "../../../../src/application/interface/cli-interface-service.interface";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PromptsCliInterface } from "../../../../src/infrastructure/service/prompts-cli-interface.service";

// Use vi.hoisted to ensure mocks are created before module loading
const { mockPromptsFunction, mockPrompts } = vi.hoisted(() => {
	const fn = vi.fn();
	const prompts = Object.assign(fn, {
		override: vi.fn(),
	});
	return { mockPromptsFunction: fn, mockPrompts: prompts };
});

// Mock the prompts module
vi.mock("prompts", () => ({
	default: mockPrompts,
}));

// Mock chalk
vi.mock("chalk", () => ({
	default: {
		red: vi.fn((text: string) => `[RED]${text}[/RED]`),
		green: vi.fn((text: string) => `[GREEN]${text}[/GREEN]`),
		blue: vi.fn((text: string) => `[BLUE]${text}[/BLUE]`),
		yellow: vi.fn((text: string) => `[YELLOW]${text}[/YELLOW]`),
	},
}));

describe("PromptsCliInterface", () => {
	let service: ICliInterfaceService;
	let consoleLogSpy: any;
	let consoleErrorSpy: any;
	let processExitSpy: any;

	beforeEach(() => {
		vi.clearAllMocks();

		// Reset the mock function
		mockPromptsFunction.mockReset();
		mockPrompts.override.mockReset();

		// Spy on console methods
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
			throw new Error("Process exit called");
		});

		service = new PromptsCliInterface();
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		consoleErrorSpy.mockRestore();
		processExitSpy.mockRestore();
	});

	describe("info", () => {
		it("should display info message in blue", () => {
			// Act
			service.info("Test info message");

			// Assert
			expect(consoleLogSpy).toHaveBeenCalledWith("[BLUE]Test info message[/BLUE]");
		});
	});

	describe("error", () => {
		it("should display error message in red", () => {
			// Act
			service.error("Test error message");

			// Assert
			expect(consoleErrorSpy).toHaveBeenCalledWith("[RED]Test error message[/RED]");
		});
	});

	describe("success", () => {
		it("should display success message in green", () => {
			// Act
			service.success("Test success message");

			// Assert
			expect(consoleLogSpy).toHaveBeenCalledWith("[GREEN]Test success message[/GREEN]");
		});
	});

	describe("confirm", () => {
		it("should return true when user confirms", async () => {
			// Arrange
			mockPromptsFunction.mockResolvedValue({ value: true });

			// Act
			const result = await service.confirm("Confirm?");

			// Assert
			expect(result).toBe(true);
			expect(mockPromptsFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					active: "Yes",
					inactive: "No",
					initial: false,
					message: "Confirm?",
					name: "value",
					type: "toggle",
				}),
				expect.objectContaining({
					onCancel: expect.any(Function),
				}),
			);
		});

		it("should use custom default value when provided", async () => {
			// Arrange
			mockPromptsFunction.mockResolvedValue({ value: false });

			// Act
			const result = await service.confirm("Confirm?", true);

			// Assert
			expect(result).toBe(false);
			expect(mockPromptsFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					active: "Yes",
					inactive: "No",
					initial: true,
					message: "Confirm?",
					name: "value",
					type: "toggle",
				}),
				expect.objectContaining({
					onCancel: expect.any(Function),
				}),
			);
		});

		it("should handle Ctrl+C by showing cancellation message and exiting", async () => {
			// Arrange
			mockPromptsFunction.mockImplementation((_, options) => {
				// Simulate Ctrl+C by calling onCancel
				options.onCancel();
			});

			// Act & Assert
			await expect(service.confirm("Confirm?")).rejects.toThrow("Process exit called");
			expect(consoleLogSpy).toHaveBeenCalledWith("[YELLOW]\n\n⚠️  Operation cancelled by user[/YELLOW]");
			expect(processExitSpy).toHaveBeenCalledWith(0);
		});
	});

	describe("prompt", () => {
		it("should return user input", async () => {
			// Arrange
			mockPromptsFunction.mockResolvedValue({ value: "user input" });

			// Act
			const result = await service.prompt("Enter text:");

			// Assert
			expect(result).toBe("user input");
		});

		it("should handle validation", async () => {
			// Arrange
			const validate = vi.fn((value: string) => (value.length > 3 ? true : "Too short"));
			mockPromptsFunction.mockResolvedValue({ value: "valid input" });

			// Act
			const result = await service.prompt("Enter text:", undefined, validate);

			// Assert
			expect(result).toBe("valid input");
			expect(mockPromptsFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					message: "Enter text:",
					name: "value",
					type: "text",
					validate,
				}),
				expect.any(Object),
			);
		});

		it("should handle default value", async () => {
			// Arrange
			mockPromptsFunction.mockResolvedValue({ value: "custom" });

			// Act
			const result = await service.prompt("Enter text:", "default");

			// Assert
			expect(mockPromptsFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					initial: "default",
				}),
				expect.any(Object),
			);
		});

		it("should handle Ctrl+C", async () => {
			// Arrange
			mockPromptsFunction.mockImplementation((_, options) => {
				options.onCancel();
			});

			// Act & Assert
			await expect(service.prompt("Enter text:")).rejects.toThrow("Process exit called");
			expect(consoleLogSpy).toHaveBeenCalledWith("[YELLOW]\n\n⚠️  Operation cancelled by user[/YELLOW]");
			expect(processExitSpy).toHaveBeenCalledWith(0);
		});
	});

	describe("select", () => {
		it("should return selected value", async () => {
			// Arrange
			const options = [
				{ label: "Option 1", value: "opt1" },
				{ label: "Option 2", value: "opt2", hint: "This is option 2" },
			];
			mockPromptsFunction.mockResolvedValue({ value: "opt2" });

			// Act
			const result = await service.select("Select option:", options);

			// Assert
			expect(result).toBe("opt2");
			expect(mockPromptsFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					choices: [
						{ title: "Option 1", value: "opt1" },
						{ title: "Option 2", value: "opt2" },
					],
					initial: undefined,
				}),
				expect.any(Object),
			);
		});

		it("should handle Ctrl+C", async () => {
			// Arrange
			const options = [{ label: "Option", value: "opt" }];
			mockPromptsFunction.mockImplementation((_, options) => {
				options.onCancel();
			});

			// Act & Assert
			await expect(service.select("Select:", options)).rejects.toThrow("Process exit called");
			expect(consoleLogSpy).toHaveBeenCalledWith("[YELLOW]\n\n⚠️  Operation cancelled by user[/YELLOW]");
			expect(processExitSpy).toHaveBeenCalledWith(0);
		});
	});
});
