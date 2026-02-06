import type { ICliInterfaceServiceSelectOptions } from "./cli-interface-service-select-options.interface";

/**
 * Interface for CLI user interaction services.
 * Provides methods for displaying information and collecting input from users.
 */
export interface ICliInterfaceService {
	/**
	 * Displays a confirmation prompt to the user.
	 * @param {string} message - The message to display to the user
	 * @param {boolean} defaultValue - The default value for the confirmation, defaults to false
	 * @returns {Promise<boolean>} Promise that resolves to the user's response (true for confirmed, false for declined)
	 */
	confirm(message: string, defaultValue?: boolean): Promise<boolean>;

	/**
	 * Displays an error message to the user.
	 * @param {string} message - The error message to display
	 */
	error(message: string): void;

	/**
	 * Displays an informational message to the user.
	 * @param {string} message - The info message to display
	 */
	info(message: string): void;

	/**
	 * Displays a text input prompt to the user.
	 * @param {string} message - The prompt message
	 * @param {string} defaultValue - The default value
	 * @param {Function} validate - Optional validation function that returns true or error message
	 * @returns {Promise<string>} Promise resolving to the user input
	 */
	prompt(message: string, defaultValue?: string, validate?: (value: string) => boolean | string): Promise<string>;

	/**
	 * Displays a single select prompt to the user.
	 * @param {string} message - The message to display to the user
	 * @param {Array<ICliInterfaceServiceSelectOptions>} options - Array of options to select from
	 * @param {string} initialValue - Initial selected value
	 * @returns {Promise<T>} Promise that resolves to the selected value
	 */
	select<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, initialValue?: string): Promise<T>;

	/**
	 * Displays a success message to the user.
	 * @param {string} message - The success message to display
	 */
	success(message: string): void;
}
