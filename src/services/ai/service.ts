import type { IGeneratedReadme, IRepoInfo } from "../../types";
import type { TSpinnerInstance } from "../../utils/cli/types";

import type { IGenerateReadmeInput, IGenerateReadmeOutput } from "./types";

import fs from "node:fs";

import { Anthropic } from "@anthropic-ai/sdk";
import chalk from "chalk";
import OpenAI from "openai";

import { DEFAULT_BADGES, DEFAULT_LOGO_URL, ELSIKORA_BADGE, PREDEFINED_LIB_BADGES } from "../../constants";
import { showProgressBar } from "../../utils/cli/progress";
import { startSpinner, stopSpinner } from "../../utils/cli/spinner";

import { EAIProvider } from "./provider.enum";

export class AIService {
	private readonly ANTHROPIC: Anthropic;

	private readonly OPENAI: OpenAI;

	constructor(apiKey: string) {
		this.ANTHROPIC = new Anthropic({ apiKey });

		this.OPENAI = new OpenAI({
			apiKey,
		});
	}

	async generateReadme({ changelogContent, lang = "en", model, projectContext, provider, repoInfo }: { provider?: EAIProvider } & IGenerateReadmeInput): Promise<IGenerateReadmeOutput> {
		const spinner: TSpinnerInstance = startSpinner("Generating README...");

		try {
			let licenseContent: string = "";
			const licensePaths: Array<string> = ["LICENSE", "LICENSE.md", "license", "license.md"];

			for (const licensePath of licensePaths) {
				try {
					licenseContent = await fs.promises.readFile(licensePath, "utf8");

					break;
				} catch {
					continue;
				}
			}

			let promptContent: string = this.buildPrompt(repoInfo, lang, projectContext);

			if (licenseContent) {
				promptContent += `\n\nLICENSE file contents:\n${licenseContent}`;
			}

			if (changelogContent) {
				promptContent += `\n\nCHANGELOG file contents:\n${changelogContent}`;
			}

			let rawContent: string = "";

			if (provider === EAIProvider.ANTHROPIC) {
				const response: Anthropic.Message = await this.ANTHROPIC.messages.create({
					// eslint-disable-next-line @elsikora/typescript/no-magic-numbers
					max_tokens: 8192,
					messages: [
						{
							content: promptContent,
							role: "user",
						},
					],
					model,
				});

				// @ts-ignore
				rawContent = "text" in response.content[0] ? response.content[0]?.text : "";
			} else {
				const response: OpenAI.ChatCompletion = await this.OPENAI.chat.completions.create({
					messages: [{ content: promptContent, role: "user" }],
					model,
					response_format: { type: "json_object" },
				});

				rawContent = response.choices?.[0]?.message?.content ?? "";
			}

			stopSpinner(spinner, "Raw README data received");
			await showProgressBar("Parsing generated JSON...");

			const parsedData: IGeneratedReadme = this.parseResponse(rawContent, repoInfo.name);

			return this.buildFinalReadme(parsedData);
		} catch (error) {
			stopSpinner(spinner, "Failed to generate README", false);

			throw error;
		}
	}

	private applyPredefinedBadgeColors(badges: IGeneratedReadme["badges"]): void {
		for (let b of badges) {
			const normalizedName: string = b.name.toLowerCase();

			if (PREDEFINED_LIB_BADGES[normalizedName]) {
				// eslint-disable-next-line @elsikora/sonar/no-dead-store,@elsikora/sonar/updated-loop-counter
				b = {
					...b,
					...PREDEFINED_LIB_BADGES[normalizedName],
				};
			}
		}
	}

	private buildFinalReadme(parsedData: IGeneratedReadme): IGenerateReadmeOutput {
		parsedData.logoUrl = parsedData.logoUrl || DEFAULT_LOGO_URL;

		if (!Array.isArray(parsedData.badges) || parsedData.badges.length === 0) {
			parsedData.badges = DEFAULT_BADGES;
		} else {
			this.applyPredefinedBadgeColors(parsedData.badges);
		}

		const otherBadges: string = parsedData.badges
			.map((badge: { color: string; logo: string; logoColor: string; name: string }) => {
				const badgeUrl: string = `https://img.shields.io/badge/${encodeURIComponent(badge.name)}-${badge.color}.svg?style=for-the-badge&logo=${badge.logo}&logoColor=${badge.logoColor}`;

				return `<img src="${badgeUrl}" alt="${badge.name}">`;
			})
			.join(" ");

		const cleanInstallation: string = this.cleanCodeBlock(parsedData.installation);
		const cleanUsage: string = parsedData.usage.trim();

		// Use roadmap as provided by LLM
		const beautifiedRoadmap: string = parsedData.roadmap;

		const tableOfContents: string = `
## 📚 Table of Contents
- [Description](#-description)
- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Roadmap](#-roadmap)
- [FAQ](#-faq)
- [License](#-license)
`;

		const prettyFeatures: string = parsedData.features.map((f: string) => `- ✨ **${f}**`).join("\n");

		const readme: string = `<p align="center">
  <img src="${parsedData.logoUrl}" width="500" alt="project-logo">
</p>

<h1 align="center">${parsedData.title}</h1>
<p align="center"><em>${parsedData.short_description}</em></p>

<p align="center">
    ${ELSIKORA_BADGE} ${otherBadges}
</p>

${tableOfContents}

## 📖 Description
${parsedData.long_description}

## 🚀 Features
${prettyFeatures}

## 🛠 Installation
\`\`\`bash
${cleanInstallation}
\`\`\`

## 💡 Usage
${cleanUsage}

## 🛣 Roadmap
${beautifiedRoadmap}

## ❓ FAQ
${parsedData.faq}

## 🔒 License
This project is licensed under **${parsedData.license}**.`;

		return { ...parsedData, readme };
	}

