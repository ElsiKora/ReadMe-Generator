import type { ILlmPromptContext } from "./llm-service.interface.js";

/**
 * Interface for building prompts for LLM services
 */
export interface IPromptBuilder {
	/**
	 * Build the system prompt
	 * @param {ILlmPromptContext} context - The context for generating the README
	 * @returns {string} The system prompt
	 */
	buildSystemPrompt(context: ILlmPromptContext): string;

	/**
	 * Build the user prompt
	 * @param {ILlmPromptContext} context - The context for generating the README
	 * @returns {string} The user prompt
	 */
	buildUserPrompt(context: ILlmPromptContext): string;
}
