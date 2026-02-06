import type { Dirent } from "node:fs";

import type { IContainer } from "@elsikora/cladi";

import type { ICliInterfaceServiceSelectOptions } from "../../application/interface/cli-interface-service-select-options.interface";
import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IConfigService } from "../../application/interface/config-service.interface";
import type { IConfig } from "../../application/interface/config.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";
import type { IGitCloneService } from "../../application/interface/git-clone-service.interface";
import type { IGitRepository, IGitStats, IPackageInfo } from "../../application/interface/git-repository.interface";
import type { IImageUploadService } from "../../application/interface/image-upload-service.interface";
import type { IInfrastructureDetectionService } from "../../application/interface/infrastructure-detection.interface";
import type { ILlmPromptContext } from "../../application/interface/llm-service.interface";
import type { ConfigureLLMUseCase } from "../../application/use-case/configure-llm.use-case";
import type { GenerateReadmeUseCase } from "../../application/use-case/generate-readme.use-case";
import type { IDetectedTools, ILanguageStatEntry } from "../../domain/entity/repository-info.entity";
import type { LLMConfiguration, Readme } from "../../domain/index";

import fs from "node:fs/promises";
import path from "node:path";

import { DEFAULT_SCAN_DEPTH, KILOBYTE, MAX_FILE_SIZE, MAX_TOTAL_SIZE, MEGABYTE } from "../../domain/constant/file-scanning.constant";
import { EScanDepth } from "../../domain/enum/scan-depth.enum";
import { ELogoType, RepositoryInfo } from "../../domain/index";
import { EXTENSION_LANGUAGE_MAP } from "../../infrastructure/constant/language-map.constant";
import { SECOND_ELEMENT_INDEX, THIRD_ELEMENT_INDEX } from "../../infrastructure/constant/logo-generator.constant";
import { DIRECTORY_TREE_IGNORE, PERCENTAGE_MULTIPLIER, TOP_LANGUAGES_LIMIT } from "../../infrastructure/constant/readme-generation.constant";
import { CliInterfaceServiceToken, ConfigServiceToken, ConfigureLLMUseCaseToken, FileSystemServiceToken, GenerateReadmeUseCaseToken, GitCloneServiceToken, GitRepositoryToken, ImageUploadServiceToken, InfrastructureDetectionServiceToken } from "../../infrastructure/di/container";
import { LogoGeneratorService } from "../../infrastructure/service/logo-generator.service";

/**
 * CLI command for generating README
 */
export class GenerateReadmeCommand {
	private readonly CLI_INTERFACE: ICliInterfaceService;

	private readonly CONFIG_SERVICE: IConfigService;

	private readonly CONFIGURE_LLM_USE_CASE: ConfigureLLMUseCase;

	private readonly FILE_SYSTEM: IFileSystemService;

	private readonly GENERATE_README_USE_CASE: GenerateReadmeUseCase;

	private readonly GIT_CLONE_SERVICE: IGitCloneService;

	private readonly GIT_REPOSITORY: IGitRepository;

	private readonly IMAGE_UPLOAD_SERVICE: IImageUploadService;

	private readonly INFRASTRUCTURE_DETECTION: IInfrastructureDetectionService;

	private readonly LOGO_GENERATOR_SERVICE: LogoGeneratorService;

	constructor(container: IContainer) {
		// Get all services from the container - trust that they are properly registered
		const cliInterface: ICliInterfaceService | undefined = container.get<ICliInterfaceService>(CliInterfaceServiceToken);
		const configService: IConfigService | undefined = container.get<IConfigService>(ConfigServiceToken);
		const configureLLMUseCase: ConfigureLLMUseCase | undefined = container.get<ConfigureLLMUseCase>(ConfigureLLMUseCaseToken);
		const fileSystem: IFileSystemService | undefined = container.get<IFileSystemService>(FileSystemServiceToken);
		const generateReadmeUseCase: GenerateReadmeUseCase | undefined = container.get<GenerateReadmeUseCase>(GenerateReadmeUseCaseToken);
		const gitCloneService: IGitCloneService | undefined = container.get<IGitCloneService>(GitCloneServiceToken);
		const gitRepository: IGitRepository | undefined = container.get<IGitRepository>(GitRepositoryToken);
		const imageUploadService: IImageUploadService | undefined = container.get<IImageUploadService>(ImageUploadServiceToken);
		const infrastructureDetection: IInfrastructureDetectionService | undefined = container.get<IInfrastructureDetectionService>(InfrastructureDetectionServiceToken);

		if (!cliInterface || !configService || !configureLLMUseCase || !fileSystem || !generateReadmeUseCase || !gitCloneService || !gitRepository || !imageUploadService || !infrastructureDetection) {
			throw new Error("Required services not found in container");
		}

		this.CLI_INTERFACE = cliInterface;
		this.CONFIG_SERVICE = configService;
		this.CONFIGURE_LLM_USE_CASE = configureLLMUseCase;
		this.FILE_SYSTEM = fileSystem;
		this.GENERATE_README_USE_CASE = generateReadmeUseCase;
		this.GIT_CLONE_SERVICE = gitCloneService;
		this.GIT_REPOSITORY = gitRepository;
		this.IMAGE_UPLOAD_SERVICE = imageUploadService;
		this.INFRASTRUCTURE_DETECTION = infrastructureDetection;
		this.LOGO_GENERATOR_SERVICE = new LogoGeneratorService();
	}

