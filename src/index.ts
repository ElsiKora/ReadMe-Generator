import type { IContainer } from "@elsikora/cladi";

import chalk from "chalk";
import dotenv from "dotenv";

import { createAppContainer } from "./infrastructure/di/container.js";
import { GenerateReadmeCommand } from "./presentation/cli/generate-readme.command.js";

// Load environment variables from .env file
dotenv.config();

try {
	const container: IContainer = createAppContainer();
	const command: GenerateReadmeCommand = new GenerateReadmeCommand(container);

	await command.execute();
} catch (error: unknown) {
	console.error(chalk.red("Error:"), error instanceof Error ? error.message : String(error));
	// eslint-disable-next-line @elsikora/unicorn/no-process-exit
	process.exit(1);
}
