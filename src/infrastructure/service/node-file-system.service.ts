import type { Stats } from "node:fs";

import type { IFileSystemService } from "../../application/interface/file-system-service.interface";

import * as fs from "node:fs/promises";
import path from "node:path";

import { CODE_FILE_EXTENSIONS, DEFAULT_IGNORE_PATTERNS, DEFAULT_SCAN_DEPTH, SPECIAL_FILE_NAMES } from "../../domain/constant/file-scanning.constant";

/**
 * Node.js implementation of file system service
 */
export class NodeFileSystemService implements IFileSystemService {
	/**
	 * Create a directory
	 * @param {string} directoryPath - The directory path
	 * @param {object} options - Options for directory creation
	 * @param {boolean} options.isRecursive - Whether to create parent directories
	 * @returns {Promise<void>} Promise resolving when the directory is created
	 */
	async createDirectory(directoryPath: string, options?: { isRecursive?: boolean }): Promise<void> {
		// eslint-disable-next-line @elsikora/typescript/naming-convention
		await fs.mkdir(directoryPath, { recursive: options?.isRecursive ?? false });
	}

	/**
	 * Check if a file exists
	 * @param {string} filePath - The file path
	 * @returns {Promise<boolean>} Promise resolving to true if the file exists
	 */
	async exists(filePath: string): Promise<boolean> {
		try {
			await fs.access(filePath);

			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get the current working directory
	 * @returns {string} The current working directory
	 */
	getCurrentDirectory(): string {
		return process.cwd();
	}

	/**
	 * Get the directory name from a file path
	 * @param {string} filepath - The file path
	 * @returns {string} The directory path
	 */
	getDirectoryNameFromFilePath(filepath: string): string {
		return path.dirname(filepath);
	}

	/**
	 * Get the extension from a file path
	 * @param {string} filepath - The file path
	 * @returns {string} The file extension (e.g., '.js', '.json')
	 */
	getExtensionFromFilePath(filepath: string): string {
		return path.extname(filepath);
	}

	/**
	 * Get file stats
	 * @param {string} filePath - The file path
	 * @returns {Promise<{size: number}>} Promise resolving to file stats
	 */
	async getFileStats(filePath: string): Promise<{ size: number }> {
		const stats: Stats = await fs.stat(filePath);

		return { size: stats.size };
	}

	/**
	 * Check if a path is a directory
	 * @param {string} filePath - The path to check
	 * @returns {Promise<boolean>} Promise resolving to true if it's a directory
	 */
	async isDirectory(filePath: string): Promise<boolean> {
		try {
			const stats: Stats = await fs.stat(filePath);

			return stats.isDirectory();
		} catch {
			return false;
		}
	}

	/**
	 * Check if a path exists
	 * @param {string} pathToCheck - The path to check
	 * @returns {Promise<boolean>} Promise resolving to true if the path exists
	 */
	async isPathExists(pathToCheck: string): Promise<boolean> {
		try {
			await fs.access(pathToCheck);

			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Join path segments
	 * @param {...string} segments - Path segments to join
	 * @returns {string} The joined path
	 */
	joinPath(...segments: Array<string>): string {
		return path.join(...segments);
	}

	/**
	 * List all files in a directory recursively
	 * @param {string} directoryPath - The directory path
	 * @param {number} maxDepth - Maximum depth to scan (default: 3)
	 * @param {Array<string>} ignorePatterns - Patterns to ignore
	 * @returns {Promise<Array<string>>} Promise resolving to array of file paths
	 */
	async listFiles(directoryPath: string, maxDepth: number = DEFAULT_SCAN_DEPTH, ignorePatterns?: Array<string>): Promise<Array<string>> {
		const patterns: Array<string> = ignorePatterns ?? DEFAULT_IGNORE_PATTERNS;
		const files: Array<string> = [];

		const scanDirectory = async (directory: string, currentDepth: number): Promise<void> => {
			if (currentDepth > maxDepth) return;

			try {
				const entries: Array<string> = await fs.readdir(directory);

				for (const entry of entries) {
					const fullPath: string = path.join(directory, entry);
					const relativePath: string = path.relative(directoryPath, fullPath);

					// Check if should ignore
					const shouldIgnore: boolean = patterns.some((pattern: string) => {
						// Simple pattern matching
						if (pattern.includes("*")) {
							const regex: RegExp = new RegExp("^" + pattern.replaceAll("*", ".*") + "$");

							return regex.test(entry) || regex.test(relativePath);
						}

						return entry === pattern || relativePath.startsWith(pattern);
					});

					if (shouldIgnore) continue;

					const stats: Stats = await fs.stat(fullPath);

					if (stats.isDirectory()) {
						await scanDirectory(fullPath, currentDepth + 1);
					} else if (stats.isFile()) {
						// Only include code files
						const extension: string = path.extname(entry).toLowerCase();
						const fileName: string = entry.toLowerCase();

						if (CODE_FILE_EXTENSIONS.includes(extension) || SPECIAL_FILE_NAMES.includes(fileName)) {
							files.push(relativePath);
						}
					}
				}
			} catch (error) {
				// Ignore permission errors and continue
				if ((error as { code?: string }).code !== "EACCES") {
					throw error;
				}
			}
		};

		await scanDirectory(directoryPath, 1);

		return files.sort((a: string, b: string) => a.localeCompare(b));
	}

	/**
	 * Read a file
	 * @param {string} filePath - The file path
	 * @returns {Promise<string>} Promise resolving to the file content
	 */
	async readFile(filePath: string): Promise<string> {
		return fs.readFile(filePath, "utf8");
	}

	/**
	 * Write a file
	 * @param {string} filePath - The file path
	 * @param {string} content - The content to write
	 * @returns {Promise<void>} Promise resolving when the file is written
	 */
	async writeFile(filePath: string, content: string): Promise<void> {
		await fs.writeFile(filePath, content, "utf8");
	}
}