	/**
	 * Execute the command
	 */
	async execute(): Promise<void> {
		let clonedRepoPath: string | undefined;

		try {
			this.CLI_INTERFACE.info("🚀 ReadMe Generator - AI-powered README creation");

			// Check if we're in test environment
			const isTestEnvironment: boolean = process.env.NODE_ENV === "test" || process.env.CI === "true";

			// Load existing configuration FIRST
			const existingConfig: IConfig = await this.CONFIG_SERVICE.get();
			const hasExistingConfig: boolean = await this.CONFIG_SERVICE.exists();

			// Check if we should use cached configuration
			let useExistingConfig: boolean = false;

			// Skip loading existing configuration in test environment
			if (!isTestEnvironment && hasExistingConfig && existingConfig.shouldSkipConfirmations) {
				useExistingConfig = true;
				this.CLI_INTERFACE.info("📋 Using existing configuration (skip confirmations enabled)");
			} else if (!isTestEnvironment && hasExistingConfig) {
				useExistingConfig = await this.CLI_INTERFACE.confirm("Would you like to use saved configuration from previous run?");
			}

			// Ask user for repository source
			const repositoryResult: { clonedRepoPath?: string; projectPath: string; repositoryInfo: RepositoryInfo; repoSource: string } = await this.handleRepositorySource(existingConfig, useExistingConfig);
			let repositoryInfo: RepositoryInfo = repositoryResult.repositoryInfo;
			const projectPath: string = repositoryResult.projectPath;
			const repoSource: string = repositoryResult.repoSource;
			clonedRepoPath = repositoryResult.clonedRepoPath;

			// Check if we need to get the repository owner from the user
			repositoryInfo = await this.handleRepositoryOwner(repositoryInfo, existingConfig, useExistingConfig);

			// Ask for logo generation preference
			const logoResult: { logoType: ELogoType; logoUrl?: string } = await this.handleLogoGeneration(existingConfig, useExistingConfig, repositoryInfo);
			const logoType: ELogoType = logoResult.logoType;
			const logoUrl: string | undefined = logoResult.logoUrl;

			// Check for existing files and gather context
			const contextResult: { changelogContent?: string; projectContext?: string } = await this.gatherProjectContext(projectPath, existingConfig, useExistingConfig);
			const changelogContent: string | undefined = contextResult.changelogContent;
			const projectContext: string | undefined = contextResult.projectContext;

			// Ask for scan depth
			this.CLI_INTERFACE.info("📂 Project File Scanning");

			const scanDepthOptions: Array<ICliInterfaceServiceSelectOptions> = [
				{ label: "Shallow (1 level)", value: EScanDepth.SHALLOW.toString() },
				{ label: "Medium (2 levels)", value: EScanDepth.MEDIUM.toString() },
				{ label: "Deep (3 levels)", value: EScanDepth.DEEP.toString() },
				{ label: "Very Deep (5 levels)", value: EScanDepth.VERY_DEEP.toString() },
				{ label: "Extreme (7 levels) - May take time", value: EScanDepth.EXTREME.toString() },
				{ label: "Skip file scanning", value: EScanDepth.SKIP.toString() },
			];

			let scanDepth: EScanDepth;

			if (useExistingConfig && existingConfig.scanDepth !== undefined) {
				scanDepth = existingConfig.scanDepth as EScanDepth;
				const scanDepthDescription: string = scanDepth === EScanDepth.SKIP ? "Skip file scanning" : `${scanDepth} level(s)`;
				this.CLI_INTERFACE.info(`📌 Using saved scan depth: ${scanDepthDescription}`);
			} else {
				const scanDepthString: string = await this.CLI_INTERFACE.select("Select scan depth for project files:", scanDepthOptions);
				scanDepth = Number.parseInt(scanDepthString, 10) as EScanDepth;
			}

			// Scan project files if requested
			let scannedFiles: Array<{ content: string; path: string; size: number }> | undefined;

			if (scanDepth > EScanDepth.SKIP) {
				scannedFiles = await this.scanProjectFiles(projectPath, scanDepth);
			}

			// === NEW: Collect enhanced data ===
			this.CLI_INTERFACE.info("📊 Collecting project metadata...");

			// Collect git stats
			let gitStats: IGitStats | undefined;

			try {
				gitStats = await this.GIT_REPOSITORY.getGitStats();
				this.CLI_INTERFACE.info(`📈 Git history: ${gitStats.commitCount} commits, ${gitStats.contributors.length} contributors, ${gitStats.tags.length} tags`);
			} catch {
				this.CLI_INTERFACE.info("⚠️  Could not collect git statistics");
			}

			// Collect extended package info
			let packageInfo: IPackageInfo | undefined;

			try {
				packageInfo = await this.GIT_REPOSITORY.getExtendedPackageInfo(projectPath);

				if (packageInfo.version) {
					const licenseText: string = packageInfo.license ? " (" + packageInfo.license + ")" : "";
					this.CLI_INTERFACE.info("📦 Package: v" + packageInfo.version + licenseText);
				}
			} catch {
				this.CLI_INTERFACE.info("⚠️  Could not collect package information");
			}

			// Detect infrastructure
			let detectedTools: IDetectedTools | undefined;

			try {
				detectedTools = await this.INFRASTRUCTURE_DETECTION.detect(projectPath);
				const toolCount: number = detectedTools.cicd.length + detectedTools.containerization.length + detectedTools.linting.length + detectedTools.testing.length + detectedTools.bundlers.length + detectedTools.packageManagers.length;
				this.CLI_INTERFACE.info(`🔧 Detected ${toolCount} infrastructure tools`);
			} catch {
				this.CLI_INTERFACE.info("⚠️  Could not detect infrastructure tools");
			}

			// Compute language stats from scanned files
			let languageStats: Array<ILanguageStatEntry> | undefined;

			if (scannedFiles && scannedFiles.length > 0) {
				languageStats = this.computeLanguageStats(scannedFiles);

				if (languageStats.length > 0) {
					const topLanguages: string = languageStats
						.slice(0, TOP_LANGUAGES_LIMIT)
						.map((s: ILanguageStatEntry) => `${s.name} ${s.percentage.toFixed(0)}%`)
						.join(", ");
					this.CLI_INTERFACE.info(`📝 Languages: ${topLanguages}`);
				}
			}

			// Generate directory tree
			let directoryTree: string | undefined;

			try {
				directoryTree = await this.generateDirectoryTree(projectPath);
			} catch {
				// Ignore
			}

			// Ask about GitHub badges
			let shouldIncludeGithubBadges: boolean = false;

			if (useExistingConfig && existingConfig.shouldIncludeGithubBadges !== undefined) {
				shouldIncludeGithubBadges = existingConfig.shouldIncludeGithubBadges;
				this.CLI_INTERFACE.info(`📌 Using saved GitHub badges preference: ${shouldIncludeGithubBadges ? "enabled" : "disabled"}`);
			} else {
				shouldIncludeGithubBadges = await this.CLI_INTERFACE.confirm("Would you like to include dynamic GitHub badges (stars, forks, issues, etc.)?");
			}

			// Ask about contributors section
			let shouldIncludeContributors: boolean = false;

			if (useExistingConfig && existingConfig.shouldIncludeContributors !== undefined) {
				shouldIncludeContributors = existingConfig.shouldIncludeContributors;
				this.CLI_INTERFACE.info(`📌 Using saved contributors preference: ${shouldIncludeContributors ? "enabled" : "disabled"}`);
			} else {
				shouldIncludeContributors = await this.CLI_INTERFACE.confirm("Would you like to include a contributors section?");
			}

			// Enrich repositoryInfo with all collected data
			repositoryInfo = new RepositoryInfo({
				codeStats: repositoryInfo.getCodeStats(),
				defaultBranch: repositoryInfo.getDefaultBranch(),
				description: repositoryInfo.getDescription(),
				detectedTools,
				directoryTree,
				gitStats,
				languageStats,
				name: repositoryInfo.getName(),
				owner: repositoryInfo.getOwner(),
				packageInfo,
			});

			// Select language
			const language: string = await this.selectLanguage(existingConfig, useExistingConfig);

			// Configure LLM
			this.CLI_INTERFACE.info("🤖 Configuring AI provider...");
			const llmConfig: LLMConfiguration = await this.CONFIGURE_LLM_USE_CASE.execute();

			// Create prompt context
			const context: ILlmPromptContext = {
				changelogContent,
				directoryTree,
				gitStats,
				language,
				logoType,
				logoUrl,
				packageInfo,
				projectContext,
				repositoryInfo,
				scanDepth,
				scannedFiles,
				shouldIncludeContributors,
				shouldIncludeGithubBadges,
			};

			// Generate README
			this.CLI_INTERFACE.info("Generating README with AI...");
			const readme: Readme = await this.GENERATE_README_USE_CASE.execute(context, llmConfig);

			// Save README
			await this.FILE_SYSTEM.writeFile("README.md", readme.getContent());

			// Skip saving configuration in test environment
			if (!isTestEnvironment) {
				// Save configuration for next time
				const newConfig: Partial<IConfig> = {
					contextTemplate: projectContext,
					language,
					logoType,
					logoUrl,
					repositoryOwner: repositoryInfo.getOwner(),
					repositorySource: repoSource as "local" | "remote",
					scanDepth,
					shouldIncludeContributors,
					shouldIncludeGithubBadges,
				};

				// Merge with existing LLM config if present
				if (existingConfig.llm) {
					newConfig.llm = existingConfig.llm;
				}

				await this.CONFIG_SERVICE.merge(newConfig);
				this.CLI_INTERFACE.info("💾 Configuration saved for future use");

				// Ask if user wants to skip confirmations next time
				if (!useExistingConfig) {
					const shouldSkipFutureConfirmations: boolean = await this.CLI_INTERFACE.confirm("Would you like to skip configuration prompts in future runs?");

					if (shouldSkipFutureConfirmations) {
						await this.CONFIG_SERVICE.setProperty("shouldSkipConfirmations", true);
					}
				}
			}

			this.CLI_INTERFACE.success("✨ README.md generated successfully!");
			this.CLI_INTERFACE.info(`📄 Title: ${readme.getTitle()}`);
			this.CLI_INTERFACE.info(`📝 Description: ${readme.getShortDescription()}`);
			this.CLI_INTERFACE.info(`🎯 Features: ${readme.getFeatures().length} features generated`);

			if (readme.getHighlights().length > 0) {
				this.CLI_INTERFACE.info(`💡 Highlights: ${readme.getHighlights().length} highlights`);
			}

			if (readme.getMermaidDiagrams()) {
				this.CLI_INTERFACE.info("📊 Architecture diagrams included");
			}
		} catch (error) {
			this.CLI_INTERFACE.error(`Failed to generate README: ${error instanceof Error ? error.message : "Unknown error"}`);
			// eslint-disable-next-line @elsikora/unicorn/no-process-exit
			process.exit(1);
		} finally {
			// Clean up cloned repository if it exists
			if (clonedRepoPath) {
				try {
					await this.GIT_CLONE_SERVICE.cleanupRepository(clonedRepoPath);
					this.CLI_INTERFACE.info("🧹 Cleaned up temporary repository");
				} catch (cleanupError) {
					this.CLI_INTERFACE.info(`⚠️  Failed to clean up temporary repository: ${cleanupError instanceof Error ? cleanupError.message : "Unknown error"}`);
				}
			}
		}
	}

