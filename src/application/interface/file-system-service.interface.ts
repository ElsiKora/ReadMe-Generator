/**
 * Interface for file system operations
 */
export interface IFileSystemService {
	/**
	 * Check if a file exists
	 * @param {string} path - The file path
	 * @returns {Promise<boolean>} Promise resolving to true if the file exists
	 */
	exists(path: string): Promise<boolean>;

	/**
	 * Get the current working directory
	 * @returns {string} The current working directory
	 */
	getCurrentDirectory(): string;

	/**
	 * Join path segments
	 * @param {...string} segments - Path segments to join
	 * @returns {string} The joined path
	 */
	joinPath(...segments: Array<string>): string;

	/**
	 * Read a file
	 * @param {string} path - The file path
	 * @returns {Promise<string>} Promise resolving to the file content
	 */
	readFile(path: string): Promise<string>;

	/**
	 * Write a file
	 * @param {string} path - The file path
	 * @param {string} content - The content to write
	 * @returns {Promise<void>} Promise resolving when the file is written
	 */
	writeFile(path: string, content: string): Promise<void>;
}
