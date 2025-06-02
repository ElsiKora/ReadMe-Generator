/**
 * Interface for file system operations
 */
export interface IFileSystemService {
	/**
	 * Create a directory
	 * @param {string} path - The directory path
	 * @param {object} options - Options for directory creation
	 * @param {boolean} options.isRecursive - Whether to create parent directories
	 * @returns {Promise<void>} Promise resolving when the directory is created
	 */
	createDirectory(path: string, options?: { isRecursive?: boolean }): Promise<void>;

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
	 * Get the directory name from a file path
	 * @param {string} filepath - The file path
	 * @returns {string} The directory path
	 */
	getDirectoryNameFromFilePath(filepath: string): string;

	/**
	 * Get the extension from a file path
	 * @param {string} filepath - The file path
	 * @returns {string} The file extension (e.g., '.js', '.json')
	 */
	getExtensionFromFilePath(filepath: string): string;

	/**
	 * Get file stats
	 * @param {string} path - The file path
	 * @returns {Promise<{size: number}>} Promise resolving to file stats
	 */
	getFileStats(path: string): Promise<{ size: number }>;

	/**
	 * Check if a path is a directory
	 * @param {string} path - The path to check
	 * @returns {Promise<boolean>} Promise resolving to true if it's a directory
	 */
	isDirectory(path: string): Promise<boolean>;

	/**
	 * Check if a path exists
	 * @param {string} path - The path to check
	 * @returns {Promise<boolean>} Promise resolving to true if the path exists
	 */
	isPathExists(path: string): Promise<boolean>;

	/**
	 * Join path segments
	 * @param {...string} segments - Path segments to join
	 * @returns {string} The joined path
	 */
	joinPath(...segments: Array<string>): string;

	/**
	 * List all files in a directory recursively
	 * @param {string} directoryPath - The directory path
	 * @param {number} maxDepth - Maximum depth to scan (default: 3)
	 * @param {Array<string>} ignorePatterns - Patterns to ignore (default: common ignore patterns)
	 * @returns {Promise<Array<string>>} Promise resolving to array of file paths
	 */
	listFiles(directoryPath: string, maxDepth?: number, ignorePatterns?: Array<string>): Promise<Array<string>>;

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