	/**
	 * Compute language statistics from scanned files
	 * @param {Array<{ content: string; path: string; size: number }>} scannedFiles - The scanned files
	 * @returns {Array<ILanguageStatEntry>} Language statistics sorted by percentage
	 */
	private computeLanguageStats(scannedFiles: Array<{ content: string; path: string; size: number }>): Array<ILanguageStatEntry> {
		const languageStatsMap: Map<string, { extension: string; fileCount: number; lines: number; name: string }> = new Map<string, { extension: string; fileCount: number; lines: number; name: string }>();
		let totalLines: number = 0;

		for (const file of scannedFiles) {
			const extension: string = file.path.split(".").pop()?.toLowerCase() ?? "";
			const languageName: string | undefined = EXTENSION_LANGUAGE_MAP[extension];

			if (!languageName) continue;

			const lineCount: number = file.content.split("\n").length;
			totalLines += lineCount;

			const existingEntry: { extension: string; fileCount: number; lines: number; name: string } | undefined = languageStatsMap.get(languageName);

			if (existingEntry) {
				existingEntry.fileCount++;
				existingEntry.lines += lineCount;
			} else {
				languageStatsMap.set(languageName, {
					extension,
					fileCount: 1,
					lines: lineCount,
					name: languageName,
				});
			}
		}

		if (totalLines === 0) return [];

		const result: Array<ILanguageStatEntry> = [];

		for (const [, stat] of languageStatsMap) {
			result.push({
				extension: stat.extension,
				fileCount: stat.fileCount,
				lines: stat.lines,
				name: stat.name,
				percentage: (stat.lines / totalLines) * PERCENTAGE_MULTIPLIER,
			});
		}

		// Sort by percentage descending
		result.sort((a: ILanguageStatEntry, b: ILanguageStatEntry) => b.percentage - a.percentage);

		return result;
	}

