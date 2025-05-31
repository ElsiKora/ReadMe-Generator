import type { Badge } from "../../domain/index.js";

import { Badge as BadgeClass } from "../../domain/index.js";

/**
 * Default badges to include
 */
const DEFAULT_BADGES: Array<{ color: string; logo: string; logoColor: string; name: string }> = [
	{ color: "339933", logo: "node.js", logoColor: "white", name: "Node.js" },
	{ color: "3178C6", logo: "typescript", logoColor: "white", name: "TypeScript" },
	{ color: "CB3837", logo: "npm", logoColor: "white", name: "npm" },
];

/**
 * ElSikora badge
 */
const ELSIKORA_BADGE: string = `<a href="https://github.com/ElSikora" target="_blank">
  <img src="https://img.shields.io/badge/Developer-ElSikora-blue?style=for-the-badge&logo=github" alt="Developer">
</a>`;

/**
 * Default logo URL
 */
const DEFAULT_LOGO_URL: string = "https://socialify.git.ci/ElSikora/readme-generator/image?description=1&font=Source%20Code%20Pro&forks=1&issues=1&language=1&name=1&owner=1&pattern=Plus&pulls=1&stargazers=1&theme=Dark";

/**
 * Service for building README content
 */
export class ReadmeBuilder {
	/**
	 * Build the README content
	 * @param {object} data - The data for building the README
	 * @param {Array<Badge>} data.badges - The badges to display
	 * @param {string} data.faq - FAQ section content
	 * @param {Array<string>} data.features - List of features
	 * @param {string} data.installation - Installation instructions
	 * @param {string} data.license - License type
	 * @param {string} data.logoUrl - URL for the project logo
	 * @param {string} data.longDescription - Detailed project description
	 * @param {string} data.roadmap - Project roadmap
	 * @param {string} data.shortDescription - Brief project description
	 * @param {string} data.title - Project title
	 * @param {string} data.usage - Usage instructions
	 * @returns {string} The formatted README content
	 */
	build(data: { badges: Array<Badge>; faq: string; features: Array<string>; installation: string; license: string; logoUrl: string; longDescription: string; roadmap: string; shortDescription: string; title: string; usage: string }): string {
		const logoUrl: string = data.logoUrl || DEFAULT_LOGO_URL;
		const badges: Array<Badge> = data.badges.length > 0 ? data.badges : this.createDefaultBadges();

		const badgeHtml: string = badges.map((badge: Badge) => `<img src="${badge.toUrl()}" alt="${badge.getName()}">`).join(" ");

		const tableOfContents: string = this.buildTableOfContents();
		const prettyFeatures: string = data.features.map((f: string) => `- ✨ **${f}**`).join("\n");
		const cleanInstallation: string = this.cleanCodeBlock(data.installation);

		return `<p align="center">
  <img src="${logoUrl}" width="500" alt="project-logo">
</p>

<h1 align="center">${data.title}</h1>
<p align="center"><em>${data.shortDescription}</em></p>

<p align="center">
    ${ELSIKORA_BADGE} ${badgeHtml}
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
}
