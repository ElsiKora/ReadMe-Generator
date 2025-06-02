/**
 * Enum for project file scan depth levels
 */
export enum EScanDepth {
	/**
	 * Deep scan (3 levels)
	 */
	DEEP = 3,

	/**
	 * Extreme scan (7 levels) - scans very deeply into the project structure
	 */
	EXTREME = 7,

	/**
	 * Medium scan (2 levels)
	 */
	MEDIUM = 2,

	/**
	 * Shallow scan (1 level)
	 */
	SHALLOW = 1,

	/**
	 * Skip file scanning
	 */
	SKIP = 0,

	/**
	 * Very deep scan (5 levels) - comprehensive project analysis
	 */
	VERY_DEEP = 5,
}
