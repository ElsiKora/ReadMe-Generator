import type { TLanguageChoice, TProviderChoice, TRepoModeChoice } from "../utils/cli/types";

import { EAIProvider } from "../services/ai/provider.enum";

export const DEFAULT_LOGO_URL: string = "https://placehold.co/600x200/444/FFF?text=Project+Logo";
export const DEFAULT_BADGES: Array<{ color: string; logo: string; logoColor: string; name: string }> = [
	{
		color: "F7DF1E",
		logo: "javascript",
		logoColor: "black",
		name: "JavaScript",
	},
];
export const ELSIKORA_BADGE: string = `<a aria-label="ElsiKora logo" href="https://elsikora.com">
  <img src="https://img.shields.io/badge/MADE%20BY%20ElsiKora-333333.svg?style=for-the-badge" alt="ElsiKora">
</a>`;
export const SCANNER_CHAR_PER_TOKEN: number = 4;
export const SCANNER_CODE_FILE_EXTENSIONS: Array<string> = [".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs"];

export const SCANNER_INGNORED_DIRS: Array<string> = ["node_modules", ".git", "dist", "build", "coverage", ".next", ".nuxt"];

export const SCANNER_TOKEN_LIMIT: number = 100_000;

export const LANGUAGE_CHOICES: Array<TLanguageChoice> = [
	{ name: "English", value: "en" },
	{ name: "Spanish", value: "es" },
	{ name: "French", value: "fr" },
	{ name: "German", value: "de" },
	{ name: "Russian", value: "ru" },
] as const;

export const PROVIDER_CHOICES: Array<TProviderChoice> = [
	{ name: "OpenAI", value: EAIProvider.OPENAI },
	{ name: "Anthropic", value: EAIProvider.ANTHROPIC },
] as const;

export const REPO_MODE_CHOICES: Array<TRepoModeChoice> = [
	{ name: "Local path", value: "local" },
	{ name: "GitHub (owner/repo)", value: "remote" },
] as const;

export const DEFAULT_SCAN_DEPTH: string = "4";
export const DEFAULT_OUTPUT_FILE: string = "README.md";
export const DEFAULT_LOCAL_PATH: string = ".";

