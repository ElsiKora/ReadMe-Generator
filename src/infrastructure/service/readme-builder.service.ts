import type { IGitStats, IPackageInfo } from "../../application/interface/git-repository.interface";
import type { IMermaidDiagrams, IReadmeBuildData, IReadmeBuilder } from "../../application/interface/readme-builder.interface";
import type { Badge, RepositoryInfo } from "../../domain/index";

import { Badge as BadgeClass, ELogoType } from "../../domain/index";
import { DEFAULT_BADGES, ELSIKORA_BADGE, MAX_TOP_CONTRIBUTORS } from "../constant/readme-generation.constant";

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
	 * @param {IReadmeBuildData} data - The data for building the README
	 * @returns {string} The formatted README content
	 */
	build(data: IReadmeBuildData): string {
		// Determine logo URL based on type
		let logoUrl: string;
		const logoType: ELogoType = data.logoType ?? (data.logoUrl ? ELogoType.CUSTOM : ELogoType.SOCIALIFY);

		switch (logoType) {
			case ELogoType.CUSTOM: {
				logoUrl = data.logoUrl ?? "";

				break;
			}

			case ELogoType.LOCAL: {
				logoUrl = data.logoUrl ?? "";

				break;
			}

			case ELogoType.SOCIALIFY: {
				logoUrl = this.generateSocialifyUrl(data.repositoryInfo.getOwner(), data.repositoryInfo.getName());

				break;
			}

			default: {
				logoUrl = this.generateSocialifyUrl(data.repositoryInfo.getOwner(), data.repositoryInfo.getName());

				break;
			}
		}

		// If still no logo URL, use Socialify as fallback
		if (!logoUrl || logoUrl.trim() === "") {
			logoUrl = this.generateSocialifyUrl(data.repositoryInfo.getOwner(), data.repositoryInfo.getName());
		}

		const badges: Array<Badge> = data.badges.length > 0 ? data.badges : this.createDefaultBadges();
		const prettyFeatures: string = data.features.map((f: string) => `- ✨ **${f}**`).join("\n");
		const cleanInstallation: string = this.cleanCodeBlock(data.installation);
		const directoryTree: string | undefined = data.repositoryInfo.getDirectoryTree();
		const owner: string | undefined = data.repositoryInfo.getOwner();
		const gitStats: IGitStats | undefined = data.repositoryInfo.getGitStats();

		const sections: Array<string> = [
			this.buildHeader(logoUrl, data.title, data.shortDescription),
			this.buildBadgesSection(badges, data.repositoryInfo, data.shouldIncludeGithubBadges),
			...(data.highlights && data.highlights.length > 0 ? [this.buildHighlights(data.title, data.highlights)] : []),
			this.buildTableOfContents(data),
			`## 📖 Description\n${data.longDescription}`,
			...(data.techStack && Object.keys(data.techStack).length > 0 ? [this.buildTechStack(data.techStack)] : []),
			`## 🚀 Features\n${prettyFeatures}`,
			...(data.mermaidDiagrams ? this.getArchitectureSections(data.mermaidDiagrams) : []),
			...(directoryTree ? [this.buildProjectStructure(directoryTree)] : []),
			...(data.prerequisites && data.prerequisites.length > 0 ? [this.buildPrerequisites(data.prerequisites)] : []),
			`## 🛠 Installation\n\`\`\`bash\n${cleanInstallation}\n\`\`\``,
			`## 💡 Usage\n${data.usage}`,
			...(data.contributing ? [`## 🤝 Contributing\n${data.contributing}`] : []),
			this.buildCollapsibleSection("🛣 Roadmap", data.roadmap),
			this.buildCollapsibleSection("❓ FAQ", data.faq),
			`## 🔒 License\nThis project is licensed under **${data.license}**.`,
			...(data.acknowledgments ? [`## 🙏 Acknowledgments\n${data.acknowledgments}`] : []),
			...(data.shouldIncludeContributors && owner && gitStats && gitStats.contributors.length > 0 ? [this.buildContributorsSection(owner, data.repositoryInfo.getName(), gitStats.contributors)] : []),
			this.buildFooter(),
		];

		return sections.join("\n\n");
	}

	/**
	 * Build the badges section
	 * @param {Array<Badge>} badges - The tech stack badges
	 * @param {RepositoryInfo} repositoryInfo - Repository information
	 * @param {boolean} shouldIncludeGithubBadges - Whether to include dynamic GitHub badges
	 * @returns {string} The badges HTML
	 */
	private buildBadgesSection(badges: Array<Badge>, repositoryInfo: RepositoryInfo, shouldIncludeGithubBadges: boolean = false): string {
		const parts: Array<string> = [];

		// ElsiKora badge
		const repositoryOwner: string | undefined = repositoryInfo.getOwner();
		const isElsiKoraRepo: boolean = repositoryOwner?.toLowerCase() === "elsikora";

		if (isElsiKoraRepo) {
			parts.push(ELSIKORA_BADGE);
		}

		// Dynamic GitHub badges (only if user opted in)
		if (shouldIncludeGithubBadges && repositoryOwner) {
			const repoName: string = repositoryInfo.getName();

			const githubBadges: Array<string> = [
				`<img src="https://img.shields.io/github/stars/${repositoryOwner}/${repoName}?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Stars">`,
				`<img src="https://img.shields.io/github/forks/${repositoryOwner}/${repoName}?style=for-the-badge&logo=git&logoColor=white" alt="Forks">`,
				`<img src="https://img.shields.io/github/issues/${repositoryOwner}/${repoName}?style=for-the-badge&logo=github&logoColor=white" alt="Issues">`,
				`<img src="https://img.shields.io/github/last-commit/${repositoryOwner}/${repoName}?style=for-the-badge&logo=github&logoColor=white" alt="Last Commit">`,
				`<img src="https://img.shields.io/github/license/${repositoryOwner}/${repoName}?style=for-the-badge&logo=opensource&logoColor=white" alt="License">`,
			];

			const packageInfo: IPackageInfo | undefined = repositoryInfo.getPackageInfo();

			if (packageInfo?.version) {
				githubBadges.push(`<img src="https://img.shields.io/badge/version-${packageInfo.version}-blue?style=for-the-badge&logo=semver&logoColor=white" alt="Version">`);
			}

			parts.push(`<p align="center">\n    ${githubBadges.join("\n    ")}\n</p>`);
		}

		// Tech stack badges
		const badgeHtml: string = badges.map((badge: Badge) => `<img src="${badge.toUrl()}" alt="${badge.getName()}">`).join(" ");
		parts.push(`<p align="center">\n    ${badgeHtml}\n</p>`);

		return parts.join("\n\n");
	}

	/**
	 * Build a collapsible section
	 * @param {string} title - Section title
	 * @param {string} content - Section content
	 * @returns {string} The collapsible section
	 */
	private buildCollapsibleSection(title: string, content: string): string {
		return `## ${title}\n\n<details>\n<summary>Click to expand</summary>\n\n${content}\n\n</details>`;
	}

	/**
	 * Build the contributors section
	 * @param {string} owner - Repository owner
	 * @param {string} name - Repository name
	 * @param {Array<{name: string; commits: number}>} contributors - Contributors list
	 * @returns {string} The contributors section
	 */
	private buildContributorsSection(owner: string, name: string, contributors: Array<{ commits: number; name: string }>): string {
		let section: string = "## 👥 Contributors\n\n";
		section += `<a href="https://github.com/${owner}/${name}/graphs/contributors">\n  <img src="https://contrib.rocks/image?repo=${owner}/${name}" />\n</a>\n`;

		// Also list top contributors
		if (contributors.length > 0) {
			section += "\n| Name | Commits |\n|------|---------|";

			const topContributors: Array<{ commits: number; name: string }> = contributors.slice(0, MAX_TOP_CONTRIBUTORS);

			for (const contributor of topContributors) {
				section += `\n| ${contributor.name} | ${contributor.commits} |`;
			}
		}

		return section;
	}

	/**
	 * Build the footer with back-to-top link
	 * @returns {string} The footer
	 */
	private buildFooter(): string {
		return `---\n\n<p align="center">\n  <a href="#top">Back to Top</a>\n</p>`;
	}

	/**
	 * Build the header section
	 * @param {string} logoUrl - The logo URL
	 * @param {string} title - The project title
	 * @param {string} shortDescription - The short description
	 * @returns {string} The header HTML
	 */
	private buildHeader(logoUrl: string, title: string, shortDescription: string): string {
		return `<a id="top"></a>

<p align="center">
  <img src="${logoUrl}" width="700" alt="project-logo">
</p>

<h1 align="center">${title}</h1>
<p align="center"><em>${shortDescription}</em></p>`;
	}

	/**
	 * Build the highlights callout block
	 * @param {string} title - Project title
	 * @param {Array<string>} highlights - Highlight points
	 * @returns {string} The highlights callout
	 */
	private buildHighlights(title: string, highlights: Array<string>): string {
		const bulletPoints: string = highlights.map((h: string) => `> - ${h}`).join("\n");

		return `> [!NOTE]\n> **Why ${title}?**\n>\n${bulletPoints}`;
	}

	/**
	 * Build the prerequisites section
	 * @param {Array<string>} prerequisites - List of prerequisites
	 * @returns {string} The prerequisites section
	 */
	private buildPrerequisites(prerequisites: Array<string>): string {
		const items: string = prerequisites.map((p: string) => `- ${p}`).join("\n");

		return `## 📋 Prerequisites\n\n${items}`;
	}

	/**
	 * Build the project structure section (collapsible)
	 * @param {string} tree - The directory tree string
	 * @returns {string} The project structure section
	 */
	private buildProjectStructure(tree: string): string {
		return `## 📁 Project Structure\n\n<details>\n<summary>Click to expand</summary>\n\n\`\`\`\n${tree}\n\`\`\`\n\n</details>`;
	}

	/**
	 * Build the table of contents
	 * @param {IReadmeBuildData} data - The build data to determine which sections exist
	 * @returns {string} The table of contents
	 */
	private buildTableOfContents(data: IReadmeBuildData): string {
		const entries: Array<string> = [];

		entries.push("- [Description](#-description)");

		if (data.techStack && Object.keys(data.techStack).length > 0) {
			entries.push("- [Tech Stack](#-tech-stack)");
		}

		entries.push("- [Features](#-features)");

		if (data.mermaidDiagrams && (data.mermaidDiagrams.architecture || data.mermaidDiagrams.dataFlow)) {
			entries.push("- [Architecture](#-architecture)");
		}

		if (data.repositoryInfo.getDirectoryTree()) {
			entries.push("- [Project Structure](#-project-structure)");
		}

		if (data.prerequisites && data.prerequisites.length > 0) {
			entries.push("- [Prerequisites](#-prerequisites)");
		}

		entries.push("- [Installation](#-installation)", "- [Usage](#-usage)");

		if (data.contributing) {
			entries.push("- [Contributing](#-contributing)");
		}

		entries.push("- [Roadmap](#-roadmap)", "- [FAQ](#-faq)", "- [License](#-license)");

		if (data.acknowledgments) {
			entries.push("- [Acknowledgments](#-acknowledgments)");
		}

		return `## 📚 Table of Contents\n${entries.join("\n")}`;
	}

	/**
	 * Build the tech stack section as a grouped table
	 * @param {Record<string, Array<string>>} techStack - The tech stack grouped by category
	 * @returns {string} The tech stack section
	 */
	private buildTechStack(techStack: Record<string, Array<string>>): string {
		let table: string = "| Category | Technologies |\n|----------|-------------|";

		for (const [category, technologies] of Object.entries(techStack)) {
			const techList: string = technologies.join(", ");
			table += `\n| **${category}** | ${techList} |`;
		}

		return `## 🛠️ Tech Stack\n\n${table}`;
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

	/**
	 * Get architecture sections as an array (empty if no diagrams)
	 * @param {IMermaidDiagrams} diagrams - The mermaid diagrams
	 * @returns {Array<string>} Architecture sections
	 */
	private getArchitectureSections(diagrams: IMermaidDiagrams): Array<string> {
		const architecturePart: Array<string> = diagrams.architecture ? [`### System Architecture\n\n\`\`\`mermaid\n${diagrams.architecture}\n\`\`\``] : [];
		const dataFlowPart: Array<string> = diagrams.dataFlow ? [`### Data Flow\n\n\`\`\`mermaid\n${diagrams.dataFlow}\n\`\`\``] : [];
		const parts: Array<string> = [...architecturePart, ...dataFlowPart];

		if (parts.length === 0) return [];

		return [`## 🏗 Architecture\n\n${parts.join("\n\n")}`];
	}
}
