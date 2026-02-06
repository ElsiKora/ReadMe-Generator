import type { IContainer } from "@elsikora/cladi";

import type { ICliInterfaceServiceSelectOptions } from "../../application/interface/cli-interface-service-select-options.interface";
import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface";
import type { IConfigService } from "../../application/interface/config-service.interface";
import type { IConfig } from "../../application/interface/config.interface";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface";
import type { IGitCloneService } from "../../application/interface/git-clone-service.interface";
import type { IGitRepository } from "../../application/interface/git-repository.interface";
import type { IImageUploadService } from "../../application/interface/image-upload-service.interface";
import type { ILlmPromptContext } from "../../application/interface/llm-service.interface";
import type { ConfigureLLMUseCase } from "../../application/use-case/configure-llm.use-case";
import type { GenerateReadmeUseCase } from "../../application/use-case/generate-readme.use-case";
import type { LLMConfiguration, Readme } from "../../domain/index";

import fs from "node:fs/promises";

import { KILOBYTE, MAX_FILE_SIZE, MAX_TOTAL_SIZE, MEGABYTE } from "../../domain/constant/file-scanning.constant";
import { EScanDepth } from "../../domain/enum/scan-depth.enum";
import { ELogoType, RepositoryInfo } from "../../domain/index";
import { SECOND_ELEMENT_INDEX, THIRD_ELEMENT_INDEX } from "../../infrastructure/constant/logo-generator.constant";
import { CliInterfaceServiceToken, ConfigServiceToken, ConfigureLLMUseCaseToken, FileSystemServiceToken, GenerateReadmeUseCaseToken, GitCloneServiceToken, GitRepositoryToken, ImageUploadServiceToken } from "../../infrastructure/di/container";
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

		if (!cliInterface || !configService || !configureLLMUseCase || !fileSystem || !generateReadmeUseCase || !gitCloneService || !gitRepository || !imageUploadService) {
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
			const repositoryInfo: RepositoryInfo = repositoryResult.repositoryInfo;
			const projectPath: string = repositoryResult.projectPath;
			const repoSource: string = repositoryResult.repoSource;
			clonedRepoPath = repositoryResult.clonedRepoPath;

			// Check if we need to get the repository owner from the user
			const finalRepositoryInfo: RepositoryInfo = await this.handleRepositoryOwner(repositoryInfo, existingConfig, useExistingConfig);

			// Ask for logo generation preference
			const logoResult: { logoType: ELogoType; logoUrl?: string } = await this.handleLogoGeneration(existingConfig, useExistingConfig, finalRepositoryInfo);
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

			// Select language
			const language: string = await this.selectLanguage(existingConfig, useExistingConfig);

			// Configure LLM
			this.CLI_INTERFACE.info("🤖 Configuring AI provider...");
			const llmConfig: LLMConfiguration = await this.CONFIGURE_LLM_USE_CASE.execute();

			// Create prompt context
			const context: ILlmPromptContext = {
				changelogContent,
				language,
				logoType,
				logoUrl,
				projectContext,
				repositoryInfo: finalRepositoryInfo,
				scanDepth,
				scannedFiles,
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
					repositoryOwner: finalRepositoryInfo.getOwner(),
					repositorySource: repoSource as "local" | "remote",
					scanDepth,
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
	 * Extract repository information from a Git URL
	 * @param {string} gitUrl - The Git repository URL
	 * @returns {RepositoryInfo} The extracted repository information
	 */
	private extractRepoInfoFromUrl(gitUrl: string): RepositoryInfo {
		// Handle various Git URL formats
		// Examples:
		// - https://github.com/username/repo.git
		// - git@github.com:username/repo.git
		// - https://github.com/username/repo
		// - github.com/username/repo
		// - https://gitlab.com/username/repo.git
		// - git@gitlab.com:username/repo.git

		let owner: string | undefined;
		let name: string | undefined;
		let description: string = "";

		// Remove .git suffix if present
		const cleanUrl: string = gitUrl.replace(/\.git$/i, "");

		// Try to match GitHub/GitLab/Bitbucket patterns
		const patterns: Array<RegExp> = [
			// HTTPS URLs
			/https?:\/\/(?:www\.)?(github|gitlab|bitbucket)\.(?:com|org)\/([\w-]+)\/([\w.-]+)/i,
			// SSH URLs
			/git@(github|gitlab|bitbucket)\.(?:com|org):\/?([\w-]+)\/([\w.-]+)/i,
			// Short format
			/(github|gitlab|bitbucket)\.(?:com|org)\/([\w-]+)\/([\w.-]+)/i,
		];

		for (const pattern of patterns) {
			const match: null | RegExpExecArray = pattern.exec(cleanUrl);

			if (match) {
				owner = match[SECOND_ELEMENT_INDEX + 1];
				name = match[THIRD_ELEMENT_INDEX];
				description = `A ${match[SECOND_ELEMENT_INDEX]} repository`;

				break;
			}
		}

		// If no patterns matched, try to extract from generic URL
		if (!owner || !name) {
			const urlParts: Array<string> = cleanUrl.split("/");

			if (urlParts.length >= SECOND_ELEMENT_INDEX + 1) {
				name = urlParts.pop() ?? "repository";
				owner = urlParts.pop() ?? undefined;
			} else {
				name = "repository";
			}
		}

		// Create RepositoryInfo with extracted data
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

		// Try to read CHANGELOG from the project directory
		const changelogPaths: Array<string> = ["CHANGELOG.md", "CHANGELOG", "changelog.md"];

		for (const path of changelogPaths) {
			const fullPath: string = this.FILE_SYSTEM.joinPath(projectPath, path);

			if (await this.FILE_SYSTEM.exists(fullPath)) {
				changelogContent = await this.FILE_SYSTEM.readFile(fullPath);

				break;
			}
		}

		// Ask for additional context
		if (useExistingConfig && existingConfig.contextTemplate !== undefined) {
			// Use saved context (even if empty string)
			projectContext = existingConfig.contextTemplate;

			if (projectContext) {
				this.CLI_INTERFACE.info(`📌 Using saved context template`);
			} else {
				this.CLI_INTERFACE.info(`📌 Using saved preference: no additional context`);
			}
		} else {
			const hasContext: boolean = await this.CLI_INTERFACE.confirm("Would you like to provide additional project context?");

			if (hasContext) {
				projectContext = await this.CLI_INTERFACE.prompt(
					"Enter project context (purpose, features, etc.):",
					existingConfig.contextTemplate, // Use config value as default
				);
			} else {
				// Set to empty string so we save the preference
				projectContext = "";
			}
		}

		return { changelogContent, projectContext };
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
			logoUrl = await this.CLI_INTERFACE.prompt(
				"Enter the custom logo URL:",
				existingConfig.logoUrl, // Use config value as default
			);
		} else if (logoType === ELogoType.LOCAL) {
			this.CLI_INTERFACE.info("🎨 Generating logo locally...");

			try {
				// Generate the logo
				const logoBuffer: Buffer = await this.LOGO_GENERATOR_SERVICE.generateLogo(repositoryInfo.getName());

				// Save locally for preview
				const localLogoPath: string = "generated-logo.png";
				await fs.writeFile(localLogoPath, logoBuffer);
				this.CLI_INTERFACE.success(`✅ Logo saved locally as ${localLogoPath}`);

				// Try to upload to ImageShare
				try {
					this.CLI_INTERFACE.info("📤 Uploading logo to ImageShare...");
					const fileName: string = `${repositoryInfo.getName()}-logo-${Date.now()}.png`;
					logoUrl = await this.IMAGE_UPLOAD_SERVICE.uploadImage(logoBuffer, fileName);
					this.CLI_INTERFACE.success(`✅ Logo uploaded successfully: ${logoUrl}`);
				} catch (uploadError) {
					this.CLI_INTERFACE.error(`⚠️  Failed to upload logo: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`);

					// Ask if user wants to continue with local file or provide URL manually
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
				// Fall back to Socialify
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
			// First check if we have a default owner in config
			const configOwner: string | undefined = existingConfig.repositoryOwner;

			if (configOwner && useExistingConfig) {
				// Use the configured owner
				const finalRepositoryInfo: RepositoryInfo = new RepositoryInfo({
					codeStats: repositoryInfo.getCodeStats(),
					defaultBranch: repositoryInfo.getDefaultBranch(),
					description: repositoryInfo.getDescription(),
					name: repositoryInfo.getName(),
					owner: configOwner,
				});

				this.CLI_INTERFACE.info(`📌 Using saved repository owner: ${configOwner}`);

				return finalRepositoryInfo;
			} else {
				this.CLI_INTERFACE.info("⚠️  Could not determine repository owner from git remote or package.json");

				const shouldProvideOwner: boolean = await this.CLI_INTERFACE.confirm("Would you like to provide the GitHub username/organization? (Required for proper Socialify image generation)");

				if (shouldProvideOwner) {
					const owner: string = await this.CLI_INTERFACE.prompt(
						"Enter GitHub username or organization:",
						configOwner, // Use config value as default
					);

					if (owner && typeof owner === "string" && owner.trim()) {
						// Create a new RepositoryInfo with the provided owner
						return new RepositoryInfo({
							codeStats: repositoryInfo.getCodeStats(),
							defaultBranch: repositoryInfo.getDefaultBranch(),
							description: repositoryInfo.getDescription(),
							name: repositoryInfo.getName(),
							owner: owner.trim(),
						});
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
			// Use saved repository source preference
			repoSource = existingConfig.repositorySource;
			this.CLI_INTERFACE.info(`📌 Using saved repository source: ${repoSource === "local" ? "current directory" : "Git URL"}`);
		} else if (useExistingConfig) {
			// Using saved config but repositorySource is not saved (old config)
			// Default to local repository
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
			// Get Git URL from user with validation
			const gitUrl: string = await this.CLI_INTERFACE.prompt("Enter Git repository URL (e.g., https://github.com/username/repo.git):", undefined, (value: string) => {
				if (!this.isValidGitUrl(value)) {
					return "❌ Invalid Git repository URL. Supported formats: https://github.com/username/repo.git, git@github.com:username/repo.git";
				}

				return true;
			});

			// Extract repository info from URL
			repositoryInfo = this.extractRepoInfoFromUrl(gitUrl);

			// Always clone repository for file scanning
			this.CLI_INTERFACE.info("🔄 Cloning repository...");

			try {
				clonedRepoPath = await this.GIT_CLONE_SERVICE.cloneRepository(gitUrl);
				projectPath = clonedRepoPath;
				this.CLI_INTERFACE.success(`✅ Repository cloned successfully`);

				// Try to get more accurate repository info from the cloned repo
				const originalCwd: string = process.cwd();

				try {
					process.chdir(clonedRepoPath);
					const clonedRepoInfo: RepositoryInfo = await this.GIT_REPOSITORY.getRepositoryInfo();

					// Merge the information, preferring cloned repo info but keeping URL-extracted owner if needed
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
			// Use local repository
			const isGitRepo: boolean = await this.GIT_REPOSITORY.isGitRepository();

			if (!isGitRepo) {
				this.CLI_INTERFACE.error("❌ Current directory is not a Git repository");
				const shouldContinue: boolean = await this.CLI_INTERFACE.confirm("Would you like to continue anyway?");

				if (!shouldContinue) {
					throw new Error("User cancelled - not a Git repository");
				}
			}

			// Get repository info from local directory
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

		// Common Git URL patterns
		const patterns: Array<RegExp> = [
			// HTTPS URLs
			/^https?:\/\/(?:www\.)?(github|gitlab|bitbucket)\.(?:com|org)\/[\w-]+\/[\w.-]+$/i,
			// SSH URLs
			/^git@(github|gitlab|bitbucket)\.(?:com|org):\S[^\s/]*\/\S+$/i,
			// Git protocol
			/^git:\/\/(?:www\.)?(github|gitlab|bitbucket)\.(?:com|org)\/[\w-]+\/[\w.-]+$/i,
			// Generic HTTPS Git URL (for self-hosted)
			/^https?:\/\/\S[^\s/]*\/\S[^\s/]*\/\S+$/i,
			// Generic SSH URL (for self-hosted)
			/^[\w-]+@[\w.-]+:[\w-]+\/[\w.-]+$/,
		];

		// Check if URL matches any pattern
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

			// Read file contents with size limits
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
					// Skip files that can't be read
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