	/**
	 * Extract repository information from a Git URL
	 * @param {string} gitUrl - The Git repository URL
	 * @returns {RepositoryInfo} The extracted repository information
	 */
	private extractRepoInfoFromUrl(gitUrl: string): RepositoryInfo {
		let owner: string | undefined;
		let name: string | undefined;
		let description: string = "";

		const cleanUrl: string = gitUrl.replace(/\.git$/i, "");

		const patterns: Array<RegExp> = [/https?:\/\/(?:www\.)?(github|gitlab|bitbucket)\.(?:com|org)\/([\w-]+)\/([\w.-]+)/i, /git@(github|gitlab|bitbucket)\.(?:com|org):\/?([\w-]+)\/([\w.-]+)/i, /(github|gitlab|bitbucket)\.(?:com|org)\/([\w-]+)\/([\w.-]+)/i];

		for (const pattern of patterns) {
			const match: null | RegExpExecArray = pattern.exec(cleanUrl);

			if (match) {
				owner = match[SECOND_ELEMENT_INDEX + 1];
				name = match[THIRD_ELEMENT_INDEX];
				description = `A ${match[SECOND_ELEMENT_INDEX]} repository`;

				break;
			}
		}

		if (!owner || !name) {
			const urlParts: Array<string> = cleanUrl.split("/");

			if (urlParts.length >= SECOND_ELEMENT_INDEX + 1) {
				name = urlParts.pop() ?? "repository";
				owner = urlParts.pop() ?? undefined;
			} else {
				name = "repository";
			}
		}

		return new RepositoryInfo({
			codeStats: "",
			defaultBranch: "main",
			description: description || `Repository from ${gitUrl}`,
			name: name || "repository",
			owner,
		});
	}

