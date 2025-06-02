/**
 * Interface for CLI interaction service
 */
export interface ICliInterfaceService {
	/**
	 * Show a confirmation prompt
	 * @param {string} message - The prompt message
	 * @param {boolean} defaultValue - The default value
	 * @returns {Promise<boolean>} Promise resolving to the user's choice
	 */
	confirm(message: string, defaultValue?: boolean): Promise<boolean>;

	/**
	 * Show an error message
	 * @param {string} message - The error message to show
	 */
	error(message: string): void;

	/**
	 * Show an info message
	 * @param {string} message - The message to show
	 */
	info(message: string): void;

	/**
	 * Show a text input prompt
	 * @param {string} message - The prompt message
	 * @param {string} defaultValue - The default value
	 * @param {Function} validate - Optional validation function that returns true or error message
	 * @returns {Promise<string>} Promise resolving to the user input
	 */
	prompt(message: string, defaultValue?: string, validate?: (value: string) => boolean | string): Promise<string>;

	/**
	 * Show a select prompt
	 * @param {string} message - The prompt message
	 * @param {Array<ISelectOption<T>>} options - The options to select from
	 * @returns {Promise<T>} Promise resolving to the selected value
	 */
	select<T = string>(message: string, options: Array<ISelectOption<T>>): Promise<T>;

	/**
	 * Show a success message
	 * @param {string} message - The success message to show
	 */
	success(message: string): void;
}

/**
 * Options for select prompts
 */
export interface ISelectOption<T = string> {
	hint?: string;
	label: string;
	value: T;
}
