/**
 * Infrastructure detection rule
 */
export interface IDetectionRule {
	name: string;
	paths: Array<string>;
}

/**
 * CI/CD detection rules
 */
export const CICD_RULES: Array<IDetectionRule> = [
	{ name: "GitHub Actions", paths: [".github/workflows"] },
	{ name: "GitLab CI", paths: [".gitlab-ci.yml"] },
	{ name: "Jenkins", paths: ["Jenkinsfile"] },
	{ name: "CircleCI", paths: [".circleci"] },
	{ name: "Travis CI", paths: [".travis.yml"] },
	{ name: "Azure Pipelines", paths: ["azure-pipelines.yml"] },
];

/**
 * Containerization detection rules
 */
export const CONTAINER_RULES: Array<IDetectionRule> = [
	{ name: "Docker", paths: ["Dockerfile", "dockerfile", ".dockerignore"] },
	{ name: "Docker Compose", paths: ["docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"] },
	{ name: "Kubernetes", paths: ["k8s", "kubernetes", "helm"] },
];

/**
 * Linting/Formatting detection rules
 */
export const LINTING_RULES: Array<IDetectionRule> = [
	{ name: "ESLint", paths: [".eslintrc", ".eslintrc.js", ".eslintrc.cjs", ".eslintrc.json", ".eslintrc.yml", "eslint.config.js", "eslint.config.mjs", "eslint.config.cjs"] },
	{ name: "Prettier", paths: [".prettierrc", ".prettierrc.js", ".prettierrc.json", ".prettierrc.yml", "prettier.config.js", "prettier.config.mjs"] },
	{ name: "Biome", paths: ["biome.json", "biome.jsonc"] },
	{ name: "Stylelint", paths: [".stylelintrc", ".stylelintrc.json", ".stylelintrc.js", "stylelint.config.js"] },
	{ name: "EditorConfig", paths: [".editorconfig"] },
];

/**
 * Testing framework detection rules
 */
export const TESTING_RULES: Array<IDetectionRule> = [
	{ name: "Jest", paths: ["jest.config.js", "jest.config.ts", "jest.config.mjs", "jest.config.cjs", "jest.config.json"] },
	{ name: "Vitest", paths: ["vitest.config.js", "vitest.config.ts", "vitest.config.mjs"] },
	{ name: "Mocha", paths: [".mocharc.yml", ".mocharc.json", ".mocharc.js"] },
	{ name: "Cypress", paths: ["cypress.config.js", "cypress.config.ts", "cypress.config.mjs", "cypress"] },
	{ name: "Playwright", paths: ["playwright.config.js", "playwright.config.ts"] },
	{ name: "Storybook", paths: [".storybook"] },
];

/**
 * Bundler detection rules
 */
export const BUNDLER_RULES: Array<IDetectionRule> = [
	{ name: "Webpack", paths: ["webpack.config.js", "webpack.config.ts", "webpack.config.mjs"] },
	{ name: "Vite", paths: ["vite.config.js", "vite.config.ts", "vite.config.mjs"] },
	{ name: "Rollup", paths: ["rollup.config.js", "rollup.config.ts", "rollup.config.mjs"] },
	{ name: "esbuild", paths: ["esbuild.config.js", "esbuild.mjs"] },
	{ name: "TypeScript", paths: ["tsconfig.json"] },
	{ name: "SWC", paths: [".swcrc"] },
	{ name: "Babel", paths: [".babelrc", ".babelrc.json", "babel.config.js", "babel.config.json"] },
];

/**
 * Package manager detection rules
 */
export const PACKAGE_MANAGER_RULES: Array<IDetectionRule> = [
	{ name: "pnpm", paths: ["pnpm-lock.yaml", "pnpm-workspace.yaml"] },
	{ name: "Yarn", paths: ["yarn.lock", ".yarnrc.yml", ".yarnrc"] },
	{ name: "npm", paths: ["package-lock.json"] },
	{ name: "Bun", paths: ["bun.lockb", "bun.lock"] },
];
