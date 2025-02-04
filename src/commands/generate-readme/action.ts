import type { EAIProvider } from "../../services/ai/provider.enum";
import type { IGenerateReadmeOutput } from "../../services/ai/types";
import type { IRepoInfo } from "../../types";
import type { IFileContent } from "../../utils/fs/types";

import type { IGenerateReadmeArguments } from "./types";

import fs from "node:fs";
import path from "node:path";

import chalk from "chalk";
import dotenv from "dotenv";

import { AIService } from "../../services/ai/service";
import { GithubService } from "../../services/github/service";
import { LocalService } from "../../services/local/service";
import { promptForLanguage, promptForModel, promptForOutputFile, promptForProvider, promptForRepo, promptForScanDepth } from "../../utils/cli/prompts";
import { parseChangelogTasks } from "../../utils/fs/changelog";
import { ProjectScanner } from "../../utils/fs/scanner";
dotenv.config();

if (!process.env.ANTHROPIC_API_KEY) {
	throw new Error("Error: ANTHROPIC_API_KEY not found");
}

export async function generateReadmeAction(argv: IGenerateReadmeArguments): Promise<void> {
	// eslint-disable-next-line @elsikora-typescript/no-non-null-assertion
	const userRepoChoice: string = argv.repo === "." ? await promptForRepo() : argv.repo!;
	const outputFile: string = await promptForOutputFile();

	const language: string = argv.lang ?? (await promptForLanguage());
	const scanDepth: number = argv.scanDepth ?? (await promptForScanDepth());
	const provider: EAIProvider = (argv.provider as EAIProvider) || (await promptForProvider());
	const model: string = argv.model ?? (await promptForModel(provider));

	const isRemoteRepo: boolean = userRepoChoice.includes("/") && !fs.existsSync(userRepoChoice);
	let repoInfo: IRepoInfo;
	let projectContext: string = "";

	if (isRemoteRepo) {
		const githubService: GithubService = new GithubService();
		repoInfo = await githubService.getRepoInfo(userRepoChoice);
	} else {
		const localService: LocalService = new LocalService();
		repoInfo = localService.getRepoInfo(userRepoChoice);
	}

	repoInfo.author = repoInfo.author || "elsikora";

	// eslint-disable-next-line @elsikora-typescript/no-non-null-assertion
	const repoPath: string = isRemoteRepo ? repoInfo.tempDir! : path.resolve(userRepoChoice);
	const scanner: ProjectScanner = new ProjectScanner();
	const files: Array<IFileContent> = await scanner.scanProject(repoPath, scanDepth);
	projectContext = scanner.extractContextInfo(files);

	const changelogPath: string = path.join(isRemoteRepo ? "." : path.resolve(userRepoChoice), "CHANGELOG.md");
	const doneFromChangelog: Array<string> = parseChangelogTasks(changelogPath);

	const anthropicService: AIService = new AIService(process.env.ANTHROPIC_API_KEY ?? "", process.env.OPENAI_API_KEY || "");

	const generatedData: IGenerateReadmeOutput = await anthropicService.generateReadme({
		doneFromChangelog,
		lang: language,
		model,
		projectContext,
		provider,
		repoInfo,
	});

	let finalReadme: string = generatedData.readme;

	if (fs.existsSync(changelogPath)) {
		finalReadme += "\n\n## 📋 Changelog\nSee [CHANGELOG.md](CHANGELOG.md) for details.\n";
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