	/**
	 * Gather project context including changelog and user-provided context
	 * @param {string} projectPath - The project directory path
	 * @param {IConfig} existingConfig - Existing configuration
	 * @param {boolean} useExistingConfig - Whether to use existing config
	 * @returns {Promise<{ changelogContent?: string; projectContext?: string }>} Project context
	 */
	private async gatherProjectContext(projectPath: string, existingConfig: IConfig, useExistingConfig: boolean): Promise<{ changelogContent?: string; projectContext?: string }> {
		let changelogContent: string | undefined;
		let projectContext: string | undefined;

		const changelogPaths: Array<string> = ["CHANGELOG.md", "CHANGELOG", "changelog.md"];

		for (const changePath of changelogPaths) {
			const fullPath: string = this.FILE_SYSTEM.joinPath(projectPath, changePath);

			if (await this.FILE_SYSTEM.exists(fullPath)) {
				changelogContent = await this.FILE_SYSTEM.readFile(fullPath);

				break;
			}
		}

		if (useExistingConfig && existingConfig.contextTemplate !== undefined) {
			projectContext = existingConfig.contextTemplate;

			if (projectContext) {
				this.CLI_INTERFACE.info(`📌 Using saved context template`);
			} else {
				this.CLI_INTERFACE.info(`📌 Using saved preference: no additional context`);
			}
		} else {
			const hasContext: boolean = await this.CLI_INTERFACE.confirm("Would you like to provide additional project context?");

			if (hasContext) {
				projectContext = await this.CLI_INTERFACE.prompt("Enter project context (purpose, features, etc.):", existingConfig.contextTemplate);
			} else {
				projectContext = "";
			}
		}

		return { changelogContent, projectContext };
	}

