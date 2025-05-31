import type { ICliInterfaceService, ISelectOption } from "../../application/interface/cli-interface-service.interface.js";

import chalk from "chalk";
import prompts from "prompts";

/**
 * Prompts-based implementation of CLI interface service
 */
export class PromptsCliInterface implements ICliInterfaceService {
	/**
	 * Show a confirmation prompt
	 * @param {string} message - The prompt message
	 * @returns {Promise<boolean>} Promise resolving to the user's choice
	 */
	async confirm(message: string): Promise<boolean> {
		const promptOptions: prompts.PromptObject<"value"> = {
			message,
			name: "value",
			type: "confirm",
		};

		// Add initial value using type assertion
		// eslint-disable-next-line @elsikora/typescript/naming-convention, @elsikora/perfectionist/sort-intersection-types
		(promptOptions as prompts.PromptObject<"value"> & { initial: boolean }).initial = false;

		const response: prompts.Answers<"value"> = await prompts(promptOptions);

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
	 * @returns {Promise<string>} Promise resolving to the user input
	 */
	async prompt(message: string, withDefaultValue?: string): Promise<string> {
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

		const response: prompts.Answers<"value"> = await prompts(promptOptions);

		return (response.value as string) ?? "";
	}

	/**
	 * Show a select prompt
	 * @template T
	 * @param {string} message - The prompt message
	 * @param {Array<ISelectOption<T>>} options - The options to select from
	 * @returns {Promise<T>} Promise resolving to the selected value
	 */
	async select<T = string>(message: string, options: Array<ISelectOption<T>>): Promise<T> {
		const choices: Array<prompts.Choice> = options.map((opt: ISelectOption<T>) => ({
			description: opt.hint,
			title: opt.label,
			value: opt.value,
		}));

		const response: prompts.Answers<"value"> = await prompts({
			choices,
			message,
			name: "value",
			type: "select",
		});

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
}
