import type { IRepoInfo } from "../../types";

import fs from "node:fs";
import path from "node:path";

import chalk from "chalk";
import { glob } from "glob";

export class LocalService {
	getRepoInfo(localRepoPath: string): IRepoInfo {
		const absPath: string = path.resolve(localRepoPath);
		const repoName: string = path.basename(absPath);
		const packageJsonPath: string = path.join(absPath, "package.json");

		const projectInfo: {
			author: string;
			depsCount: number;
			description: string;
			devDepsCount: number;
			version: string;
		} = this.parsePackageJson(packageJsonPath);
		const fileStats: string = this.analyzeFiles(absPath);

		return {
			author: projectInfo.author,
			codeStats: `deps: ${String(projectInfo.depsCount)}, devDeps: ${String(projectInfo.devDepsCount)};\n${fileStats}`,
			description: projectInfo.description,
			name: projectInfo.version ? `${repoName} ${projectInfo.version}` : repoName,
		};
	}

	private analyzeFiles(absPath: string): string {
		const files: Array<string> = glob.sync(`${absPath}/**/*.{js,ts,jsx,tsx}`, {
			ignore: ["**/node_modules/**", "**/.git/**"],
		});

		const fileCounts: Record<string, number> = {};

		for (const file of files) {
			const extension: string = path.extname(file).replace(".", "");
			fileCounts[extension] = (fileCounts[extension] ?? 0) + 1;
		}

		const totalFiles: number = files.length;

		if (totalFiles === 0) return "No JS/TS/JSX/TSX files found";

		const stats: string = Object.entries(fileCounts)
			.map(([extension, count]: [string, number]) => {
				// eslint-disable-next-line @elsikora/typescript/no-magic-numbers
				const percent: string = ((count / totalFiles) * 100).toFixed(1);

				return `${extension.toUpperCase()}: ${percent}%`;
			})
			.join(", ");

		return `${stats} (total: ${String(totalFiles)} files)`;
	}

	private parsePackageJson(packageJsonPath: string): { author: any; depsCount: number; description: any; devDepsCount: number; version: string } {
		const defaultInfo: {
			author: string;
			depsCount: number;
			description: string;
			devDepsCount: number;
			version: string;
		} = {
			author: "",
			depsCount: 0,
			description: "",
			devDepsCount: 0,
			version: "",
		};

		if (!fs.existsSync(packageJsonPath)) return defaultInfo;

		try {
			// eslint-disable-next-line @elsikora/typescript/no-unsafe-assignment
			const packageData: any = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

			return {
				// eslint-disable-next-line @elsikora/typescript/no-unsafe-assignment,@elsikora/typescript/no-unsafe-member-access
				author: packageData.author ?? "",
				// eslint-disable-next-line @elsikora/typescript/no-unsafe-member-access,@elsikora/typescript/no-unsafe-argument
				depsCount: packageData.dependencies ? Object.keys(packageData.dependencies).length : 0,
				// eslint-disable-next-line @elsikora/typescript/no-unsafe-assignment,@elsikora/typescript/no-unsafe-member-access
				description: packageData.description ?? "",
				// eslint-disable-next-line @elsikora/typescript/no-unsafe-member-access,@elsikora/typescript/no-unsafe-argument
				devDepsCount: packageData.devDependencies ? Object.keys(packageData.devDependencies).length : 0,
				// eslint-disable-next-line @elsikora/typescript/no-unsafe-member-access,@elsikora/typescript/restrict-template-expressions
				version: packageData.version ? `v${packageData.version}` : "",
			};
		} catch {
			console.error(chalk.yellow("Warning: Failed to parse package.json"));

			return defaultInfo;
		}
	}
}
