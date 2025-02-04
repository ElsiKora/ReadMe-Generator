import type { TSpinnerInstance } from "./types";

import { spinner } from "@clack/prompts";

export function startSpinner(text: string = "Processing..."): TSpinnerInstance {
	const s: { message: (message?: string) => void; start: (message?: string) => void; stop: (message?: string, code?: number) => void } = spinner();

	s.start(text);

	return {
		stop: (message?: string): void => {
			s.stop(message);
		},
	};
}

export function stopSpinner(spinnerInstance: TSpinnerInstance, text: string = "Done", isSuccess: boolean = true): void {
	if (!spinnerInstance) return;

	spinnerInstance.stop(isSuccess ? `✓ ${text}` : `✕ ${text}`);
}
