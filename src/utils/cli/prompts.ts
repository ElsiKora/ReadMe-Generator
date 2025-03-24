import type { TLanguage, TLanguageChoice, TModelChoice, TProviderChoice, TRepoMode, TRepoModeChoice, TSelectOption } from "./types";

import { cancel, isCancel, select, text } from "@clack/prompts";
import chalk from "chalk";

import { DEFAULT_LOCAL_PATH, DEFAULT_OUTPUT_FILE, DEFAULT_SCAN_DEPTH, LANGUAGE_CHOICES, PROVIDER_CHOICES, REPO_MODE_CHOICES } from "../../constants";
import { EAnthropicModel } from "../../services/ai/anthropic-model.enum";
import { EOpenAIModel } from "../../services/ai/openai-model.enum";
import { EAIProvider } from "../../services/ai/provider.enum";

/**
 *
 * @param {EAIProvider} provider - The AI provider to prompt for
 * @returns {Promise<string>} - A Promise that resolves to the API key
 */
export async function promptForApiKey(provider: EAIProvider): Promise<string> {
	const providerName: string = provider === EAIProvider.ANTHROPIC ? "Anthropic" : "OpenAI";

	// eslint-disable-next-line @elsikora/no-secrets/no-pattern-match
	const apiKey: string | symbol = await text({
		message: `Enter ${providerName} API key:`,
		validate: (value: string): string | undefined => {
			if (!value || value.trim().length === 0) {
				return "API key cannot be empty";
			}

			if (provider === EAIProvider.ANTHROPIC && !value.startsWith("sk-")) {
				return "Anthropic API key should start with 'sk-'";
			}

			if (provider === EAIProvider.OPENAI && !value.startsWith("sk-")) {
				return "OpenAI API key should start with 'sk-'";
			}

			return undefined;
		},
	});

	if (isCancel(apiKey)) {
		cancel("Operation cancelled");
		// eslint-disable-next-line @elsikora/unicorn/no-process-exit
		process.exit(0);
	}

	console.log(chalk.green(`API key provided for ${providerName}`));

	return apiKey;
}

/**
 *
 * @returns {Promise<TLanguage>} - A Promise that resolves to the selected language
 */
export async function promptForLanguage(): Promise<TLanguage> {
	const options: ReadonlyArray<TSelectOption<TLanguage>> = LANGUAGE_CHOICES.map((choice: TLanguageChoice) => ({
		label: choice.name,
		value: choice.value,
	}));

	const language: symbol | TLanguage = await select({
		message: "Select documentation language:",
		// @ts-ignore
		options,
	});

	if (isCancel(language)) {
		cancel("Operation cancelled");
		// eslint-disable-next-line @elsikora/unicorn/no-process-exit
		process.exit(0);
	}

	console.log(chalk.green(`Selected language: ${language}`));

	return language;
}

/**
 *
 * @param {EAIProvider} provider - The AI provider to prompt for
 * @returns {Promise<string>} - A Promise that resolves to the selected model
 */
export async function promptForModel(provider: EAIProvider): Promise<string> {
	const choices: Array<TModelChoice> = [];

	switch (provider) {
		case EAIProvider.ANTHROPIC: {
			const keys: ReadonlyArray<string> = Object.keys(EAnthropicModel);

			for (const key of keys) {
				const value: string = EAnthropicModel[key as keyof typeof EAnthropicModel];
				choices.push({ label: key, value });
			}

			break;
		}

		case EAIProvider.OPENAI: {
			const keys: ReadonlyArray<string> = Object.keys(EOpenAIModel);

			for (const key of keys) {
				const value: string = EOpenAIModel[key as keyof typeof EOpenAIModel];
				choices.push({ label: key, value });
			}

			break;
		}

		default: {
			throw new Error("Invalid AI provider specified");
		}
	}

	const model: string | symbol = await select({
		message: "Select AI model to use:",
		options: choices,
	});

	if (isCancel(model)) {
		cancel("Operation cancelled");
		// eslint-disable-next-line @elsikora/unicorn/no-process-exit
		process.exit(0);
	}

	console.log(chalk.green(`Selected model: ${model}`));

	return model;
}

