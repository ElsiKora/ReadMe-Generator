import type { IInfrastructureDetectionService } from "../../application/interface/infrastructure-detection.interface";
import type { IDetectedTools } from "../../domain/entity/repository-info.entity";
import type { IDetectionRule } from "../constant/infrastructure-detection.constant";

import fs from "node:fs/promises";
import path from "node:path";

import { BUNDLER_RULES, CICD_RULES, CONTAINER_RULES, LINTING_RULES, PACKAGE_MANAGER_RULES, TESTING_RULES } from "../constant/infrastructure-detection.constant";

/**
 * Service for detecting project infrastructure and tooling
 */
export class InfrastructureDetectionService implements IInfrastructureDetectionService {
	/**
	 * Detect project infrastructure tools
	 * @param {string} projectPath - The project directory path
	 * @returns {Promise<IDetectedTools>} Promise resolving to detected tools
	 */
	async detect(projectPath: string): Promise<IDetectedTools> {
		const [cicd, containerization, linting, testing, bundlers, packageManagers]: [Array<string>, Array<string>, Array<string>, Array<string>, Array<string>, Array<string>] = await Promise.all([
			this.detectByRules(projectPath, CICD_RULES),
			this.detectByRules(projectPath, CONTAINER_RULES),
			this.detectByRules(projectPath, LINTING_RULES),
			this.detectByRules(projectPath, TESTING_RULES),
			this.detectByRules(projectPath, BUNDLER_RULES),
			this.detectByRules(projectPath, PACKAGE_MANAGER_RULES),
		]);

		return {
			bundlers,
			cicd,
			containerization,
			linting,
			packageManagers,
			testing,
		};
	}

	/**
	 * Detect tools matching rules by checking file existence
	 * @param {string} projectPath - The project directory path
	 * @param {Array<IDetectionRule>} rules - Detection rules to check
	 * @returns {Promise<Array<string>>} Promise resolving to detected tool names
	 */
	private async detectByRules(projectPath: string, rules: Array<IDetectionRule>): Promise<Array<string>> {
		const detected: Array<string> = [];

		for (const rule of rules) {
			let isFound: boolean = false;

			for (const rulePath of rule.paths) {
				if (isFound) break;

				try {
					const fullPath: string = path.join(projectPath, rulePath);
					await fs.access(fullPath);
					isFound = true;
				} catch {
					// File does not exist, continue
				}
			}

			if (isFound) {
				detected.push(rule.name);
			}
		}

		return detected;
	}
}
