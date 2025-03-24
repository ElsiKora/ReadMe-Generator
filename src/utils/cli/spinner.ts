import type { TSpinnerInstance } from "./types";

import { spinner } from "@clack/prompts";

/**
 *
 * @param {string} text - The text to display
 * @returns {TSpinnerInstance} - The spinner instance
 */
export function startSpinner(text: string = "Processing..."): TSpinnerInstance {
	const s: { message: (message?: string) => void; start: (message?: string) => void; stop: (message?: string, code?: number) => void } = spinner();

	s.start(text);

	return {
		stop: (message?: string): void => {
			s.stop(message);
		},
	};
}

/**
 *
 * @param {TSpinnerInstance} spinnerInstance - The spinner instance
 * @param {string} text - The text to display
 * @param {boolean} isSuccess - Whether the spinner should display a success message
 * @returns {void}
 */
export function stopSpinner(spinnerInstance: TSpinnerInstance, text: string = "Done", isSuccess: boolean = true): void {
	if (!spinnerInstance) return;

	spinnerInstance.stop(isSuccess ? `✓ ${text}` : `✕ ${text}`);
}
