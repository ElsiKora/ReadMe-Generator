import type { ICliInterfaceServiceSelectOptions } from "../../application/interface/cli-interface-service-select-options.interface";
import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";

import chalk from "chalk";
import prompts from "prompts";

/**
 * Prompts-based implementation of CLI interface service
 */
export class PromptsCliInterface implements ICliInterfaceService {
	constructor() {
		// Set up global cancellation handler
		prompts.override({});
	}

	/**
	 * Show a confirmation prompt
	 * @param {string} message - The prompt message
	 * @param {boolean} defaultValue - The default value
	 * @returns {Promise<boolean>} Promise resolving to the user's choice
	 */
	// eslint-disable-next-line @elsikora/typescript/naming-convention
	async confirm(message: string, defaultValue: boolean = false): Promise<boolean> {
		const response: prompts.Answers<"value"> = await prompts(
			{
				active: "Yes",
				inactive: "No",
				// eslint-disable-next-line @elsikora/typescript/naming-convention
				initial: defaultValue,
				message,
				name: "value",
				type: "toggle",
			},
			{
				onCancel: () => {
					this.handleCancellation();
				},
			},
		);

		return (response.value as boolean) ?? false;
	}

	/**
	 * Show an error message
	 * @param {string} message - The error message to show
	 */
	error(message: string): void {
		console.error(chalk.red(message));
	}

	/**
	 * Show an info message
	 * @param {string} message - The message to show
	 */
	info(message: string): void {
		// eslint-disable-next-line @elsikora/javascript/no-console
		console.log(chalk.blue(message));
	}

	/**
	 * Show a text input prompt
	 * @param {string} message - The prompt message
	 * @param {string} withDefaultValue - The default value
	 * @param {Function} validate - Optional validation function that returns true or error message
	 * @returns {Promise<string>} Promise resolving to the user input
	 */
	async prompt(message: string, withDefaultValue?: string, validate?: (value: string) => boolean | string): Promise<string> {
		const promptOptions: prompts.PromptObject<"value"> = {
			message,
			name: "value",
			type: "text",
		};

		// Add initial value using type assertion
		if (withDefaultValue !== undefined) {
			// eslint-disable-next-line @elsikora/perfectionist/sort-intersection-types
			(promptOptions as prompts.PromptObject<"value"> & { initial: string }).initial = withDefaultValue;
		}

		// Add validation if provided
		if (validate) {
			(promptOptions as { validate: (value: string) => boolean | string } & prompts.PromptObject<"value">).validate = validate;
		}

		const response: prompts.Answers<"value"> = await prompts(promptOptions, {
			onCancel: () => {
				this.handleCancellation();
			},
		});

		return (response.value as string) ?? "";
	}

	/**
	 * Displays a single select prompt to the user.
	 * @param {string} message - The message to display to the user
	 * @param {Array<ICliInterfaceServiceSelectOptions>} options - Array of options to select from
	 * @param {string} initialValue - Initial selected value
	 * @returns {Promise<T>} Promise that resolves to the selected value
	 * @template T - The type of the selected value
	 */
	async select<T>(message: string, options: Array<ICliInterfaceServiceSelectOptions>, initialValue?: string): Promise<T> {
		const choices: Array<{ title: string; value: string }> = options.map((opt: ICliInterfaceServiceSelectOptions) => ({
			title: opt.label,
			value: opt.value,
		}));

		const initialIndex: number | undefined = initialValue ? choices.findIndex((choice: { title: string; value: string }) => choice.value === initialValue) : undefined;

		const response: prompts.Answers<"value"> = await prompts(
			{
				choices,
				initial: initialIndex === -1 ? 0 : initialIndex,
				message,
				name: "value",
				type: "select",
			},
			{
				onCancel: () => {
					this.handleCancellation();
				},
			},
		);

		return response.value as T;
	}

	/**
	 * Show a success message
	 * @param {string} message - The success message to show
	 */
	success(message: string): void {
		// eslint-disable-next-line @elsikora/javascript/no-console
		console.log(chalk.green(message));
	}

	/**
	 * Handle user cancellation (Ctrl+C)
	 */
	private handleCancellation(): void {
		// eslint-disable-next-line @elsikora/javascript/no-console
		console.log(chalk.yellow("\n\n⚠️  Operation cancelled by user"));
		// eslint-disable-next-line @elsikora/unicorn/no-process-exit
		process.exit(0);
	}
}
