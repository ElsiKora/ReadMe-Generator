import type { IReadmeBuilder } from "../../application/interface/readme-builder.interface";
import type { Badge, RepositoryInfo } from "../../domain/index";

import { Badge as BadgeClass, ELogoType } from "../../domain/index";

/**
 * Default badges to include
 */
const DEFAULT_BADGES: Array<{ color: string; logo: string; logoColor: string; name: string }> = [
	{ color: "339933", logo: "node.js", logoColor: "white", name: "Node.js" },
	{ color: "3178C6", logo: "typescript", logoColor: "white", name: "TypeScript" },
	{ color: "CB3837", logo: "npm", logoColor: "white", name: "npm" },
];

/**
 * ElsiKora badge HTML
 */
const ELSIKORA_BADGE: string = `<a aria-label="ElsiKora logo" href="https://elsikora.com">
  <img src="https://img.shields.io/badge/MADE%20BY%20ElsiKora-333333.svg?style=for-the-badge" alt="ElsiKora">
</a>`;

/**
 * Socialify configuration interface
 */
interface ISocialifyConfig {
	shouldShowDescription?: boolean;
	shouldShowForks?: boolean;
	shouldShowIssues?: boolean;
	shouldShowLanguage?: boolean;
	shouldShowName?: boolean;
	shouldShowOwner?: boolean;
	shouldShowPulls?: boolean;
	shouldShowStargazers?: boolean;
	toUseFont?: "Bitter" | "Inter" | "Kalam" | "Kosugi" | "Raleway" | "Rokkitt" | "Source Code Pro";
	toUseLogo?: string;
	toUsePattern?: "Brick Wall" | "Charlie Brown" | "Circuit Board" | "Diagonal Stripes" | "Floating Cogs" | "Formal Invitation" | "Overlapping Hexagons" | "Plus" | "Signal" | "Solid";
	toUseTheme?: "Auto" | "Dark" | "Light";
}

/**
 * Service for building README content
 */
export class ReadmeBuilder implements IReadmeBuilder {
	/**
	 * Build the README content
	 * @param {object} data - The data for building the README
	 * @param {Array<Badge>} data.badges - The badges to display
	 * @param {string} data.faq - FAQ section content
	 * @param {Array<string>} data.features - List of features
	 * @param {string} data.installation - Installation instructions
	 * @param {string} data.license - License type
	 * @param {ELogoType} data.logoType - Type of logo to use (socialify, local, or custom)
	 * @param {string} data.logoUrl - URL for the project logo (for custom or locally generated)
	 * @param {string} data.longDescription - Detailed project description
	 * @param {RepositoryInfo} data.repositoryInfo - Repository information
	 * @param {string} data.roadmap - Project roadmap
	 * @param {string} data.shortDescription - Brief project description
	 * @param {ISocialifyConfig} data.socialifyConfig - Optional Socialify configuration
	 * @param {string} data.title - Project title
	 * @param {string} data.usage - Usage instructions
	 * @returns {string} The formatted README content
	 */
	build(data: { badges: Array<Badge>; faq: string; features: Array<string>; installation: string; license: string; logoType?: ELogoType; logoUrl?: string; longDescription: string; repositoryInfo: RepositoryInfo; roadmap: string; shortDescription: string; socialifyConfig?: ISocialifyConfig; title: string; usage: string }): string {
		// Determine logo URL based on type
		let logoUrl: string;
		const logoType: ELogoType = data.logoType ?? (data.logoUrl ? ELogoType.CUSTOM : ELogoType.SOCIALIFY);

		switch (logoType) {
			case ELogoType.CUSTOM: {
				logoUrl = data.logoUrl ?? "";

				break;
			}

			case ELogoType.LOCAL: {
				// For locally generated logos, the URL should be provided after upload
				logoUrl = data.logoUrl ?? "";

				break;
			}

			case ELogoType.SOCIALIFY: {
				// Generate Socialify URL
				logoUrl = this.generateSocialifyUrl(data.repositoryInfo.getOwner(), data.repositoryInfo.getName(), data.socialifyConfig);

				break;
			}

			default: {
				// This should never happen because we've covered all cases
				logoUrl = this.generateSocialifyUrl(data.repositoryInfo.getOwner(), data.repositoryInfo.getName(), data.socialifyConfig);

				break;
			}
		}

		// If still no logo URL, use Socialify as fallback
		if (!logoUrl || logoUrl.trim() === "") {
			logoUrl = this.generateSocialifyUrl(data.repositoryInfo.getOwner(), data.repositoryInfo.getName(), data.socialifyConfig);
		}

		const badges: Array<Badge> = data.badges.length > 0 ? data.badges : this.createDefaultBadges();

		const badgeHtml: string = badges.map((badge: Badge) => `<img src="${badge.toUrl()}" alt="${badge.getName()}">`).join(" ");

		// Check if repository owner is ElsiKora (case insensitive)
		const repositoryOwner: string | undefined = data.repositoryInfo.getOwner();
		const isElsiKoraRepo: boolean = repositoryOwner?.toLowerCase() === "elsikora";
		const elsiKoraBadgeHtml: string = isElsiKoraRepo ? `${ELSIKORA_BADGE} ` : "";

		const tableOfContents: string = this.buildTableOfContents();
		const prettyFeatures: string = data.features.map((f: string) => `- ✨ **${f}**`).join("\n");
		const cleanInstallation: string = this.cleanCodeBlock(data.installation);

		return `<p align="center">
  <img src="${logoUrl}" width="700" alt="project-logo">
</p>

<h1 align="center">${data.title}</h1>
<p align="center"><em>${data.shortDescription}</em></p>

<p align="center">
    ${elsiKoraBadgeHtml}${badgeHtml}
</p>

${tableOfContents}

## 📖 Description
${data.longDescription}

## 🚀 Features
${prettyFeatures}

## 🛠 Installation
\`\`\`bash
${cleanInstallation}
\`\`\`

## 💡 Usage
${data.usage}

## 🛣 Roadmap
${data.roadmap}

## ❓ FAQ
${data.faq}

## 🔒 License
This project is licensed under **${data.license}**.`;
	}

