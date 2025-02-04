import type { SingleBar } from "cli-progress";

import chalk from "chalk";
import cliProgress from "cli-progress";

export async function showProgressBar(text: string, duration: number = 1000): Promise<void> {
	console.log(chalk.blue(text));

	const bar: SingleBar = new cliProgress.SingleBar(
		{
			barCompleteChar: "#",
			barIncompleteChar: "-",
			format: "Progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
			// eslint-disable-next-line @elsikora-typescript/naming-convention
			hideCursor: true,
		},
		cliProgress.Presets.shades_classic,
	);

	bar.start(100, 0);

	for (let index: number = 0; index <= 100; index++) {
		// eslint-disable-next-line no-await-in-loop,@elsikora-typescript/no-redundant-type-constituents
		await new Promise((resolve: (value: PromiseLike<unknown> | unknown) => void) => {
			setTimeout(resolve, duration / 100);
		});
		bar.update(index);
	}

	bar.stop();
	console.log(chalk.green("Progress completed!\n"));
}
