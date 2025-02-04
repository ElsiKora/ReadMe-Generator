import type { IFileContent } from "./types";

import fs from "node:fs";
import path from "node:path";

import { glob } from "glob";

import { SCANNER_CHAR_PER_TOKEN, SCANNER_CODE_FILE_EXTENSIONS, SCANNER_INGNORED_DIRS, SCANNER_TOKEN_LIMIT } from "../../constants";

export class ProjectScanner {
	private totalChars: number = 0;

	extractContextInfo(files: Array<IFileContent>): string {
		let context: string = "";
		this.totalChars = 0;

		const sortedFiles: Array<IFileContent> = [...files].sort((a: IFileContent, b: IFileContent) => {
			// eslint-disable-next-line @elsikora-typescript/explicit-function-return-type,@elsikora-unicorn/consistent-function-scoping
			const configScore = (name: string) => {
				if (name.includes("config")) return 1;

				if (name.includes("main") || name.includes("index")) return 2;

				return 3;
			};

			return configScore(a.path) - configScore(b.path);
		});

		// eslint-disable-next-line @elsikora-unicorn/no-array-reduce
		const filesByExtension: Record<string, Array<IFileContent>> = sortedFiles.reduce<Record<string, Array<IFileContent>>>((accumulator: Record<string, Array<IFileContent>>, file: IFileContent) => {
			const extension: string = file.extension.slice(1).toUpperCase();

			if (!accumulator[extension]) accumulator[extension] = [];
			accumulator[extension].push(file);

			return accumulator;
		}, {});

		for (const [extension, files] of Object.entries(filesByExtension)) {
			const extensionContext: string = `\n## ${extension} Files Analysis:\n`;

			if (this.totalChars + extensionContext.length > SCANNER_TOKEN_LIMIT * SCANNER_CHAR_PER_TOKEN) break;

			context += extensionContext;
			this.totalChars += extensionContext.length;

			for (const file of files) {
				const fileHeader: string = `\n### ${file.path}:\n`;
				const fileContent: string = `\`\`\`${extension.toLowerCase()}\n${file.content}\n\`\`\`\n`;
				const totalBlockSize: number = fileHeader.length + fileContent.length;

				if (this.totalChars + totalBlockSize > SCANNER_TOKEN_LIMIT * SCANNER_CHAR_PER_TOKEN) {
					context += "\n[Additional files omitted due to length limitations]\n";

					break;
				}

				context += fileHeader + fileContent;
				this.totalChars += totalBlockSize;
			}
		}

		return context;
	}

	async scanProject(rootPath: string, maxDepth: number = 1): Promise<Array<IFileContent>> {
		const pattern: string = path.join(rootPath, "**", "*.*").replaceAll("\\", "/");

		const files: Array<string> = await glob(pattern, {
			ignore: SCANNER_INGNORED_DIRS.map((directory: string) => `**/${directory}/**`),
			maxDepth: maxDepth,
			// eslint-disable-next-line @elsikora-typescript/naming-convention
			nodir: true,
		});

		const results: Array<IFileContent> = [];

		for (const file of files) {
			const extension: string = path.extname(file);
			const basename: string = path.basename(file);
			const hasValidExtension: boolean = SCANNER_CODE_FILE_EXTENSIONS.some((extension: string) => basename.endsWith(extension));

			if (hasValidExtension) {
				try {
					// eslint-disable-next-line no-await-in-loop
					const content: string = await fs.promises.readFile(file, "utf8");
					results.push({
						content: content,
						extension: extension,
						path: path.relative(rootPath, file),
					});
				} catch {
					/* empty */
				}
			}
		}

		return results;
	}
}
