/**
 * Interface for logo generation service
 */
export interface ILogoGenerator {
	/**
	 * Generate a logo for the project
	 * @param {string} projectName - The project name
	 * @returns {Promise<Buffer>} Promise resolving to the logo image buffer
	 */
	generateLogo(projectName: string): Promise<Buffer>;
}
