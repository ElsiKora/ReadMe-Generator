import type { IGitStats } from "../../application/interface/git-repository.interface";
import type { ILlmPromptContext } from "../../application/interface/llm-service.interface";
import type { IPromptBuilder } from "../../application/interface/prompt-builder.interface";
import type { IDetectedTools, ILanguageStatEntry } from "../../domain/entity/repository-info.entity";
import type { Badge } from "../../domain/index";

import { KILOBYTE, MAX_FILE_CONTENT_LENGTH } from "../../domain/constant/file-scanning.constant";
import { PREDEFINED_LIB_BADGES } from "../../domain/index";
import { RECENT_TAGS_LIMIT, TOP_ITEMS_LIMIT } from "../constant/readme-generation.constant";

/**
 * Service for building prompts for LLM services
 */
export class PromptBuilderService implements IPromptBuilder {
	/**
	 * Build the system prompt
	 * @param {ILlmPromptContext} context - The context for generating the README
	 * @returns {string} The system prompt
	 */
	buildSystemPrompt(context: ILlmPromptContext): string {
		const lang: string = context.language ?? "en";

		const languageInstructions: Record<string, string> = {
			de: "Erstellen Sie die README auf Deutsch.",
			en: "Generate the README in English.",
			es: "Genera el README en español.",
			fr: "Générez le README en français.",
			ru: "Создайте README на русском языке.",
		};

		const badgeInstructions: string = this.formatBadgeInstructions();

		return `You are a creative technical writer tasked with generating an engaging, comprehensive README for a software project. Based on the provided details, generate a complete README structure in JSON format with imaginative and compelling content. ${languageInstructions[lang] ?? languageInstructions.en}

The JSON must follow this structure:
{
  "title": string,             // Project name, can include emoji but no separators
  "short_description": string, // Subtitle/tagline to be shown below title
  "long_description": string,  // Detailed overview with real-world use cases (markdown supported)
  "logoUrl": string,           // Suggest a thematic image URL or leave empty for default
  "highlights": string[],      // 3-4 key highlights answering "Why this project?" - compelling value propositions
  "badges": [                  // Relevant tech stack badges - select from predefined list below
    {
      "name": string,
      "color": string,
      "logo": string,
      "logoColor": string
    }
  ],
  "tech_stack": {              // Grouped technology categories detected from the project
    "Category Name": ["Tech1", "Tech2"]
    // Examples of categories: "Runtime", "Language", "Framework", "Database", "Testing", "CI/CD", "Containerization", "Build Tool", "Linting"
  },
  "prerequisites": string[],   // Required tools/versions to run the project (e.g. "Node.js >= 18.0.0")
  "features": string[],        // List of compelling features with benefits
  "installation": string,      // Clear step-by-step instructions (bash commands)
  "usage": string,             // Detailed usage with multiple code examples and subsections
  "mermaid_diagrams": {        // Mermaid diagrams for visual documentation (GitHub renders these natively)
    "architecture": string,    // Project architecture diagram as mermaid flowchart code (flowchart TD or LR)
    "data_flow": string        // Data flow or sequence diagram as mermaid code (sequenceDiagram)
  },
  "contributing": string,      // Contributing guidelines in markdown
  "roadmap": string,           // Future development possibilities as markdown table
  "faq": string,               // Anticipated user questions and answers
  "license": string,           // License type (e.g. "MIT", "Apache-2.0")
  "acknowledgments": string    // Credits, thanks, inspirations in markdown
}

${badgeInstructions}

IMPORTANT INSTRUCTIONS FOR SPECIFIC FIELDS:

**highlights**: Provide 3-4 short, compelling bullet points that answer "Why should I use this project?". Focus on unique value propositions, not just features.

**tech_stack**: Group technologies into logical categories. Only include technologies actually used in the project based on the source code and dependencies provided. Use badge-friendly names.

**prerequisites**: List specific version requirements based on the engines field from package.json if available. Include any global tools needed.

**mermaid_diagrams**:
- Generate clean, simple diagrams with no more than 8-12 nodes
- For "architecture": use "flowchart TD" or "flowchart LR" showing module/layer relationships
- For "data_flow": use "sequenceDiagram" showing request lifecycle or data processing pipeline
- Do NOT add any styling or color directives (no "style", "classDef", or ":::")
- Do NOT use spaces in node IDs (use camelCase: "apiGateway" not "API Gateway")
- Wrap edge labels containing special characters in double quotes
- Base diagrams on the actual source code structure provided
- If the project is a library/package: show module dependency flowchart
- If the project is an API/server: show request flow sequence diagram + architecture
- If the project is a CLI tool: show command execution pipeline
- If the project is a full-stack app: show frontend/backend/DB architecture

**contributing**: Include standard sections: how to report bugs, suggest features, submit PRs, and code style requirements.

**usage**: Provide a rich section with multiple subsections, code blocks, and examples. Include configuration options if applicable.

For the roadmap field, create a markdown table with columns: | Task / Feature | Status |
The Status column should use ONLY these formats with emojis:
- "✅ Done" - for completed features
- "🚧 In Progress" - for features currently being worked on
No other statuses are allowed. Include a mix of completed and in-progress items to show project momentum.

ONLY JSON OBJECT IN RESPONSE WITH NO ANY ADDITIONAL TEXT.`;
	}

