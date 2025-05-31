/**
 * Value object representing an API key
 */
export class ApiKey {
	private readonly VALUE: string;

	constructor(value: string) {
		if (!value || value.trim().length === 0) {
			throw new Error("API key cannot be empty");
		}

		this.VALUE = value.trim();
	}

	/**
	 * Check if two API keys are equal
	 * @param {ApiKey} other - The other API key to compare
	 * @returns {boolean} True if the API keys are equal
	 */
	equals(other: ApiKey): boolean {
		return this.VALUE === other.VALUE;
	}

	/**
	 * Get the API key value
	 * @returns {string} The API key
	 */
	getValue(): string {
		return this.VALUE;
	}
}
