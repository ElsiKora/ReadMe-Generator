/* eslint-disable @elsikora/typescript/no-magic-numbers */
import type { SingleBar } from "cli-progress";

import chalk from "chalk";
import cliProgress from "cli-progress";

/**
 *
 * @param {string} text - The text to display
 * @param {number} duration - The duration of the progress bar
 * @returns {Promise<void>} - A Promise that resolves when the progress bar is complete
 */
export async function showProgressBar(text: string, duration: number = 1000): Promise<void> {
	console.log(chalk.blue(text));

	const bar: SingleBar = new cliProgress.SingleBar(
		{
			barCompleteChar: "#",
			barIncompleteChar: "-",
			format: "Progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
			// eslint-disable-next-line @elsikora/typescript/naming-convention
			hideCursor: true,
		},
		cliProgress.Presets.shades_classic,
	);

	bar.start(100, 0);

	for (let index: number = 0; index <= 100; index++) {
		// eslint-disable-next-line @elsikora/typescript/no-redundant-type-constituents
		await new Promise((resolve: (value: PromiseLike<unknown> | unknown) => void) => {
			setTimeout(resolve, duration / 100);
		});
		bar.update(index);
	}

	bar.stop();
	console.log(chalk.green("Progress completed!\n"));
}
