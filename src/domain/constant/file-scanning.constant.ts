/**
 * File scanning configuration constants
 */

// Base numeric constants to avoid magic numbers
export const KILOBYTE: number = 1024;
export const MEGABYTE: number = KILOBYTE * KILOBYTE;

// Numeric constants for calculations
const HUNDRED: number = 100;
const TWO: number = 2;
const HUNDRED_THOUSAND: number = 100_000;

/**
 * Maximum size for a single file in bytes (100KB)
 */
export const MAX_FILE_SIZE: number = HUNDRED * KILOBYTE;

/**
 * Maximum total size for all scanned files in bytes (2MB)
 */
export const MAX_TOTAL_SIZE: number = TWO * MEGABYTE;

/**
 * Maximum content length for file content in LLM prompts (characters)
 */
export const MAX_FILE_CONTENT_LENGTH: number = HUNDRED_THOUSAND;

/**
 * Default scan depth for directory traversal
 */
export const DEFAULT_SCAN_DEPTH: number = 3;

/**
 * File extensions to include in scanning
 */
export const CODE_FILE_EXTENSIONS: Array<string> = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".py", ".rb", ".go", ".rs", ".java", ".kt", ".c", ".cpp", ".h", ".hpp", ".cs", ".swift", ".php", ".vue", ".svelte", ".astro", ".json", ".yaml", ".yml", ".toml", ".xml", ".md", ".mdx", ".txt", ".sh", ".bash", ".dockerfile", ".dockerignore", ".gitignore", ".env.example", ".env.sample"];

/**
 * Special file names to include regardless of extension
 */
export const SPECIAL_FILE_NAMES: Array<string> = ["dockerfile", "makefile", "readme", "license"];

/**
 * Default patterns to ignore during file scanning
 */
export const DEFAULT_IGNORE_PATTERNS: Array<string> = ["node_modules", ".git", ".idea", ".vscode", "dist", "build", "coverage", ".DS_Store", "*.log", "*.lock", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", ".env", ".env.*", "*.png", "*.jpg", "*.jpeg", "*.gif", "*.svg", "*.ico", "*.mp4", "*.mov", "*.avi", "*.zip", "*.tar", "*.gz", ".cache", ".turbo", ".next", ".nuxt", ".svelte-kit"];
