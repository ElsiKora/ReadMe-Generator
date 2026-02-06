import type { Canvas, CanvasRenderingContext2D } from "canvas";

import type { ILogoGenerator } from "../../application/interface/logo-generator.interface";

import { createCanvas } from "canvas";

import { FIRST_ELEMENT_INDEX, LOGO_BOTTOM_LINE_OFFSET, LOGO_CENTER_DIVISOR, LOGO_FONT_SIZE_ADJUSTMENT, LOGO_HEIGHT, LOGO_INITIAL_FONT_SIZE, LOGO_PINK_COLOR, LOGO_PURPLE_COLOR, LOGO_SPLIT_THRESHOLD, LOGO_WIDTH, SECOND_ELEMENT_INDEX } from "../constant/logo-generator.constant";

/**
 * Service for generating project logos locally using canvas
 */
export class LogoGeneratorService implements ILogoGenerator {
	private readonly BOTTOM_LINE_OFFSET: number = LOGO_BOTTOM_LINE_OFFSET;

	private readonly HEIGHT: number = LOGO_HEIGHT;

	private readonly PINK_COLOR: string = LOGO_PINK_COLOR;

	private readonly PURPLE_COLOR: string = LOGO_PURPLE_COLOR;

	private readonly SPLIT_THRESHOLD: number = LOGO_SPLIT_THRESHOLD;

	private readonly WIDTH: number = LOGO_WIDTH;

	/**
	 * Generate a logo image
	 * @param {string} projectName - Name of the project
	 * @returns {Promise<Buffer>} PNG image buffer
	 */
	generateLogo(projectName: string): Promise<Buffer> {
		// Create canvas
		const canvas: Canvas = createCanvas(this.WIDTH, this.HEIGHT);
		const context: CanvasRenderingContext2D = canvas.getContext("2d");

		// Canvas is transparent by default, no need to fill background

		// Split project name into two lines
		const [line1, line2]: [string, string] = this.splitProjectName(projectName);

		// Configure text style
		context.textAlign = "center";
		context.textBaseline = "middle";

		// Calculate font size for each line independently
		if (line1) {
			const font1Size: number = this.calculateFontSize(context, line1, this.WIDTH - LOGO_INITIAL_FONT_SIZE);
			this.drawGradientText(context, line1, this.HEIGHT / LOGO_CENTER_DIVISOR - LOGO_FONT_SIZE_ADJUSTMENT, font1Size);
		}

		if (line2) {
			const font2Size: number = this.calculateFontSize(context, line2, this.WIDTH - LOGO_INITIAL_FONT_SIZE);
			this.drawGradientText(context, line2, this.HEIGHT / LOGO_CENTER_DIVISOR + LOGO_FONT_SIZE_ADJUSTMENT, font2Size);
		}

		// Draw gradient line at bottom
		this.drawBottomGradientLine(context);

		// Convert canvas to PNG buffer
		return Promise.resolve(canvas.toBuffer("image/png"));
	}

	/**
	 * Calculate optimal font size for text to fit within max width
	 * @param {CanvasRenderingContext2D} context - Canvas context
	 * @param {string} text - Text to measure
	 * @param {number} maxWidth - Maximum width for the text
	 * @returns {number} Optimal font size
	 */
	private calculateFontSize(context: CanvasRenderingContext2D, text: string, maxWidth: number): number {
		// Binary search for optimal size
		let minSize: number = 10;
		let maxSize: number = 250; // Reduced from 400 for more reasonable sizes
		let optimalSize: number = 10;

		while (minSize <= maxSize) {
			const testSize: number = Math.floor((minSize + maxSize) / LOGO_CENTER_DIVISOR);
			context.font = `bold ${testSize}px Arial, sans-serif`;
			// Let TypeScript infer the correct TextMetrics type from canvas
			// eslint-disable-next-line @elsikora/typescript/typedef
			const metrics = context.measureText(text);

			if (metrics.width <= maxWidth) {
				optimalSize = testSize;
				minSize = testSize + 1;
			} else {
				maxSize = testSize - 1;
			}
		}

		// Cap the font size to ensure it's not too large
		return Math.min(optimalSize, LOGO_INITIAL_FONT_SIZE);
	}

