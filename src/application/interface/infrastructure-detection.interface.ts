import type { IDetectedTools } from "../../domain/entity/repository-info.entity";

/**
 * Interface for detecting project infrastructure and tooling
 */
export interface IInfrastructureDetectionService {
	/**
	 * Detect project infrastructure tools by checking for known config files
	 * @param {string} projectPath - The project directory path
	 * @returns {Promise<IDetectedTools>} Promise resolving to detected tools
	 */
	detect(projectPath: string): Promise<IDetectedTools>;
}
