/**
 * Common AWS Bedrock model IDs
 */
export enum EAWSBedrockModel {
	CLAUDE_3_5_HAIKU = "anthropic.claude-3-5-haiku-20241022-v1:0",
	// Anthropic Claude models
	CLAUDE_3_5_SONNET = "anthropic.claude-3-5-sonnet-20241022-v2:0",
	CLAUDE_3_HAIKU = "anthropic.claude-3-haiku-20240307-v1:0",
	CLAUDE_3_OPUS = "anthropic.claude-3-opus-20240229-v1:0",
	CLAUDE_3_SONNET = "anthropic.claude-3-sonnet-20240229-v1:0",
	CLAUDE_INSTANT = "anthropic.claude-instant-v1",

	LLAMA_3_1_405B = "meta.llama3-1-405b-instruct-v1:0",
	LLAMA_3_1_70B = "meta.llama3-1-70b-instruct-v1:0",
	LLAMA_3_1_8B = "meta.llama3-1-8b-instruct-v1:0",

	LLAMA_3_2_11B = "meta.llama3-2-11b-instruct-v1:0",
	// Meta Llama models
	LLAMA_3_2_1B = "meta.llama3-2-1b-instruct-v1:0",
	LLAMA_3_2_3B = "meta.llama3-2-3b-instruct-v1:0",
	LLAMA_3_2_90B = "meta.llama3-2-90b-instruct-v1:0",
	// Mistral models
	MISTRAL_7B = "mistral.mistral-7b-instruct-v0:2",
	MISTRAL_LARGE = "mistral.mistral-large-2402-v1:0",
	MISTRAL_LARGE_2407 = "mistral.mistral-large-2407-v1:0",

	// Amazon Titan models
	TITAN_TEXT_EXPRESS = "amazon.titan-text-express-v1",
	TITAN_TEXT_LITE = "amazon.titan-text-lite-v1",
	TITAN_TEXT_PREMIER = "amazon.titan-text-premier-v1:0",
}