/**
 *
 * @returns {Promise<string>} - A Promise that resolves to the output file name
 */
export async function promptForOutputFile(): Promise<string> {
	const outputFile: string | symbol = await text({
		defaultValue: DEFAULT_OUTPUT_FILE,
		message: "Enter output file name:",
		placeholder: DEFAULT_OUTPUT_FILE,
	});

	if (isCancel(outputFile)) {
		cancel("Operation cancelled");
		// eslint-disable-next-line @elsikora/unicorn/no-process-exit
		process.exit(0);
	}

	console.log(chalk.green(`Output file location: ${outputFile}`));

	return outputFile;
}

/**
 *
 * @returns {Promise<EAIProvider>} - A Promise that resolves to the selected AI provider
 */
export async function promptForProvider(): Promise<EAIProvider> {
	const options: ReadonlyArray<TSelectOption<EAIProvider>> = PROVIDER_CHOICES.map((choice: TProviderChoice) => ({
		label: choice.name,
		value: choice.value,
	}));

	const provider: EAIProvider | symbol = await select({
		message: "Select AI provider:",
		// @ts-ignore
		options,
	});

	if (isCancel(provider)) {
		cancel("Operation cancelled");
		// eslint-disable-next-line @elsikora/unicorn/no-process-exit
		process.exit(0);
	}

	console.log(chalk.green(`Selected provider: ${provider}`));

	return provider;
}

/**
 *
 * @returns {Promise<string>} - A Promise that resolves to the output file name
 */
export async function promptForRepo(): Promise<string> {
	const options: ReadonlyArray<TSelectOption<TRepoMode>> = REPO_MODE_CHOICES.map((choice: TRepoModeChoice) => ({
		label: choice.name,
		value: choice.value,
	}));

	const repoMode: symbol | TRepoMode = await select({
		message: "Select repository location:",
		// @ts-ignore
		options,
	});

	if (isCancel(repoMode)) {
		cancel("Operation cancelled");
		// eslint-disable-next-line @elsikora/unicorn/no-process-exit
		process.exit(0);
	}

	if (repoMode === "local") {
		const repoPath: string | symbol = await text({
			defaultValue: DEFAULT_LOCAL_PATH,
			message: "Enter local repository path:",
			placeholder: DEFAULT_LOCAL_PATH,
		});

		if (isCancel(repoPath)) {
			cancel("Operation cancelled");
			// eslint-disable-next-line @elsikora/unicorn/no-process-exit
			process.exit(0);
		}

		console.log(chalk.green(`Selected local repository: ${repoPath}`));

		return repoPath;
	}

	const repoRemote: string | symbol = await text({
		message: "Enter owner/repo (e.g., vercel/next.js):",
	});

	if (isCancel(repoRemote)) {
		cancel("Operation cancelled");
		// eslint-disable-next-line @elsikora/unicorn/no-process-exit
		process.exit(0);
	}

	console.log(chalk.green(`Selected GitHub repository: ${repoRemote}`));

	return repoRemote;
}

/**
 *
 * @returns {Promise<number>} - A Promise that resolves to the selected scan depth
 */
export async function promptForScanDepth(): Promise<number> {
	const scanDepth: string | symbol = await text({
		defaultValue: DEFAULT_SCAN_DEPTH,
		message: "Enter folder scan depth:",
		validate: (value: string): string | undefined => {
			if (!/^\d+$/.test(value)) {
				return "Please enter numbers only";
			} else if (Number.parseInt(value, 10) < 1) {
				return "Depth must be greater than 0";
				// eslint-disable-next-line @elsikora/typescript/no-magic-numbers
			} else if (Number.parseInt(value, 10) > 10) {
				return "Depth must be less than 10";
			}

			return undefined;
		},
	});

	if (isCancel(scanDepth)) {
		cancel("Operation cancelled");
		// eslint-disable-next-line @elsikora/unicorn/no-process-exit
		process.exit(0);
	}

	const depth: number = Number.parseInt(scanDepth, 10);
	console.log(chalk.green(`Folder scan depth: ${String(depth)}`));

	return depth;
}
