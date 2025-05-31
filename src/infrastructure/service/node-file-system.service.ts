import type { IFileSystemService } from "../../application/interface/file-system-service.interface.js";

import fs from "node:fs/promises";
import path from "node:path";

/**
 * Node.js implementation of file system service
 */
export class NodeFileSystemService implements IFileSystemService {
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
	 * Join path segments
	 * @param {...string} segments - Path segments to join
	 * @returns {string} The joined path
	 */
	joinPath(...segments: Array<string>): string {
		return path.join(...segments);
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
