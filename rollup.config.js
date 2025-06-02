import typescript from "@rollup/plugin-typescript";

export default {
	external: ["@elsikora/cladi", "node:fs/promises", "@aws-sdk/client-bedrock-runtime", "@aws-sdk/credential-provider-env", "@google/generative-ai", "prompts", "fs", "path", "openai", "chalk", "commander", "@anthropic-ai/sdk", "dotenv", "cli-progress", "@clack/prompts", "axios", "glob", "ignore", "@ai-ai/sdk", "fs/promises", "node:fs", "node:path", "node:os", "node:util", "rimraf", "node:child_process", "form-data", "canvas", "cosmiconfig", "javascript-stringify", "yaml"],
	input: "src/index.ts",
	output: {
		banner: "#!/usr/bin/env node",
		exports: "auto",
		file: "bin/index.js",
		format: "esm",
		sourcemap: true,
	},
	plugins: [
		typescript({
			declaration: false,
			sourceMap: true,
			tsconfig: "./tsconfig.json",
		}),
	],
};
