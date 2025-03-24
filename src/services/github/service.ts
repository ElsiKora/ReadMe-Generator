import type { IRepoInfo } from "../../types";
import type { TSpinnerInstance } from "../../utils/cli/types";

import type { IGithubRepoResponse } from "./types";

import { exec } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import axios from "axios";
import { rimrafSync } from "rimraf";

import { startSpinner, stopSpinner } from "../../utils/cli/spinner";
import { LocalService } from "../local/service";

// @ts-ignore
const execAsync: (argument1: string) => Promise<string> = promisify(exec);

export class GithubService {
	// eslint-disable-next-line @elsikora/typescript/naming-convention
	private readonly tempBaseDir: string;

	constructor() {
		this.tempBaseDir = path.join(os.tmpdir(), "readme-generator");

		if (!fs.existsSync(this.tempBaseDir)) {
			// eslint-disable-next-line @elsikora/typescript/naming-convention
			fs.mkdirSync(this.tempBaseDir, { recursive: true });
		}
	}

	cleanup(repoInfo: IRepoInfo): void {
		if (repoInfo.tempDir && fs.existsSync(repoInfo.tempDir)) {
			const spinner: TSpinnerInstance = startSpinner("Cleaning up temporary files...");

			try {
				rimrafSync(repoInfo.tempDir);
				stopSpinner(spinner, "Cleanup completed");
			} catch {
				stopSpinner(spinner, "Cleanup failed", false);
				console.warn("Failed to remove temporary directory:", repoInfo.tempDir);
			}
		}
	}

	async getRepoInfo(repoPath: string): Promise<IRepoInfo> {
		const [owner, repoName]: Array<string> = repoPath.split("/");
		const spinner: TSpinnerInstance = startSpinner(`Fetching ${String(owner)}/${String(repoName)} repository data...`);

		try {
			// eslint-disable-next-line @elsikora/typescript/typedef
			const response = await axios.get<IGithubRepoResponse>(`https://api.github.com/repos/${String(owner)}/${String(repoName)}`, {
				headers: process.env.GITHUB_TOKEN
					? {
							Authorization: `token ${process.env.GITHUB_TOKEN}`,
						}
					: undefined,
			});

			const temporaryDirectory: string = path.join(this.tempBaseDir, `${String(owner)}-${String(repoName)}-${String(Date.now())}`);

			stopSpinner(spinner, "GitHub data retrieved, cloning repository...");

			const cloneSpinner: TSpinnerInstance = startSpinner("Cloning repository...");

			const cloneUrl: string = process.env.GITHUB_TOKEN ? `https://${process.env.GITHUB_TOKEN}@github.com/${String(owner)}/${String(repoName)}.git` : `https://github.com/${String(owner)}/${String(repoName)}.git`;

			try {
				await execAsync(`git clone ${cloneUrl} ${temporaryDirectory}`);
				stopSpinner(cloneSpinner, "Repository cloned successfully");

				const localService: LocalService = new LocalService();
				const localInfo: IRepoInfo = localService.getRepoInfo(temporaryDirectory);

				const combinedInfo: IRepoInfo = {
					author: response.data.owner.login,
					codeStats: localInfo.codeStats,
					description: response.data.description || "",
					name: response.data.name || `${String(owner)}/${String(repoName)}`,
					tempDir: temporaryDirectory,
				};

				return combinedInfo;
			} catch {
				stopSpinner(cloneSpinner, "Failed to clone repository", false);
				console.warn("Falling back to basic GitHub info only");

				return {
					author: response.data.owner.login,
					codeStats: "Remote repo; basic info from GitHub only",
					description: response.data.description || "",
					name: response.data.name || `${String(owner)}/${String(repoName)}`,
				};
			}
		} catch (error) {
			stopSpinner(spinner, "Failed to fetch repository data", false);

			throw error;
		}
	}
}