	private buildTableOfContents(): string {
		return `
## 📚 Table of Contents
- [Description](#-description)
- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Roadmap](#-roadmap)
- [FAQ](#-faq)
- [License](#-license)
`;
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

	private createDefaultBadges(): Array<Badge> {
		return DEFAULT_BADGES.map((b: { color: string; logo: string; logoColor: string; name: string }) => new BadgeClass(b.name, b.color, b.logo, b.logoColor));
	}

	/**
	 * Generate a GitHub Socialify URL for the repository
	 * @param {string | undefined} owner - Repository owner
	 * @param {string} name - Repository name
	 * @param {ISocialifyConfig} config - Socialify configuration
	 * @returns {string} The Socialify URL
	 */
	private generateSocialifyUrl(owner: string | undefined, name: string, config?: ISocialifyConfig): string {
		// Default configuration
		const defaultConfig: ISocialifyConfig = {
			shouldShowDescription: true,
			shouldShowForks: true,
			shouldShowIssues: true,
			shouldShowLanguage: true,
			shouldShowName: true,
			shouldShowOwner: true,
			shouldShowStargazers: true,
			toUseFont: "Inter",
			toUsePattern: "Circuit Board",
			toUseTheme: "Light",
		};

		const finalConfig: ISocialifyConfig = { ...defaultConfig, ...config };

		// If no owner, use a placeholder
		const repoOwner: string = owner ?? "your-username";

		// Build query parameters
		const parameters: URLSearchParams = new URLSearchParams();

		if (finalConfig.shouldShowDescription) {
			parameters.append("description", "1");
		}

		if (finalConfig.toUseFont) {
			parameters.append("font", finalConfig.toUseFont);
		}

		if (finalConfig.shouldShowForks) {
			parameters.append("forks", "1");
		}

		if (finalConfig.shouldShowIssues) {
			parameters.append("issues", "1");
		}

		if (finalConfig.shouldShowLanguage) {
			parameters.append("language", "1");
		}

		if (finalConfig.toUseLogo) {
			parameters.append("logo", encodeURIComponent(finalConfig.toUseLogo));
		}

		if (finalConfig.shouldShowName) {
			parameters.append("name", "1");
		}

		if (finalConfig.shouldShowOwner) {
			parameters.append("owner", "1");
		}

		if (finalConfig.toUsePattern) {
			parameters.append("pattern", finalConfig.toUsePattern);
		}

		if (finalConfig.shouldShowPulls) {
			parameters.append("pulls", "1");
		}

		if (finalConfig.shouldShowStargazers) {
			parameters.append("stargazers", "1");
		}

		if (finalConfig.toUseTheme) {
			parameters.append("theme", finalConfig.toUseTheme);
		}

		return `https://socialify.git.ci/${repoOwner}/${name}/image?${parameters.toString()}`;
	}
}
