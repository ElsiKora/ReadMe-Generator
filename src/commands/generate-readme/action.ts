import type { IGenerateReadmeOutput } from "../../services/ai/types";
import type { IRepoInfo } from "../../types";
import type { IFileContent } from "../../utils/fs/types";

import type { IGenerateReadmeArguments } from "./types";

import fs from "node:fs";
import path from "node:path";

import chalk from "chalk";
import dotenv from "dotenv";

import { EAIProvider } from "../../services/ai/provider.enum";
import { AIService } from "../../services/ai/service";
import { GithubService } from "../../services/github/service";
import { LocalService } from "../../services/local/service";
import { promptForApiKey, promptForLanguage, promptForModel, promptForOutputFile, promptForProvider, promptForRepo, promptForScanDepth } from "../../utils/cli/prompts";
import { findChangelogFile, getChangelogContent } from "../../utils/fs/changelog";
import { ProjectScanner } from "../../utils/fs/scanner";

dotenv.config();

/**
 *
 * @param {IGenerateReadmeArguments} argv - The arguments passed to the command.
 * @returns {Promise<void>} - A Promise that resolves when the action is complete.
 */
export async function generateReadmeAction(argv: IGenerateReadmeArguments): Promise<void> {
	// eslint-disable-next-line @elsikora/typescript/no-non-null-assertion
	const userRepoChoice: string = argv.repo === "." ? await promptForRepo() : argv.repo!;
	const outputFile: string = await promptForOutputFile();

	const language: string = argv.lang ?? (await promptForLanguage());
	const scanDepth: number = argv.scanDepth ?? (await promptForScanDepth());
	const provider: EAIProvider = (argv.provider as EAIProvider) || (await promptForProvider());
	const model: string = argv.model ?? (await promptForModel(provider));
	let key: string;

	switch (provider) {
		case EAIProvider.ANTHROPIC: {
			key = argv.key ?? process.env.ANTHROPIC_API_KEY ?? (await promptForApiKey(provider));

			break;
		}

		case EAIProvider.OPENAI: {
			key = argv.key ?? process.env.OPENAI_API_KEY ?? (await promptForApiKey(provider));

			break;
		}
	}

	const isRemoteRepo: boolean = userRepoChoice.includes("/") && !fs.existsSync(userRepoChoice);
	let repoInfo: IRepoInfo;

	if (isRemoteRepo) {
		const githubService: GithubService = new GithubService();
		repoInfo = await githubService.getRepoInfo(userRepoChoice);
	} else {
		const localService: LocalService = new LocalService();
		repoInfo = localService.getRepoInfo(userRepoChoice);
	}

	repoInfo.author = repoInfo.author ?? "elsikora";

	// eslint-disable-next-line @elsikora/typescript/no-non-null-assertion
	const repoPath: string = isRemoteRepo ? repoInfo.tempDir! : path.resolve(userRepoChoice);
	const scanner: ProjectScanner = new ProjectScanner();
	const files: Array<IFileContent> = await scanner.scanProject(repoPath, scanDepth);
	const projectContext: string = scanner.extractContextInfo(files);

	const basePath: string = isRemoteRepo ? "." : path.resolve(userRepoChoice);
	const changelogPath: string = findChangelogFile(basePath) ?? path.join(basePath, "CHANGELOG.md");
	const changelogContent: string = getChangelogContent(changelogPath);

	const anthropicService: AIService = new AIService(key);

	const generatedData: IGenerateReadmeOutput = await anthropicService.generateReadme({
		changelogContent,
		lang: language,
		model,
		projectContext,
		provider,
		repoInfo,
	});

	let finalReadme: string = generatedData.readme;

	if (fs.existsSync(changelogPath)) {
		// Get the relative path to the changelog file from the output file location
		const outputDirectory: string = path.dirname(outputFile);
		const relativeChangelogPath: string = path.relative(outputDirectory, changelogPath);
		finalReadme += `\n\n## 📋 Changelog\nSee [CHANGELOG.md](${relativeChangelogPath}) for details.\n`;
	}

	fs.writeFileSync(outputFile, finalReadme, "utf8");
	console.log(chalk.green(`\nREADME successfully created: ${outputFile}\n`));

	console.log(chalk.magenta("Generated data:\n"));
	console.log(`Title: ${chalk.cyan(generatedData.title)}`);
	console.log(`Short description: ${chalk.cyan(generatedData.short_description)}`);
	console.log(`Logo URL: ${chalk.cyan(generatedData.logoUrl)}`);
	console.log(`Features: ${chalk.cyan(generatedData.features.join(", "))}`);
	console.log(`Badges: ${chalk.cyan("formatted in Shields.io style")}`);
	console.log(`License: ${chalk.cyan(generatedData.license)}`);
}