	private buildPrompt(repoInfo: IRepoInfo, lang: string = "en", projectContext: string = ""): string {
		const languageInstructions: {
			de: string;
			en: string;
			es: string;
			fr: string;
			ru: string;
		} = {
			de: "Erstellen Sie die README auf Deutsch.",
			en: "Generate the README in English.",
			es: "Genera el README en español.",
			fr: "Générez le README en français.",
			ru: "Создайте README на русском языке.",
		};

		const usageExtraInstructions: string = `
**Important**: In the "usage" field of the JSON, provide a rich, detailed usage section with:
- Multiple subsections (e.g. "CLI Usage", "Usage with TypeScript", "Usage with Prettier", etc.)
- Multiple code blocks (at least a few, each with the appropriate \`\`\`language\`\`\`)
- Explanations and step-by-step instructions
- If the project provides a CLI, show how to run it with "npx <package> init" or other relevant commands
- Provide some advanced or extended use cases if possible
`;

		// @ts-ignore
		// eslint-disable-next-line @elsikora/typescript/restrict-template-expressions
		return `You are a creative technical writer tasked with generating an engaging README for a software project. Based on the following details, generate a complete README structure in JSON format with imaginative and compelling content. ${languageInstructions[lang] ?? languageInstructions.en}

Roadmap instructions:
For the roadmap field, create a detailed roadmap section formatted as a markdown table with:
- Table header: | Task / Feature | Status |
- Each task should have a status (either "✅ Done" or "🚧 In Progress")
- Tasks marked as "done" or "complete" in the CHANGELOG should be shown with ✅ Done status
- Future tasks or in-progress tasks should be shown with 🚧 In Progress status
- Be creative and comprehensive with the roadmap based on the project context and CHANGELOG provided

Project information:
- name: "${repoInfo.name}"
- description: "${repoInfo.description}"
- codeStats: "${repoInfo.codeStats}"

${projectContext ? `Additional Project Context:\n${projectContext}\n` : ""}

${usageExtraInstructions}

Create an engaging narrative around this project. Infer the project's purpose, potential applications, and target audience from the available information. Generate creative features, clear installation steps, and practical usage examples.

For the logo, if possible, suggest a thematic image URL that represents the project well. If you can suggest a specific relevant image, include its URL in the logoUrl field. Otherwise, use the default placeholder.

The title should be the project name, optionally with an emoji but without any separator characters. The subtitle should be provided in the short_description field and will be displayed below the title.

The JSON must follow this structure:
{
 "title": string,             // Project name, can include emoji but no separators
  "short_description": string, // Subtitle/tagline to be shown below title
  "long_description": string,  // Detailed overview with real-world use cases
  "logoUrl": string,           // Suggest a thematic image URL or leave empty for default. Only provide existing image or just send empty string.
  "badges": [                  // Relevant tech stack badges, return as many as you can provide from package.json and that ones that will be good with shields.io
    {
      "name": string,
      "color": string,
      "logo": string,
      "logoColor": string
    }
  ],
  "features": string[],        // List of compelling features with benefits
  "installation": string,      // Clear step-by-step instructions
  "usage": string,             // Detailed usage with multiple code examples, sub-sections, CLI usage, etc.
  "screenshots": [],           // Array of screenshot URLs if available
  "roadmap": string,           // Future development possibilities
  "faq": string,               // Anticipated user questions and answers
  "license": string            // License information from LICENSE file
}

ONLY JSON OBJECT IN RESPONSE WITH NO ANY ADDITIONAL TEXT. NO MARKDOWN, NO ANY OTHER COMMENTS.`.trim();
	}

	private cleanCodeBlock(text: string): string {
		if (!text) return "";

		return text
			.replaceAll(/^```bash\n/g, "")
			.replaceAll(/\n```$/g, "")
			.replaceAll("```bash", "")
			.replaceAll("```", "")
			.trim();
	}

	private parseResponse(rawContent: string, fallbackName: string): IGeneratedReadme {
		console.log("RESPONSE", rawContent);

		try {
			// eslint-disable-next-line @elsikora/typescript/no-unsafe-return
			return JSON.parse(rawContent);
		} catch {
			console.log(chalk.yellow("Warning: JSON parse failed. Using fallback structure."));

			return {
				badges: [],
				changelog: "",
				faq: "",
				features: [],
				folder_structure: "",
				installation: "",
				license: "MIT",
				logoUrl: "",
				long_description: "No data from model. Provide an overview here.",
				roadmap: "",
				screenshots: [],
				short_description: "",
				title: fallbackName.toUpperCase(),
				usage: "",
			};
		}
	}
}
