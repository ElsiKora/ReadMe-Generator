import type { Command } from "commander";

import type { IGenerateReadmeArguments } from "./types";

import { generateReadmeAction } from "./action";

export function createGenerateReadmeCommand(program: Command): Command {
	return program
		.command("generate [repo]")
		.description(
			`Generate README for a repository

Examples:
  $ generate .                    Generate README with interactive prompts
  $ generate -r owner/repo        Generate README for GitHub repository  
  $ generate . -l ru -d 2         Generate Russian README with level 2 scanning

For more information, visit https://github.com/yourusername/readme-generator`,
		)
		.option("-r, --repo <path>", "Local repo path or GitHub repo (owner/repo)", ".")
		.option("-l, --lang <language>", "Documentation language (en, es, fr, de, ru, etc.)")
		.option("-d, --scanDepth <depth>", "Folder scan depth (1-3)", Number)
		.option("-p, --provider <provider>", "AI provider to use (openai, anthropic)")
		.option("-m, --model <model>", "AI model to use")
		.action(async (repo: string, options: IGenerateReadmeArguments) => {
			const argumentsCommand: IGenerateReadmeArguments = {
				...options,
				repo: repo || options.repo,
			};

			await generateReadmeAction(argumentsCommand);
		});
}
