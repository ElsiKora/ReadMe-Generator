/**
 * README generation constants
 */

/**
 * Maximum number of top contributors to display in the README contributors table
 */
export const MAX_TOP_CONTRIBUTORS: number = 10;

/**
 * Maximum number of top items (contributors, tags) to display in prompts
 */
export const TOP_ITEMS_LIMIT: number = 5;

/**
 * Maximum number of recent tags to display in prompts
 */
export const RECENT_TAGS_LIMIT: number = 5;

/**
 * Maximum number of top languages to display in CLI output
 */
export const TOP_LANGUAGES_LIMIT: number = 3;

/**
 * Multiplier for converting ratio to percentage
 */
export const PERCENTAGE_MULTIPLIER: number = 100;

/**
 * Default badges to include when none are provided
 */
export const DEFAULT_BADGES: Array<{ color: string; logo: string; logoColor: string; name: string }> = [
	{ color: "339933", logo: "node.js", logoColor: "white", name: "Node.js" },
	{ color: "3178C6", logo: "typescript", logoColor: "white", name: "TypeScript" },
	{ color: "CB3837", logo: "npm", logoColor: "white", name: "npm" },
];

/**
 * ElsiKora badge HTML
 */
export const ELSIKORA_BADGE: string = `<a aria-label="ElsiKora logo" href="https://elsikora.com">
  <img src="https://img.shields.io/badge/MADE%20BY%20ElsiKora-333333.svg?style=for-the-badge" alt="ElsiKora">
</a>`;

/**
 * Directories to ignore when generating directory tree
 */
export const DIRECTORY_TREE_IGNORE: Array<string> = [".cache", ".git", ".idea", ".next", ".nuxt", ".turbo", ".vscode", "build", "coverage", "dist", "node_modules"];