	/**
	 * Build the user prompt
	 * @param {ILlmPromptContext} context - The context for generating the README
	 * @returns {string} The user prompt
	 */
	buildUserPrompt(context: ILlmPromptContext): string {
		const { changelogContent, directoryTree, gitStats, packageInfo, projectContext, repositoryInfo, scannedFiles }: ILlmPromptContext = context;

		let prompt: string = `Generate a comprehensive README for the following project:

Project information:
- Name: "${repositoryInfo.getName()}"
- Description: "${repositoryInfo.getDescription()}"
- Code stats: "${repositoryInfo.getCodeStats()}"`;

		if (repositoryInfo.getOwner()) {
			prompt += `\n- Owner: "${repositoryInfo.getOwner()}"`;
		}

		if (repositoryInfo.getDefaultBranch()) {
			prompt += `\n- Default branch: "${repositoryInfo.getDefaultBranch()}"`;
		}

		// Add package.json info
		if (packageInfo) {
			prompt += "\n\nPackage Information:";

			if (packageInfo.version) {
				prompt += `\n- Version: ${packageInfo.version}`;
			}

			if (packageInfo.license) {
				prompt += `\n- License: ${packageInfo.license}`;
			}

			if (packageInfo.engines) {
				prompt += `\n- Engines: ${JSON.stringify(packageInfo.engines)}`;
			}

			if (packageInfo.keywords && packageInfo.keywords.length > 0) {
				prompt += `\n- Keywords: ${packageInfo.keywords.join(", ")}`;
			}

			if (packageInfo.scripts) {
				const scriptKeys: Array<string> = Object.keys(packageInfo.scripts);
				prompt += `\n- Available scripts: ${scriptKeys.join(", ")}`;
			}

			if (packageInfo.homepage) {
				prompt += `\n- Homepage: ${packageInfo.homepage}`;
			}

			if (packageInfo.bin) {
				prompt += `\n- CLI binary: ${typeof packageInfo.bin === "string" ? packageInfo.bin : Object.keys(packageInfo.bin).join(", ")}`;
			}

			if (packageInfo.peerDependencies) {
				const peers: Array<string> = Object.entries(packageInfo.peerDependencies).map(([name, version]: [string, string]) => `${name}@${version}`);
				prompt += `\n- Peer dependencies: ${peers.join(", ")}`;
			}
		}

		// Add git statistics
		if (gitStats) {
			prompt += this.formatGitStats(gitStats);
		}

		// Add detected tools
		const detectedTools: IDetectedTools | undefined = repositoryInfo.getDetectedTools();

		if (detectedTools) {
			const toolSections: Array<string> = [];

			if (detectedTools.cicd.length > 0) toolSections.push(`CI/CD: ${detectedTools.cicd.join(", ")}`);

			if (detectedTools.containerization.length > 0) toolSections.push(`Containers: ${detectedTools.containerization.join(", ")}`);

			if (detectedTools.linting.length > 0) toolSections.push(`Linting: ${detectedTools.linting.join(", ")}`);

			if (detectedTools.testing.length > 0) toolSections.push(`Testing: ${detectedTools.testing.join(", ")}`);

			if (detectedTools.bundlers.length > 0) toolSections.push(`Build Tools: ${detectedTools.bundlers.join(", ")}`);

			if (detectedTools.packageManagers.length > 0) toolSections.push(`Package Manager: ${detectedTools.packageManagers.join(", ")}`);

			if (toolSections.length > 0) {
				const formattedTools: string = toolSections.map((s: string) => "- " + s).join("\n");
				prompt += "\n\nDetected Infrastructure:\n" + formattedTools;
			}
		}

		// Add language statistics
		const languageStats: Array<ILanguageStatEntry> | undefined = repositoryInfo.getLanguageStats();

		if (languageStats && languageStats.length > 0) {
			prompt += "\n\nLanguage Breakdown:";

			for (const stat of languageStats) {
				prompt += `\n- ${stat.name}: ${stat.percentage.toFixed(1)}% (${stat.fileCount} files, ${stat.lines} lines)`;
			}
		}

		// Add directory tree
		if (directoryTree) {
			prompt += `\n\nProject Structure:\n\`\`\`\n${directoryTree}\n\`\`\``;
		}

		if (projectContext) {
			prompt += `\n\nAdditional Project Context:\n${projectContext}`;
		}

		if (changelogContent) {
			prompt += `\n\nCHANGELOG file contents:\n${changelogContent}`;
		}

		// Include scanned files if available
		if (scannedFiles && scannedFiles.length > 0) {
			prompt += `\n\nProject Files (${scannedFiles.length} files scanned):`;

			// Group files by extension for better organization
			const filesByExtension: Map<string, Array<(typeof scannedFiles)[0]>> = new Map<string, Array<(typeof scannedFiles)[0]>>();

			for (const file of scannedFiles) {
				const extension: string = file.path.split(".").pop() ?? "no-ext";

				if (!filesByExtension.has(extension)) {
					filesByExtension.set(extension, []);
				}

				const extensionFiles: Array<(typeof scannedFiles)[0]> | undefined = filesByExtension.get(extension);

				if (extensionFiles) {
					extensionFiles.push(file);
				}
			}

			// Add files grouped by type
			for (const [extension, files] of filesByExtension) {
				prompt += `\n\n## ${extension.toUpperCase()} Files:`;

				for (const file of files) {
					// Truncate very long files to avoid token limits
					let content: string = file.content;

					if (content.length > MAX_FILE_CONTENT_LENGTH) {
						content = content.slice(0, MAX_FILE_CONTENT_LENGTH) + "\n... (truncated)";
					}

					prompt += `\n\n### File: ${file.path} (${Math.round(file.size / KILOBYTE)}KB)\n\`\`\`${extension}\n${content}\n\`\`\``;
				}
			}
		}

		prompt += "\n\nCreate an engaging narrative around this project. Infer the project's purpose, potential applications, and target audience from the available information.";
		prompt += "\n\nBased on ALL the provided information including the actual source code files, create a comprehensive and accurate README. Analyze the code structure, dependencies, and implementation details to provide accurate technical information.";
		prompt += "\n\nFor mermaid diagrams, analyze the project structure carefully and generate diagrams that accurately represent the real architecture and data flow of this specific project.";

		return prompt;
	}

