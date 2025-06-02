import type { Readme } from "../../domain/index.js";

import type { ILlmPromptContext } from "./llm-service.interface.js";

/**
 * Interface for parsing LLM responses into README objects
 */
export interface IReadmeResponseParser {
	/**
	 * Parse the LLM response content into a Readme object
	 * @param {string} content - The raw response content from the LLM
	 * @param {ILlmPromptContext} context - The context used for generating the README
	 * @returns {Readme} The parsed Readme object
	 * @throws {Error} If parsing fails or required fields are missing
	 */
	parseResponse(content: string, context: ILlmPromptContext): Readme;
}