	/**
	 * Generate a directory tree string for the project
	 * @param {string} projectPath - The project directory path
	 * @param {number} maxDepth - Maximum depth (default 3)
	 * @returns {Promise<string>} The directory tree string
	 */
	private async generateDirectoryTree(projectPath: string, maxDepth: number = DEFAULT_SCAN_DEPTH): Promise<string> {
		const lines: Array<string> = [];
		const rootName: string = path.basename(projectPath);
		lines.push(`${rootName}/`);

		const ignoreDirectoryNames: Set<string> = new Set<string>(DIRECTORY_TREE_IGNORE);

		const walkDirectory = async (directory: string, prefix: string, depth: number): Promise<void> => {
			if (depth > maxDepth) return;

			try {
				const directoryEntries: Array<Dirent> = await fs.readdir(directory, { withFileTypes: true });

				const filteredEntries: Array<Dirent> = directoryEntries
					.filter((item: Dirent) => !item.name.startsWith(".") || item.name === ".github")
					.filter((item: Dirent) => !ignoreDirectoryNames.has(item.name))
					.sort((first: Dirent, second: Dirent) => {
						// Directories first
						if (first.isDirectory() && !second.isDirectory()) return -1;

						if (!first.isDirectory() && second.isDirectory()) return 1;

						return first.name.localeCompare(second.name);
					});

				for (let index: number = 0; index < filteredEntries.length; index++) {
					const currentEntry: Dirent | undefined = filteredEntries[index];

					if (!currentEntry) continue;

					const isLast: boolean = index === filteredEntries.length - 1;
					const connector: string = isLast ? "└── " : "├── ";
					const childPrefix: string = isLast ? "    " : "│   ";

					if (currentEntry.isDirectory()) {
						lines.push(`${prefix}${connector}${currentEntry.name}/`);
						await walkDirectory(path.join(directory, currentEntry.name), prefix + childPrefix, depth + 1);
					} else {
						lines.push(`${prefix}${connector}${currentEntry.name}`);
					}
				}
			} catch {
				// Ignore permission errors
			}
		};

		await walkDirectory(projectPath, "", 1);

		return lines.join("\n");
	}

	/**
	 * Handle logo generation logic
	 * @param {IConfig} existingConfig - Existing configuration
	 * @param {boolean} useExistingConfig - Whether to use existing config
	 * @param {RepositoryInfo} repositoryInfo - Repository information
	 * @returns {Promise<{ logoType: ELogoType; logoUrl?: string }>} Logo configuration
	 */
	private async handleLogoGeneration(existingConfig: IConfig, useExistingConfig: boolean, repositoryInfo: RepositoryInfo): Promise<{ logoType: ELogoType; logoUrl?: string }> {
		const logoOptions: Array<ICliInterfaceServiceSelectOptions> = [
			{ label: "Socialify (GitHub project card)", value: ELogoType.SOCIALIFY },
			{ label: "Generate locally (gradient style)", value: ELogoType.LOCAL },
			{ label: "Use custom URL", value: ELogoType.CUSTOM },
		];

		let logoType: ELogoType;
		let logoUrl: string | undefined;

		if (useExistingConfig && existingConfig.logoType) {
			logoType = existingConfig.logoType;
			logoUrl = existingConfig.logoUrl;
			this.CLI_INTERFACE.info(`📌 Using saved logo preference: ${logoType}`);
		} else {
			logoType = await this.CLI_INTERFACE.select("How would you like to generate the project logo?", logoOptions);
		}

		if (logoType === ELogoType.CUSTOM && !logoUrl) {
			logoUrl = await this.CLI_INTERFACE.prompt("Enter the custom logo URL:", existingConfig.logoUrl);
		} else if (logoType === ELogoType.LOCAL) {
			this.CLI_INTERFACE.info("🎨 Generating logo locally...");

			try {
				const logoBuffer: Buffer = await this.LOGO_GENERATOR_SERVICE.generateLogo(repositoryInfo.getName());

				const localLogoPath: string = "generated-logo.png";
				await fs.writeFile(localLogoPath, logoBuffer);
				this.CLI_INTERFACE.success(`✅ Logo saved locally as ${localLogoPath}`);

				try {
					this.CLI_INTERFACE.info("📤 Uploading logo to ImageShare...");
					const fileName: string = `${repositoryInfo.getName()}-logo-${Date.now()}.png`;
					logoUrl = await this.IMAGE_UPLOAD_SERVICE.uploadImage(logoBuffer, fileName);
					this.CLI_INTERFACE.success(`✅ Logo uploaded successfully: ${logoUrl}`);
				} catch (uploadError) {
					this.CLI_INTERFACE.error(`⚠️  Failed to upload logo: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`);

					const shouldContinueWithSocialify: boolean = await this.CLI_INTERFACE.confirm("Upload failed. Would you like to continue with Socialify instead?");

					if (shouldContinueWithSocialify) {
						logoType = ELogoType.SOCIALIFY;
						logoUrl = undefined;
					} else {
						const manualUrl: string = await this.CLI_INTERFACE.prompt("Please upload the generated-logo.png manually and provide the URL:");
						logoUrl = manualUrl.trim() ?? undefined;
					}
				}
			} catch (error) {
				this.CLI_INTERFACE.error(`Failed to generate logo: ${error instanceof Error ? error.message : "Unknown error"}`);
				logoType = ELogoType.SOCIALIFY;
			}
		}

		return { logoType, logoUrl };
	}

