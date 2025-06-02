/**
 * Available OpenAI models
 */
export enum EOpenAIModel {
	// GPT-3.5 Turbo series
	GPT_3_5_TURBO = "gpt-3.5-turbo",
	GPT_3_5_TURBO_0125 = "gpt-3.5-turbo-0125",
	GPT_3_5_TURBO_1106 = "gpt-3.5-turbo-1106",

	// GPT-4 (Original)
	GPT_4 = "gpt-4",
	// GPT-4.1 series (Latest 2025 models)
	GPT_4_1 = "gpt-4.1",

	GPT_4_1_MINI = "gpt-4.1-mini",
	GPT_4_1_NANO = "gpt-4.1-nano", // Fastest 4.1 model

	GPT_4_32K = "gpt-4-32k",
	// GPT-4 Turbo
	GPT_4_TURBO = "gpt-4-turbo",
	GPT_4_TURBO_PREVIEW = "gpt-4-turbo-preview",

	// GPT-4o series (Omni models)
	GPT_4O = "gpt-4o-2024-11-20", // Latest with enhanced creative writing
	GPT_4O_AUGUST = "gpt-4o-2024-08-06",
	GPT_4O_MAY = "gpt-4o",
	GPT_4O_MINI = "gpt-4o-mini",

	// O-series (Reasoning models)
	O1 = "o1", // Enhanced reasoning with image processing
	O1_MINI = "o1-mini", // Faster, cost-efficient reasoning
	O1_PREVIEW = "o1-preview",
	O3 = "o3", // Enhanced reasoning model
	O3_MINI = "o3-mini",
	O4_MINI = "o4-mini", // Enhanced reasoning abilities
}
