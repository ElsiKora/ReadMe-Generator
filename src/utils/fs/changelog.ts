import fs from "node:fs";
import path from "node:path";

/**
 *
 * @param {string} basePath - The base path to search for the changelog file.
 * @returns {null | string} - The path to the changelog file if found, or null if not found.
 */
export function findChangelogFile(basePath: string): null | string {
	const possiblePaths: Array<string> = ["CHANGELOG.md", "changelog.md", "docs/CHANGELOG.md", "docs/changelog.md", "doc/CHANGELOG.md", "doc/changelog.md", ".github/CHANGELOG.md", "documentation/CHANGELOG.md"];

	for (const relativePath of possiblePaths) {
		const fullPath: string = path.join(basePath, relativePath);

		if (fs.existsSync(fullPath)) {
			return fullPath;
		}
	}

	return null;
}

/**
 *
 * @param {string} changelogPath - The path to the changelog file.
 * @returns {string} - The content of the changelog file.
 */
export function getChangelogContent(changelogPath: string): string {
	if (!fs.existsSync(changelogPath)) return "";

	try {
		return fs.readFileSync(changelogPath, "utf8");
	} catch (error) {
		console.error(`Error reading changelog file: ${String(error)}`);

		return "";
	}
}