	/**
	 * Format badge instructions for the prompt
	 * @returns {string} Formatted badge instructions
	 */
	private formatBadgeInstructions(): string {
		const badgeNames: Array<string> = PREDEFINED_LIB_BADGES.map((badge: Badge) => badge.getName());

		const badgeConfigs: string = PREDEFINED_LIB_BADGES.map((badge: Badge) => `- ${badge.getName()}: {"name": "${badge.getName()}", "color": "${badge.getColor()}", "logo": "${badge.getLogo()}", "logoColor": "${badge.getLogoColor()}"}`).join("\n");

		return `IMPORTANT: For badges, select ONLY the relevant ones from this predefined list based on the project's technology stack:
${badgeNames.join(", ")}

For each badge you select, use these exact configurations:
${badgeConfigs}`;
	}

	/**
	 * Format git statistics into prompt text
	 * @param {IGitStats} gitStats - The git statistics
	 * @returns {string} Formatted git stats text
	 */
	private formatGitStats(gitStats: IGitStats): string {
		let text: string = "\n\nGit History:";
		text += `\n- Total commits: ${gitStats.commitCount}`;
		text += `\n- Contributors: ${gitStats.contributors.length}`;
		text += `\n- Branches: ${gitStats.branchCount}`;

		if (gitStats.tags.length > 0) {
			const recentTags: string = gitStats.tags.slice(-RECENT_TAGS_LIMIT).join(", ");
			const extraCount: number = gitStats.tags.length - RECENT_TAGS_LIMIT;
			const suffix: string = extraCount > 0 ? " (and " + String(extraCount) + " more)" : "";
			text += "\n- Tags/releases: " + recentTags + suffix;
		}

		if (gitStats.firstCommitDate) {
			text += `\n- First commit: ${gitStats.firstCommitDate}`;
		}

		if (gitStats.lastCommitDate) {
			text += `\n- Last commit: ${gitStats.lastCommitDate}`;
		}

		if (gitStats.contributors.length > 0) {
			const topContributors: string = gitStats.contributors
				.slice(0, TOP_ITEMS_LIMIT)
				.map((c: { commits: number; name: string }) => c.name + " (" + String(c.commits) + " commits)")
				.join(", ");
			text += "\n- Top contributors: " + topContributors;
		}

		return text;
	}
}