	/**
	 * Handle repository owner configuration
	 * @param {RepositoryInfo} repositoryInfo - Repository information
	 * @param {IConfig} existingConfig - Existing configuration
	 * @param {boolean} useExistingConfig - Whether to use existing config
	 * @returns {Promise<RepositoryInfo>} Repository information with owner
	 */
	private async handleRepositoryOwner(repositoryInfo: RepositoryInfo, existingConfig: IConfig, useExistingConfig: boolean): Promise<RepositoryInfo> {
		if (!repositoryInfo.getOwner()) {
			const configOwner: string | undefined = existingConfig.repositoryOwner;

			if (configOwner && useExistingConfig) {
				this.CLI_INTERFACE.info(`📌 Using saved repository owner: ${configOwner}`);

				return repositoryInfo.withOwner(configOwner);
			} else {
				this.CLI_INTERFACE.info("⚠️  Could not determine repository owner from git remote or package.json");

				const shouldProvideOwner: boolean = await this.CLI_INTERFACE.confirm("Would you like to provide the GitHub username/organization? (Required for proper Socialify image generation)");

				if (shouldProvideOwner) {
					const owner: string = await this.CLI_INTERFACE.prompt("Enter GitHub username or organization:", configOwner);

					if (owner && typeof owner === "string" && owner.trim()) {
						return repositoryInfo.withOwner(owner.trim());
					}
				}
			}
		}

		return repositoryInfo;
	}

	/**
	 * Handle repository source selection and cloning
	 * @param {IConfig} existingConfig - Existing configuration
	 * @param {boolean} useExistingConfig - Whether to use existing config
	 * @returns {Promise<{ clonedRepoPath?: string; projectPath: string; repoSource: string; repositoryInfo: RepositoryInfo }>} Repository information
	 */
	private async handleRepositorySource(existingConfig: IConfig, useExistingConfig: boolean): Promise<{ clonedRepoPath?: string; projectPath: string; repositoryInfo: RepositoryInfo; repoSource: string }> {
		let repoSource: string;

		if (useExistingConfig && existingConfig.repositorySource) {
			repoSource = existingConfig.repositorySource;
			this.CLI_INTERFACE.info(`📌 Using saved repository source: ${repoSource === "local" ? "current directory" : "Git URL"}`);
		} else if (useExistingConfig) {
			repoSource = "local";
			this.CLI_INTERFACE.info(`📌 Using default repository source: current directory`);
		} else {
			const repoSourceOptions: Array<ICliInterfaceServiceSelectOptions> = [
				{ label: "Use current directory (local repository)", value: "local" },
				{ label: "Provide Git repository URL", value: "remote" },
			];

			repoSource = await this.CLI_INTERFACE.select("Select repository source:", repoSourceOptions);
		}

		let repositoryInfo: RepositoryInfo;
		let projectPath: string = this.FILE_SYSTEM.getCurrentDirectory();
		let clonedRepoPath: string | undefined;

		if (repoSource === "remote") {
			const gitUrl: string = await this.CLI_INTERFACE.prompt("Enter Git repository URL (e.g., https://github.com/username/repo.git):", undefined, (value: string) => {
				if (!this.isValidGitUrl(value)) {
					return "❌ Invalid Git repository URL. Supported formats: https://github.com/username/repo.git, git@github.com:username/repo.git";
				}

				return true;
			});

			repositoryInfo = this.extractRepoInfoFromUrl(gitUrl);

			this.CLI_INTERFACE.info("🔄 Cloning repository...");

			try {
				clonedRepoPath = await this.GIT_CLONE_SERVICE.cloneRepository(gitUrl);
				projectPath = clonedRepoPath;
				this.CLI_INTERFACE.success(`✅ Repository cloned successfully`);

				const originalCwd: string = process.cwd();

				try {
					process.chdir(clonedRepoPath);
					const clonedRepoInfo: RepositoryInfo = await this.GIT_REPOSITORY.getRepositoryInfo();

					repositoryInfo = new RepositoryInfo({
						codeStats: clonedRepoInfo.getCodeStats() || repositoryInfo.getCodeStats(),
						defaultBranch: clonedRepoInfo.getDefaultBranch() || repositoryInfo.getDefaultBranch(),
						description: clonedRepoInfo.getDescription() || repositoryInfo.getDescription(),
						name: clonedRepoInfo.getName() || repositoryInfo.getName(),
						owner: clonedRepoInfo.getOwner() ?? repositoryInfo.getOwner(),
					});
				} finally {
					process.chdir(originalCwd);
				}
			} catch (error) {
				this.CLI_INTERFACE.error(`❌ Failed to clone repository: ${error instanceof Error ? error.message : "Unknown error"}`);

				throw error;
			}
		} else {
			const isGitRepo: boolean = await this.GIT_REPOSITORY.isGitRepository();

			if (!isGitRepo) {
				this.CLI_INTERFACE.error("❌ Current directory is not a Git repository");
				const shouldContinue: boolean = await this.CLI_INTERFACE.confirm("Would you like to continue anyway?");

				if (!shouldContinue) {
					throw new Error("User cancelled - not a Git repository");
				}
			}

			repositoryInfo = await this.GIT_REPOSITORY.getRepositoryInfo();
		}

		return { clonedRepoPath, projectPath, repositoryInfo, repoSource };
	}

