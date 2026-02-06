#!/usr/bin/env node

// Test wrapper for injecting prompts answers
import prompts from "prompts";

// Get injected answers from environment variable
const injectedAnswers = process.env.PROMPT_INJECT_ANSWERS;
if (injectedAnswers) {
	try {
		const answers = JSON.parse(injectedAnswers);
		prompts.inject(answers);
	} catch (e) {
		console.error("Failed to parse injected answers:", e);
	}
}

// Load and run the actual CLI
await import("../../bin/index.js");
