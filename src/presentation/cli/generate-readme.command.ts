import type { IContainer } from "@elsikora/cladi";

import type { ICliInterfaceService, ISelectOption } from "../../application/interface/cli-interface-service.interface.js";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface.js";
import type { IGitRepository } from "../../application/interface/git-repository.interface.js";
import type { ILlmPromptContext } from "../../application/interface/llm-service.interface.js";
import type { ConfigureLLMUseCase } from "../../application/use-case/configure-llm.use-case.js";
import type { GenerateReadmeUseCase } from "../../application/use-case/generate-readme.use-case.js";
import type { RepositoryInfo } from "../../domain/entity/repository-info.entity.js";
import type { LLMConfiguration, Readme } from "../../domain/index.js";

import { CliInterfaceServiceToken, ConfigureLLMUseCaseToken, FileSystemServiceToken, GenerateReadmeUseCaseToken, GitRepositoryToken } from "../../infrastructure/di/container.js";

/**
 * CLI command for generating README
 */
export class GenerateReadmeCommand {
	private readonly CLI_INTERFACE: ICliInterfaceService;

	private readonly CONFIGURE_LLM_USE_CASE: ConfigureLLMUseCase;

	private readonly FILE_SYSTEM: IFileSystemService;

	private readonly GENERATE_README_USE_CASE: GenerateReadmeUseCase;

	private readonly GIT_REPOSITORY: IGitRepository;

	constructor(container: IContainer) {
		// Get all services from the container - trust that they are properly registered
		const cliInterface: ICliInterfaceService | undefined = container.get<ICliInterfaceService>(CliInterfaceServiceToken);
		const configureLLMUseCase: ConfigureLLMUseCase | undefined = container.get<ConfigureLLMUseCase>(ConfigureLLMUseCaseToken);
		const fileSystem: IFileSystemService | undefined = container.get<IFileSystemService>(FileSystemServiceToken);
		const generateReadmeUseCase: GenerateReadmeUseCase | undefined = container.get<GenerateReadmeUseCase>(GenerateReadmeUseCaseToken);
		const gitRepository: IGitRepository | undefined = container.get<IGitRepository>(GitRepositoryToken);

		if (!cliInterface || !configureLLMUseCase || !fileSystem || !generateReadmeUseCase || !gitRepository) {
			throw new Error("Required services not found in container");
		}

		this.CLI_INTERFACE = cliInterface;
		this.CONFIGURE_LLM_USE_CASE = configureLLMUseCase;
		this.FILE_SYSTEM = fileSystem;
		this.GENERATE_README_USE_CASE = generateReadmeUseCase;
		this.GIT_REPOSITORY = gitRepository;
	}

	/**
	 * Execute the command
	 */
	async execute(): Promise<void> {
		try {
			this.CLI_INTERFACE.info("🚀 ReadMe Generator - AI-powered README creation");

			// Get repository info
			const repositoryInfo: RepositoryInfo = await this.GIT_REPOSITORY.getRepositoryInfo();

			// Check for existing files
			let changelogContent: string | undefined;
			let projectContext: string | undefined;

			// Try to read CHANGELOG
			const changelogPaths: Array<string> = ["CHANGELOG.md", "CHANGELOG", "changelog.md"];

			for (const path of changelogPaths) {
				if (await this.FILE_SYSTEM.exists(path)) {
					changelogContent = await this.FILE_SYSTEM.readFile(path);

					break;
				}
			}

			// Ask for additional context
			const hasContext: boolean = await this.CLI_INTERFACE.confirm("Would you like to provide additional project context?");

			if (hasContext) {
				projectContext = await this.CLI_INTERFACE.prompt("Enter project context (purpose, features, etc.):");
			}

			// Select language
			const languages: Array<ISelectOption> = [
				{ label: "English", value: "en" },
				{ label: "Spanish", value: "es" },
				{ label: "French", value: "fr" },
				{ label: "German", value: "de" },
				{ label: "Russian", value: "ru" },
			];
			const language: string = await this.CLI_INTERFACE.select("Select README language:", languages);

			// Configure LLM
			this.CLI_INTERFACE.info("Configuring AI provider...");
			const llmConfig: LLMConfiguration = await this.CONFIGURE_LLM_USE_CASE.execute();

			// Create prompt context
			const context: ILlmPromptContext = {
				changelogContent,
				language,
				projectContext,
				repositoryInfo,
			};

			// Generate README
			this.CLI_INTERFACE.info("Generating README with AI...");
			const readme: Readme = await this.GENERATE_README_USE_CASE.execute(context, llmConfig);

			// Save README
			await this.FILE_SYSTEM.writeFile("README.md", readme.getContent());

			this.CLI_INTERFACE.success("✨ README.md generated successfully!");
			this.CLI_INTERFACE.info(`📄 Title: ${readme.getTitle()}`);
			this.CLI_INTERFACE.info(`📝 Description: ${readme.getShortDescription()}`);
			this.CLI_INTERFACE.info(`🎯 Features: ${readme.getFeatures().length} features generated`);
		} catch (error) {
			this.CLI_INTERFACE.error(`Failed to generate README: ${error instanceof Error ? error.message : "Unknown error"}`);
			// eslint-disable-next-line @elsikora/unicorn/no-process-exit
			process.exit(1);
		}
	}
}
