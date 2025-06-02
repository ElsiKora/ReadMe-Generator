import type { ILlmPromptContext } from "../../application/interface/llm-service.interface.js";
import type { IPromptBuilder } from "../../application/interface/prompt-builder.interface.js";
import type { Badge } from "../../domain/index.js";

import { KILOBYTE, MAX_FILE_CONTENT_LENGTH } from "../../domain/constant/file-scanning.constant.js";
import { PREDEFINED_LIB_BADGES } from "../../domain/index.js";

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

		return `You are a creative technical writer tasked with generating an engaging README for a software project. Based on the provided details, generate a complete README structure in JSON format with imaginative and compelling content. ${languageInstructions[lang] ?? languageInstructions.en}

The JSON must follow this structure:
{
  "title": string,             // Project name, can include emoji but no separators
  "short_description": string, // Subtitle/tagline to be shown below title
  "long_description": string,  // Detailed overview with real-world use cases
  "logoUrl": string,           // Suggest a thematic image URL or leave empty for default
  "badges": [                  // Relevant tech stack badges - select from predefined list below
    {
      "name": string,
      "color": string,
      "logo": string,
      "logoColor": string
    }
  ],
  "features": string[],        // List of compelling features with benefits
  "installation": string,      // Clear step-by-step instructions
  "usage": string,             // Detailed usage with multiple code examples
  "roadmap": string,           // Future development possibilities as markdown table
  "faq": string,               // Anticipated user questions and answers
  "license": string            // License information
}

${badgeInstructions}

In the "usage" field, provide a rich, detailed usage section with multiple subsections, code blocks, and examples.
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
		const { changelogContent, projectContext, repositoryInfo, scannedFiles }: ILlmPromptContext = context;

		let prompt: string = `Generate a comprehensive README for the following project:

Project information:
- Name: "${repositoryInfo.getName()}"
- Description: "${repositoryInfo.getDescription()}"
- Code stats: "${repositoryInfo.getCodeStats()}"`;

		if (repositoryInfo.getOwner()) {
			prompt += `\n- Owner: "${repositoryInfo.getOwner()}"`;
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
}
