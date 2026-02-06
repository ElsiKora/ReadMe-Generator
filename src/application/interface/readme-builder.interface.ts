import type { Badge, ELogoType, RepositoryInfo } from "../../domain/index";

/**
 * Interface for building README content
 */
export interface IReadmeBuilder {
	/**
	 * Build the README content
	 * @param {object} data - The data for building the README
	 * @param {Array<Badge>} data.badges - List of badges to display
	 * @param {string} data.faq - FAQ section content
	 * @param {Array<string>} data.features - List of features
	 * @param {string} data.installation - Installation instructions
	 * @param {string} data.license - License information
	 * @param {ELogoType} [data.logoType] - Type of logo to use
	 * @param {string} [data.logoUrl] - URL of custom logo
	 * @param {string} data.longDescription - Detailed description
	 * @param {RepositoryInfo} data.repositoryInfo - Repository information
	 * @param {string} data.roadmap - Project roadmap
	 * @param {string} data.shortDescription - Brief description
	 * @param {string} data.title - Project title
	 * @param {string} data.usage - Usage instructions
	 * @returns {string} The formatted README content
	 */
	build(data: { badges: Array<Badge>; faq: string; features: Array<string>; installation: string; license: string; logoType?: ELogoType; logoUrl?: string; longDescription: string; repositoryInfo: RepositoryInfo; roadmap: string; shortDescription: string; title: string; usage: string }): string;
}