	/**
	 * Draw gradient line at bottom
	 * @param {CanvasRenderingContext2D} context - Canvas context
	 */
	private drawBottomGradientLine(context: CanvasRenderingContext2D): void {
		const lineY: number = this.HEIGHT - this.BOTTOM_LINE_OFFSET;
		const lineHeight: number = 6;

		// Left half - purple
		context.fillStyle = this.PURPLE_COLOR;
		context.fillRect(0, lineY, this.WIDTH / LOGO_CENTER_DIVISOR, lineHeight);

		// Right half - pink
		context.fillStyle = this.PINK_COLOR;
		context.fillRect(this.WIDTH / LOGO_CENTER_DIVISOR, lineY, this.WIDTH / LOGO_CENTER_DIVISOR, lineHeight);
	}

	/**
	 * Draw text with horizontal gradient
	 * @param {CanvasRenderingContext2D} context - Canvas context
	 * @param {string} text - Text to draw
	 * @param {number} y - Y position
	 * @param {number} fontSize - Font size to use
	 */
	private drawGradientText(context: CanvasRenderingContext2D, text: string, y: number, fontSize: number): void {
		if (!text) return;

		// Set the font with bold weight
		context.font = `bold ${fontSize}px Arial, sans-serif`;

		// Measure text width for gradient
		// Let TypeScript infer the correct TextMetrics type from canvas
		// eslint-disable-next-line @elsikora/typescript/typedef
		const textMetrics = context.measureText(text);

		// Create gradient
		const gradient: CanvasGradient = context.createLinearGradient((this.WIDTH - textMetrics.width) / LOGO_CENTER_DIVISOR, 0, (this.WIDTH + textMetrics.width) / LOGO_CENTER_DIVISOR, 0);
		gradient.addColorStop(0, this.PURPLE_COLOR);
		gradient.addColorStop(1, this.PINK_COLOR);

		// Draw text
		context.fillStyle = gradient;
		context.fillText(text, this.WIDTH / LOGO_CENTER_DIVISOR, y);
	}

	/**
	 * Split project name into two lines
	 * @param {string} projectName - The project name
	 * @returns {Array<string>} Array of text lines
	 */
	private splitProjectName(projectName: string): [string, string] {
		// Remove common suffixes/prefixes
		const cleanName: string = projectName
			.replace(/^(?:@[\w-]+\/)?/, "") // Remove npm scope
			.replaceAll(/[-_]/g, " ") // Replace hyphens/underscores with spaces
			.replace(/\.(?:js|ts|jsx|tsx)$/, "") // Remove file extensions
			.toUpperCase();

		// Split on spaces
		const words: Array<string> = cleanName.split(" ").filter((w: string) => w.length > 0);

		// If we have exactly 2 words, use them
		if (words.length === LOGO_CENTER_DIVISOR) {
			return [words[FIRST_ELEMENT_INDEX] ?? "", words[SECOND_ELEMENT_INDEX] ?? ""];
		}

		// If we have more than 2 words, try to balance them
		if (words.length > LOGO_CENTER_DIVISOR) {
			const midPoint: number = Math.floor(words.length / LOGO_CENTER_DIVISOR);
			const firstLine: string = words.slice(0, midPoint).join(" ");
			const secondLine: string = words.slice(midPoint).join(" ");

			return [firstLine, secondLine];
		}

		// For single word, check if it's a compound word
		if (words.length === 1) {
			const word: string | undefined = words[FIRST_ELEMENT_INDEX];

			if (!word) return ["", ""];

			// Try to split camelCase or PascalCase
			const camelSplit: null | RegExpMatchArray = word.match(/[A-Z][a-z]+/g);

			if (camelSplit && camelSplit.length >= LOGO_CENTER_DIVISOR) {
				const mid: number = Math.floor(camelSplit.length / LOGO_CENTER_DIVISOR);

				return [camelSplit.slice(0, mid).join(""), camelSplit.slice(mid).join("")];
			}

			// If it's a long single word, split in middle
			if (word.length > this.SPLIT_THRESHOLD) {
				const midPoint: number = Math.floor(word.length / LOGO_CENTER_DIVISOR);

				return [word.slice(0, midPoint), word.slice(midPoint)];
			}

			// Short single word - put it all on first line
			return [word, ""];
		}

		// Empty or no words
		return ["", ""];
	}
}
