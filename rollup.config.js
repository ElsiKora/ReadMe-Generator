import typescript from "@rollup/plugin-typescript";

export default {
	input: "src/index.ts",
	output: {
		file: "dist/cli.js",
		format: "esm",
		sourcemap: true,
		banner: "#!/usr/bin/env node",
		exports: "auto",
	},
	external: ["fs", "path", "openai", "chalk", "commander", "@anthropic-ai/sdk", "dotenv", "cli-progress", "@clack/prompts", "axios", "glob", "ignore", "@ai-ai/sdk", "fs/promises", "node:fs", "node:path", "node:os", "node:util", "rimraf", "node:child_process"],
	plugins: [
		typescript({
			tsconfig: "./tsconfig.json",
			sourceMap: true,
			declaration: false,
		}),
	],
};
