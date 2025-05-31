// eslint-disable-next-line @elsikora/unicorn/prevent-abbreviations
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		environment: "node",
		exclude: ["**/node_modules/**", "**/dist/**", "**/test/unit/**"],
		globals: true,
		include: ["test/e2e/**/*.test.ts"],
		root: ".",
		testTimeout: 30_000,
		watch: false,
	},
});
