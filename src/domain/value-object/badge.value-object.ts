/**
 * Value object representing a README badge
 */
export class Badge {
	private readonly COLOR: string;

	private readonly LOGO: string;

	private readonly LOGO_COLOR: string;

	private readonly NAME: string;

	constructor(name: string, color: string, logo: string, logoColor: string) {
		this.NAME = name;
		this.COLOR = color;
		this.LOGO = logo;
		this.LOGO_COLOR = logoColor;
	}

	/**
	 * Get the badge color
	 * @returns {string} The color
	 */
	getColor(): string {
		return this.COLOR;
	}

	/**
	 * Get the badge logo
	 * @returns {string} The logo
	 */
	getLogo(): string {
		return this.LOGO;
	}

	/**
	 * Get the badge logo color
	 * @returns {string} The logo color
	 */
	getLogoColor(): string {
		return this.LOGO_COLOR;
	}

	/**
	 * Get the badge name
	 * @returns {string} The name
	 */
	getName(): string {
		return this.NAME;
	}

	/**
	 * Generate shield.io badge URL
	 * @returns {string} The badge URL
	 */
	toUrl(): string {
		return `https://img.shields.io/badge/${encodeURIComponent(this.NAME)}-${encodeURIComponent(this.COLOR)}.svg?style=for-the-badge&logo=${encodeURIComponent(this.LOGO)}&logoColor=${encodeURIComponent(this.LOGO_COLOR)}`;
	}
}