	/**
	 * Validate a Git URL
	 * @param {string} gitUrl - The Git repository URL
	 * @returns {boolean} True if the URL is valid, false otherwise
	 */
	private isValidGitUrl(gitUrl: string): boolean {
		if (!gitUrl || gitUrl.trim() === "") {
			return false;
		}

		const patterns: Array<RegExp> = [/^https?:\/\/(?:www\.)?(github|gitlab|bitbucket)\.(?:com|org)\/[\w-]+\/[\w.-]+$/i, /^git@(github|gitlab|bitbucket)\.(?:com|org):\S[^\s/]*\/\S+$/i, /^git:\/\/(?:www\.)?(github|gitlab|bitbucket)\.(?:com|org)\/[\w-]+\/[\w.-]+$/i, /^https?:\/\/\S[^\s/]*\/\S[^\s/]*\/\S+$/i, /^[\w-]+@[\w.-]+:[\w-]+\/[\w.-]+$/];

		return patterns.some((pattern: RegExp) => pattern.test(gitUrl.trim()));
	}

	/**
	 * Scan project files
	 * @param {string} projectPath - The project directory path
	 * @param {EScanDepth} scanDepth - The scan depth
	 * @returns {Array<{ content: string; path: string; size: number }>} The scanned files
	 */
	private async scanProjectFiles(projectPath: string, scanDepth: EScanDepth): Promise<Array<{ content: string; path: string; size: number }>> {
		this.CLI_INTERFACE.info(`🔍 Scanning project files (depth: ${scanDepth})...`);

		try {
			const filePaths: Array<string> = await this.FILE_SYSTEM.listFiles(projectPath, scanDepth);

			this.CLI_INTERFACE.info(`📁 Found ${filePaths.length} files to analyze`);

			let totalSize: number = 0;

			const scannedFiles: Array<{ content: string; path: string; size: number }> = [];

			for (const filePath of filePaths) {
				if (totalSize >= MAX_TOTAL_SIZE) {
					const sizeLimitMB: number = MAX_TOTAL_SIZE / MEGABYTE;
					this.CLI_INTERFACE.info(`⚠️  Reached maximum total size limit (${sizeLimitMB}MB), stopping file scan`);

					break;
				}

				try {
					const fullPath: string = this.FILE_SYSTEM.joinPath(projectPath, filePath);
					const stats: { size: number } = await this.FILE_SYSTEM.getFileStats(fullPath);

					if (stats.size > MAX_FILE_SIZE) {
						this.CLI_INTERFACE.info(`⚠️  Skipping large file: ${filePath} (${Math.round(stats.size / KILOBYTE)}KB)`);

						continue;
					}

					const content: string = await this.FILE_SYSTEM.readFile(fullPath);
					totalSize += stats.size;

					scannedFiles.push({
						content,
						path: filePath,
						size: stats.size,
					});
				} catch {
					this.CLI_INTERFACE.info(`⚠️  Could not read file: ${filePath}`);
				}
			}

			this.CLI_INTERFACE.success(`✅ Successfully scanned ${scannedFiles.length} files (${Math.round(totalSize / KILOBYTE)}KB total)`);

			return scannedFiles;
		} catch (error) {
			this.CLI_INTERFACE.error(`Failed to scan project files: ${error instanceof Error ? error.message : "Unknown error"}`);

			return [];
		}
	}

	/**
	 * Handle language selection
	 * @param {IConfig} existingConfig - Existing configuration
	 * @param {boolean} useExistingConfig - Whether to use existing config
	 * @returns {Promise<string>} Selected language
	 */
	private async selectLanguage(existingConfig: IConfig, useExistingConfig: boolean): Promise<string> {
		const languages: Array<ICliInterfaceServiceSelectOptions> = [
			{ label: "English", value: "en" },
			{ label: "Spanish", value: "es" },
			{ label: "French", value: "fr" },
			{ label: "German", value: "de" },
			{ label: "Russian", value: "ru" },
		];

		if (useExistingConfig && existingConfig.language) {
			const language: string = existingConfig.language;

			this.CLI_INTERFACE.info(`📌 Using saved language: ${language}`);

			return language;
		}

		return this.CLI_INTERFACE.select("Select README language:", languages);
	}
}