export const PREDEFINED_LIB_BADGES: Record<string, { color: string; logo: string; logoColor: string }> = {
	".net": { color: "512BD4", logo: ".net", logoColor: "white" },
	"alpine linux": { color: "0D597F", logo: "alpinelinux", logoColor: "white" },
	android: { color: "3DDC84", logo: "android", logoColor: "white" },
	angular: { color: "DD0031", logo: "angular", logoColor: "white" },
	ansible: { color: "EE0000", logo: "ansible", logoColor: "white" },
	antdesign: { color: "0170FE", logo: "ant-design", logoColor: "white" },
	apache: { color: "D22128", logo: "apache", logoColor: "white" },
	"apollo graphql": { color: "311C87", logo: "apollo-graphql", logoColor: "white" },
	"arch linux": { color: "1793D1", logo: "arch-linux", logoColor: "white" },
	auth0: { color: "EB5424", logo: "auth0", logoColor: "white" },
	aws: { color: "232F3E", logo: "amazonaws", logoColor: "white" },
	axios: { color: "5A29E4", logo: "axios", logoColor: "white" },
	azure: { color: "0078D4", logo: "microsoft-azure", logoColor: "white" },
	babel: { color: "F9DC3E", logo: "babel", logoColor: "black" },
	bitbucket: { color: "0052CC", logo: "bitbucket", logoColor: "white" },
	bootstrap: { color: "7952B3", logo: "bootstrap", logoColor: "white" },
	bun: { color: "000000", logo: "bun", logoColor: "white" },
	"c#": { color: "239120", logo: "csharp", logoColor: "white" },
	"c++": { color: "00599C", logo: "cplusplus", logoColor: "white" },
	capacitor: { color: "119EFF", logo: "capacitor", logoColor: "white" },
	centos: { color: "262577", logo: "centos", logoColor: "white" },
	chai: { color: "A30701", logo: "chai", logoColor: "white" },
	chakraui: { color: "319795", logo: "chakraui", logoColor: "white" },
	chrome: { color: "4285F4", logo: "googlechrome", logoColor: "white" },
	circleci: { color: "343434", logo: "circleci", logoColor: "white" },
	codeceptjs: { color: "F6E05E", logo: "codeceptjs", logoColor: "black" },
	codecov: { color: "F01F7A", logo: "codecov", logoColor: "white" },
	commitlint: { color: "000000", logo: "commitlint", logoColor: "white" },
	composer: { color: "885630", logo: "composer", logoColor: "white" },
	cordova: { color: "E8E8E8", logo: "apache-cordova", logoColor: "black" },
	cypress: { color: "17202C", logo: "cypress", logoColor: "white" },
	dart: { color: "0175C2", logo: "dart", logoColor: "white" },
	datadog: { color: "632CA6", logo: "datadog", logoColor: "white" },
	debian: { color: "A81D33", logo: "debian", logoColor: "white" },
	deno: { color: "000000", logo: "deno", logoColor: "white" },
	django: { color: "092E20", logo: "django", logoColor: "white" },
	docker: { color: "2496ED", logo: "docker", logoColor: "white" },
	docusaurus: { color: "2E8555", logo: "docusaurus", logoColor: "white" },
	edge: { color: "0078D7", logo: "microsoft-edge", logoColor: "white" },
	elasticsearch: { color: "005571", logo: "elasticsearch", logoColor: "white" },
	electron: { color: "47848F", logo: "electron", logoColor: "white" },
	elixir: { color: "4B275F", logo: "elixir", logoColor: "white" },
	eslint: { color: "4B32C3", logo: "eslint", logoColor: "white" },
	"eslint-config": { color: "4B32C3", logo: "eslint", logoColor: "white" },
	expo: { color: "000020", logo: "expo", logoColor: "white" },
	express: { color: "000000", logo: "express", logoColor: "white" },
	fastapi: { color: "009688", logo: "fastapi", logoColor: "white" },
	fedora: { color: "294172", logo: "fedora", logoColor: "white" },
	firebase: { color: "FFCA28", logo: "firebase", logoColor: "black" },
	firefox: { color: "FF7139", logo: "firefoxbrowser", logoColor: "white" },
	flask: { color: "000000", logo: "flask", logoColor: "white" },
	flutter: { color: "02569B", logo: "flutter", logoColor: "white" },
	gatsby: { color: "663399", logo: "gatsby", logoColor: "white" },
	git: { color: "F05032", logo: "git", logoColor: "white" },
	gitbook: { color: "3884FF", logo: "gitbook", logoColor: "white" },
	github: { color: "181717", logo: "github", logoColor: "white" },
	gitlab: { color: "FCA121", logo: "gitlab", logoColor: "white" },
	go: { color: "00ADD8", logo: "go", logoColor: "white" },
	"google cloud": { color: "4285F4", logo: "google-cloud", logoColor: "white" },
	gradle: { color: "02303A", logo: "gradle", logoColor: "white" },
	grafana: { color: "F46800", logo: "grafana", logoColor: "white" },
	graphql: { color: "E10098", logo: "graphql", logoColor: "white" },
	haskell: { color: "5D4F85", logo: "haskell", logoColor: "white" },
	heroku: { color: "430098", logo: "heroku", logoColor: "white" },
	homebrew: { color: "FBB040", logo: "homebrew", logoColor: "white" },
	husky: { color: "42B983", logo: "husky", logoColor: "white" },
	insomnia: { color: "5849BE", logo: "insomnia", logoColor: "white" },
	intellij: { color: "000000", logo: "intellij-idea", logoColor: "white" },
	ionic: { color: "3880FF", logo: "ionic", logoColor: "white" },
	ios: { color: "000000", logo: "ios", logoColor: "white" },
	jasmine: { color: "8A4182", logo: "jasmine", logoColor: "white" },
	java: { color: "007396", logo: "java", logoColor: "white" },
	javascript: { color: "F7DF1E", logo: "javascript", logoColor: "black" },
	jenkins: { color: "D24939", logo: "jenkins", logoColor: "white" },
	jest: { color: "C21325", logo: "jest", logoColor: "white" },
	jotai: { color: "000000", logo: "jotai", logoColor: "white" },
	jwt: { color: "000000", logo: "json-web-tokens", logoColor: "white" },
	kafka: { color: "231F20", logo: "apachekafka", logoColor: "white" },
	karma: { color: "429F87", logo: "karma", logoColor: "white" },
	kibana: { color: "005571", logo: "kibana", logoColor: "white" },
	kotlin: { color: "0095D5", logo: "kotlin", logoColor: "white" },
	kubernetes: { color: "326CE5", logo: "kubernetes", logoColor: "white" },
	laravel: { color: "FF2D20", logo: "laravel", logoColor: "white" },
	less: { color: "1D365D", logo: "less", logoColor: "white" },
	linux: { color: "FCC624", logo: "linux", logoColor: "black" },
	liquibase: { color: "2962FF", logo: "liquibase", logoColor: "white" },
	lodash: { color: "3492FF", logo: "lodash", logoColor: "white" },
	logstash: { color: "005571", logo: "logstash", logoColor: "white" },
	macos: { color: "000000", logo: "apple", logoColor: "white" },
	material: { color: "757575", logo: "material-design", logoColor: "white" },
	materialui: { color: "0081CB", logo: "mui", logoColor: "white" },
	maven: { color: "C71A36", logo: "apachemaven", logoColor: "white" },
	mobx: { color: "FF9955", logo: "mobx", logoColor: "white" },
	mocha: { color: "8D6748", logo: "mocha", logoColor: "white" },
	mongodb: { color: "47A248", logo: "mongodb", logoColor: "white" },
	mongoose: { color: "880000", logo: "mongoose", logoColor: "white" },
	mqtt: { color: "660066", logo: "mqtt", logoColor: "white" },
	mysql: { color: "4479A1", logo: "mysql", logoColor: "white" },
	nestjs: { color: "E0234E", logo: "nestjs", logoColor: "white" },
	netlify: { color: "00C7B7", logo: "netlify", logoColor: "white" },
	"next.js": { color: "000000", logo: "next.js", logoColor: "white" },
	nginx: { color: "009639", logo: "nginx", logoColor: "white" },
	node: { color: "339933", logo: "Node.js", logoColor: "white" },
	nodemon: { color: "76D04B", logo: "nodemon", logoColor: "white" },
	npm: { color: "CB3837", logo: "npm", logoColor: "white" },
	oauth: { color: "000000", logo: "oauth", logoColor: "white" },
	opera: { color: "FF1B2D", logo: "opera", logoColor: "white" },
	passport: { color: "34E27A", logo: "passport", logoColor: "white" },
	perl: { color: "39457E", logo: "perl", logoColor: "white" },
	php: { color: "777BB4", logo: "php", logoColor: "white" },
	playwright: { color: "2EAD33", logo: "playwright", logoColor: "white" },
	pm2: { color: "2B037A", logo: "pm2", logoColor: "white" },
	pnpm: { color: "F69220", logo: "pnpm", logoColor: "white" },
	postgresql: { color: "336791", logo: "postgresql", logoColor: "white" },
	postman: { color: "FF6C37", logo: "postman", logoColor: "white" },
	powershell: { color: "5391FE", logo: "powershell", logoColor: "white" },
	prettier: { color: "F7B93E", logo: "prettier", logoColor: "black" },
	prisma: { color: "2D3748", logo: "prisma", logoColor: "white" },
	prometheus: { color: "E6522C", logo: "prometheus", logoColor: "white" },
	puppeteer: { color: "40B5A4", logo: "puppeteer", logoColor: "white" },
	python: { color: "3776AB", logo: "python", logoColor: "white" },
	rabbitmq: { color: "FF6600", logo: "rabbitmq", logoColor: "white" },
	rails: { color: "CC0000", logo: "rubyonrails", logoColor: "white" },
	react: { color: "61DAFB", logo: "react", logoColor: "black" },
	"react native": { color: "61DAFB", logo: "react", logoColor: "black" },
	recoil: { color: "3578E5", logo: "recoil", logoColor: "white" },
	"red hat": { color: "EE0000", logo: "redhat", logoColor: "white" },
	redis: { color: "DC382D", logo: "redis", logoColor: "white" },
	redux: { color: "764ABC", logo: "redux", logoColor: "white" },
	redux_saga: { color: "999999", logo: "redux-saga", logoColor: "white" },
	rollup: { color: "EC4A3F", logo: "rollup.js", logoColor: "white" },
	ruby: { color: "CC342D", logo: "ruby", logoColor: "white" },
	rust: { color: "000000", logo: "rust", logoColor: "white" },
	safari: { color: "000000", logo: "safari", logoColor: "white" },
	sass: { color: "CC6699", logo: "sass", logoColor: "white" },
	scala: { color: "DC322F", logo: "scala", logoColor: "white" },
	selenium: { color: "43B02A", logo: "selenium", logoColor: "white" },
	sentry: { color: "362D59", logo: "sentry", logoColor: "white" },
	sequelize: { color: "52B0E7", logo: "sequelize", logoColor: "white" },
	socketio: { color: "010101", logo: "socket.io", logoColor: "white" },
	sonarcloud: { color: "4E9BCD", logo: "sonarcloud", logoColor: "white" },
	sphinx: { color: "000000", logo: "sphinx", logoColor: "white" },
	spring: { color: "6DB33F", logo: "spring", logoColor: "white" },
	sqlite: { color: "003B57", logo: "sqlite", logoColor: "white" },
	storybook: { color: "FF4785", logo: "storybook", logoColor: "white" },
	storybook_testing: { color: "FF4785", logo: "storybook", logoColor: "white" },
	stylelint: { color: "263238", logo: "stylelint", logoColor: "white" },
	svelte: { color: "FF3E00", logo: "svelte", logoColor: "white" },
	swagger: { color: "85EA2D", logo: "swagger", logoColor: "black" },
	swift: { color: "FA7343", logo: "swift", logoColor: "white" },
	tailwindcss: { color: "38B2AC", logo: "tailwindcss", logoColor: "white" },
	terraform: { color: "7B42BC", logo: "terraform", logoColor: "white" },
	travis: { color: "3EAAAF", logo: "travis", logoColor: "white" },
	tsc: { color: "3178C6", logo: "typescript", logoColor: "white" },
	typeorm: { color: "E83524", logo: "typeorm", logoColor: "white" },
	typescript: { color: "3178C6", logo: "typescript", logoColor: "white" },
	"typescript eslint": { color: "3178C6", logo: "typescript", logoColor: "white" },
	ubuntu: { color: "E95420", logo: "ubuntu", logoColor: "white" },
	unicorn: { color: "FF69B4", logo: "unicorn", logoColor: "white" },
	vagrant: { color: "1868F2", logo: "vagrant", logoColor: "white" },
	vercel: { color: "000000", logo: "vercel", logoColor: "white" },
	vim: { color: "019733", logo: "vim", logoColor: "white" },
	vite: { color: "646CFF", logo: "vite", logoColor: "white" },
	vitest: { color: "6E9F18", logo: "vitest", logoColor: "white" },
	vscode: { color: "007ACC", logo: "visual-studio-code", logoColor: "white" },
	vue: { color: "4FC08D", logo: "vue.js", logoColor: "white" },
	webpack: { color: "8DD6F9", logo: "webpack", logoColor: "black" },
	webpack_bundle_analyzer: { color: "8DD6F9", logo: "webpack", logoColor: "black" },
	"webpack-dev-server": { color: "8DD6F9", logo: "webpack", logoColor: "black" },
	webstorm: { color: "000000", logo: "webstorm", logoColor: "white" },
	windows: { color: "0078D6", logo: "windows", logoColor: "white" },
	xamarin: { color: "3498DB", logo: "xamarin", logoColor: "white" },
	yarn: { color: "2C8EBB", logo: "yarn", logoColor: "white" },
	zustand: { color: "000000", logo: "zustand", logoColor: "white" },
};
