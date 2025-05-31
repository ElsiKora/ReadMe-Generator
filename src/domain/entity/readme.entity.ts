import type { Badge } from "../value-object/badge.value-object.js";

/**
 * README entity
 */
export class Readme {
	private readonly BADGES: Array<Badge>;

	private readonly CONTENT: string;

	private readonly FAQ: string;

	private readonly FEATURES: Array<string>;

	private readonly INSTALLATION: string;

	private readonly LICENSE: string;

	private readonly LOGO_URL: string;

	private readonly LONG_DESCRIPTION: string;

	private readonly ROADMAP: string;

	private readonly SHORT_DESCRIPTION: string;

	private readonly TITLE: string;

	private readonly USAGE: string;

	constructor(data: { badges: Array<Badge>; content: string; faq: string; features: Array<string>; installation: string; license: string; logoUrl: string; longDescription: string; roadmap: string; shortDescription: string; title: string; usage: string }) {
		this.TITLE = data.title;
		this.SHORT_DESCRIPTION = data.shortDescription;
		this.LONG_DESCRIPTION = data.longDescription;
		this.LOGO_URL = data.logoUrl;
		this.BADGES = data.badges;
		this.FEATURES = data.features;
		this.INSTALLATION = data.installation;
		this.USAGE = data.usage;
		this.ROADMAP = data.roadmap;
		this.FAQ = data.faq;
		this.LICENSE = data.license;
		this.CONTENT = data.content;
	}

	/**
	 * Get badges
	 * @returns {Array<Badge>} The badges
	 */
	getBadges(): Array<Badge> {
		return this.BADGES;
	}

	/**
	 * Get the full content
	 * @returns {string} The content
	 */
	getContent(): string {
		return this.CONTENT;
	}

	/**
	 * Get FAQ
	 * @returns {string} The FAQ
	 */
	getFaq(): string {
		return this.FAQ;
	}

	/**
	 * Get features
	 * @returns {Array<string>} The features
	 */
	getFeatures(): Array<string> {
		return this.FEATURES;
	}

	/**
	 * Get installation instructions
	 * @returns {string} The installation instructions
	 */
	getInstallation(): string {
		return this.INSTALLATION;
	}

	/**
	 * Get license
	 * @returns {string} The license
	 */
	getLicense(): string {
		return this.LICENSE;
	}

	/**
	 * Get logo URL
	 * @returns {string} The logo URL
	 */
	getLogoUrl(): string {
		return this.LOGO_URL;
	}

	/**
	 * Get long description
	 * @returns {string} The long description
	 */
	getLongDescription(): string {
		return this.LONG_DESCRIPTION;
	}

	/**
	 * Get roadmap
	 * @returns {string} The roadmap
	 */
	getRoadmap(): string {
		return this.ROADMAP;
	}

	/**
	 * Get short description
	 * @returns {string} The short description
	 */
	getShortDescription(): string {
		return this.SHORT_DESCRIPTION;
	}

	/**
	 * Get title
	 * @returns {string} The title
	 */
	getTitle(): string {
		return this.TITLE;
	}

	/**
	 * Get usage instructions
	 * @returns {string} The usage instructions
	 */
	getUsage(): string {
		return this.USAGE;
	}
}
