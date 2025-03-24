import type { Command } from "commander";

import type { IGenerateReadmeArguments } from "./types";

import { generateReadmeAction } from "./action";

/**
 *
 * @param {Command} program - The command program.
 * @returns {Command} - The command program with the generate command added.
 */
export function createGenerateReadmeCommand(program: Command): Command {
	return program
		.command("generate [repo]")
		.description(
			`Generate an intelligent README for your repository

This command analyzes your repository's structure, code, and contents to automatically
generate a comprehensive README.md file. It supports multiple languages, customizable 
scanning depth, and different AI providers for content generation.

Key Features:
• Intelligent project analysis and documentation generation
• Multi-language support for international projects
• Configurable scanning depth for large repositories
• Multiple AI provider options for content generation
• Interactive mode for customized README creation

Examples:
  $ generate .                      Generate README interactively for current directory
  $ generate -r owner/repo          Generate README for a GitHub repository
  $ generate . -l ru -d 2          Generate Russian README with medium scan depth
  $ generate . -p anthropic -m claude-3  Use specific AI model for generation
  $ generate . -k <your-api-key>   Use custom API key for generation

Options:
  --repo, -r       Local repository path or GitHub repository in owner/repo format
  --lang, -l       Documentation language code (en, es, fr, de, ru, zh, ja, etc.)
  --scanDepth, -d  Directory scanning depth (1=shallow, 2=medium, 3=deep)
  --provider, -p   AI provider to use for content generation (openai, anthropic)
  --model, -m      Specific AI model to use (e.g., gpt-4, claude-3)
  --key, -k        Custom API key for the selected AI provider

Note: Interactive mode will be enabled automatically when required options are missing.
For more details and documentation, visit: https://github.com/yourusername/readme-generator`,
		)
		.option("-r, --repo <path>", "Local repo path or GitHub repo (owner/repo)", ".")
		.option("-l, --lang <language>", "Documentation language (en, es, fr, de, ru, etc.)")
		.option("-d, --scanDepth <depth>", "Folder scan depth (1-3)", Number)
		.option("-p, --provider <provider>", "AI provider to use (openai, anthropic)")
		.option("-m, --model <model>", "AI model to use")
		.option("-k, --key <key>", "API key for AI provider")
		.action(async (repo: string, options: IGenerateReadmeArguments) => {
			const argumentsCommand: IGenerateReadmeArguments = {
				...options,
				repo: repo || options.repo,
			};

			await generateReadmeAction(argumentsCommand);
		});
}
