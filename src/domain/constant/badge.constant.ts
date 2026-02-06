import type { Badge } from "../value-object/badge.value-object";

import { Badge as BadgeClass } from "../value-object/badge.value-object";

/**
 * Predefined library badges that should be included for all repositories
 */
export const PREDEFINED_LIB_BADGES: Array<Badge> = [
	// JavaScript/TypeScript ecosystem
	new BadgeClass("JavaScript", "F7DF1E", "javascript", "black"),
	new BadgeClass("TypeScript", "3178C6", "typescript", "white"),
	new BadgeClass("Node.js", "339933", "node.js", "white"),
	new BadgeClass("Deno", "000000", "deno", "white"),
	new BadgeClass("Bun", "000000", "bun", "white"),
	new BadgeClass("npm", "CB3837", "npm", "white"),

	// Build tools
	new BadgeClass("Webpack", "8DD6F9", "webpack", "black"),
	new BadgeClass("Vite", "646CFF", "vite", "white"),
	new BadgeClass("Rollup", "EC4A3F", "rollup", "white"),
	new BadgeClass("Parcel", "DFA658", "parcel", "black"),
	new BadgeClass("esbuild", "FFCF00", "esbuild", "black"),
	new BadgeClass("SWC", "FFFFFF", "swc", "black"),
	new BadgeClass("Babel", "F9DC3E", "babel", "black"),
	new BadgeClass("Turbopack", "000000", "turbopack", "white"),

	// Testing
	new BadgeClass("Jest", "C21325", "jest", "white"),
	new BadgeClass("Vitest", "6E9F18", "vitest", "white"),
	new BadgeClass("Mocha", "8D6748", "mocha", "white"),
	new BadgeClass("Cypress", "17202C", "cypress", "white"),
	new BadgeClass("Playwright", "2EAD33", "playwright", "white"),
	new BadgeClass("Testing Library", "E33332", "testing-library", "white"),
	new BadgeClass("Puppeteer", "40B5A4", "puppeteer", "white"),

	// Linting/Formatting
	new BadgeClass("ESLint", "4B32C3", "eslint", "white"),
	new BadgeClass("Prettier", "F7B93E", "prettier", "black"),
	new BadgeClass("Biome", "60A5FA", "biome", "white"),
	new BadgeClass("StandardJS", "F3DF49", "standardjs", "black"),

	// Package managers
	new BadgeClass("Yarn", "2C8EBB", "yarn", "white"),
	new BadgeClass("pnpm", "F69220", "pnpm", "white"),

	// Version control
	new BadgeClass("Git", "F05032", "git", "white"),
	new BadgeClass("GitHub", "181717", "github", "white"),
	new BadgeClass("GitLab", "FC6D26", "gitlab", "white"),
	new BadgeClass("Bitbucket", "0052CC", "bitbucket", "white"),

	// CI/CD
	new BadgeClass("GitHub Actions", "2088FF", "github-actions", "white"),
	new BadgeClass("GitLab CI", "FC6D26", "gitlab", "white"),
	new BadgeClass("CircleCI", "343434", "circleci", "white"),
	new BadgeClass("Travis CI", "3EAAAF", "travis-ci", "white"),
	new BadgeClass("Jenkins", "D24939", "jenkins", "white"),
	new BadgeClass("Vercel", "000000", "vercel", "white"),
	new BadgeClass("Netlify", "00C7B7", "netlify", "white"),
	new BadgeClass("Heroku", "430098", "heroku", "white"),
	new BadgeClass("Railway", "0B0D0E", "railway", "white"),
	new BadgeClass("Render", "46E3B7", "render", "white"),

	// Containerization & Orchestration
	new BadgeClass("Docker", "2496ED", "docker", "white"),
	new BadgeClass("Kubernetes", "326CE5", "kubernetes", "white"),
	new BadgeClass("Podman", "892CA0", "podman", "white"),

	// Databases
	new BadgeClass("PostgreSQL", "4169E1", "postgresql", "white"),
	new BadgeClass("MySQL", "4479A1", "mysql", "white"),
	new BadgeClass("MongoDB", "47A248", "mongodb", "white"),
	new BadgeClass("Redis", "DC382D", "redis", "white"),
	new BadgeClass("SQLite", "003B57", "sqlite", "white"),
	new BadgeClass("MariaDB", "003545", "mariadb", "white"),
	new BadgeClass("Supabase", "3ECF8E", "supabase", "white"),
	new BadgeClass("PlanetScale", "000000", "planetscale", "white"),
	new BadgeClass("Prisma", "2D3748", "prisma", "white"),
	new BadgeClass("Drizzle", "C5F74F", "drizzle", "black"),

	// Frontend Frameworks
	new BadgeClass("React", "61DAFB", "react", "black"),
	new BadgeClass("Vue.js", "4FC08D", "vue.js", "white"),
	new BadgeClass("Angular", "DD0031", "angular", "white"),
	new BadgeClass("Svelte", "FF3E00", "svelte", "white"),
	new BadgeClass("SvelteKit", "FF3E00", "svelte", "white"),
	new BadgeClass("Solid", "2C4F7C", "solid", "white"),
	new BadgeClass("Preact", "673AB8", "preact", "white"),
	new BadgeClass("Lit", "324FFF", "lit", "white"),
	new BadgeClass("Alpine.js", "77C1D2", "alpine.js", "black"),
	new BadgeClass("Astro", "FF5A03", "astro", "white"),
	new BadgeClass("Qwik", "18B6F6", "qwik", "white"),
	new BadgeClass("Ember", "E04E39", "ember", "white"),
	new BadgeClass("Stimulus", "77E8B9", "stimulus", "black"),
	new BadgeClass("Marko", "003E7E", "marko", "white"),

	// Meta-frameworks
	new BadgeClass("Next.js", "000000", "next.js", "white"),
	new BadgeClass("Nuxt.js", "00DC82", "nuxt.js", "white"),
	new BadgeClass("Gatsby", "663399", "gatsby", "white"),
	new BadgeClass("Remix", "000000", "remix", "white"),
	new BadgeClass("Expo", "000020", "expo", "white"),
	new BadgeClass("Blitz.js", "6700EB", "blitz.js", "white"),
	new BadgeClass("Redwood", "BF4722", "redwood", "white"),
	new BadgeClass("Fresh", "FFDB58", "fresh", "black"),
	new BadgeClass("Analog", "F73154", "angular", "white"),

	// Backend Frameworks
	new BadgeClass("Express", "000000", "express", "white"),
	new BadgeClass("Fastify", "000000", "fastify", "white"),
	new BadgeClass("NestJS", "E0234E", "nestjs", "white"),
	new BadgeClass("Koa", "33333D", "koa", "white"),
	new BadgeClass("Hapi", "77B829", "hapi", "white"),
	new BadgeClass("AdonisJS", "220052", "adonisjs", "white"),
	new BadgeClass("Strapi", "2863FF", "strapi", "white"),
	new BadgeClass("Directus", "64F", "directus", "white"),
	new BadgeClass("Hono", "E36002", "hono", "white"),
	new BadgeClass("Sails.js", "14ACC2", "sails.js", "white"),
	new BadgeClass("LoopBack", "3F5DFF", "loopback", "white"),
	new BadgeClass("Feathers", "333", "feathersjs", "white"),
	new BadgeClass("Meteor", "DE4F4F", "meteor", "white"),

	// State Management
	new BadgeClass("Redux", "764ABC", "redux", "white"),
	new BadgeClass("MobX", "FF9955", "mobx", "white"),
	new BadgeClass("Zustand", "433E38", "zustand", "white"),
	new BadgeClass("Recoil", "3578E5", "recoil", "white"),
	new BadgeClass("Jotai", "000000", "jotai", "white"),
	new BadgeClass("Valtio", "000000", "valtio", "white"),
	new BadgeClass("XState", "2C3E50", "xstate", "white"),
	new BadgeClass("Pinia", "FFD859", "pinia", "black"),
	new BadgeClass("Effector", "E85D00", "effector", "white"),
	new BadgeClass("Immer", "00E7C3", "immer", "black"),

	// CSS & Styling
	new BadgeClass("CSS3", "1572B6", "css3", "white"),
	new BadgeClass("Sass", "CC6699", "sass", "white"),
	new BadgeClass("Less", "1D365D", "less", "white"),
	new BadgeClass("PostCSS", "DD3A0A", "postcss", "white"),
	new BadgeClass("Tailwind CSS", "06B6D4", "tailwind-css", "white"),
	new BadgeClass("Bootstrap", "7952B3", "bootstrap", "white"),
	new BadgeClass("Material UI", "007FFF", "mui", "white"),
	new BadgeClass("Ant Design", "0170FE", "ant-design", "white"),
	new BadgeClass("Chakra UI", "319795", "chakra-ui", "white"),
	new BadgeClass("Styled Components", "DB7093", "styled-components", "white"),
	new BadgeClass("Emotion", "C43BAD", "emotion", "white"),
	new BadgeClass("Mantine", "339AF0", "mantine", "white"),
	new BadgeClass("Radix UI", "161618", "radix-ui", "white"),
	new BadgeClass("shadcn/ui", "000000", "shadcn/ui", "white"),
	new BadgeClass("DaisyUI", "5A0EF8", "daisyui", "white"),
	new BadgeClass("Bulma", "00D1B2", "bulma", "white"),

	// JavaScript Libraries
	new BadgeClass("jQuery", "0769AD", "jquery", "white"),
	new BadgeClass("Lodash", "3492FF", "lodash", "white"),
	new BadgeClass("Underscore.js", "0371B5", "underscore.js", "white"),
	new BadgeClass("Ramda", "884499", "ramda", "white"),
	new BadgeClass("RxJS", "B7178C", "rxjs", "white"),
	new BadgeClass("Moment.js", "000000", "moment", "white"),
	new BadgeClass("Day.js", "FF5F4C", "dayjs", "white"),
	new BadgeClass("date-fns", "770C56", "datefns", "white"),
	new BadgeClass("Luxon", "00D4AA", "luxon", "black"),
	new BadgeClass("Axios", "5A29E4", "axios", "white"),
	new BadgeClass("Framer Motion", "0055FF", "framer", "white"),
	new BadgeClass("GSAP", "88CE02", "greensock", "black"),
	new BadgeClass("Anime.js", "252423", "anime", "white"),
	new BadgeClass("Lottie", "007AFF", "lottie", "white"),
	new BadgeClass("P5.js", "ED225D", "p5.js", "white"),

	// Form & Validation Libraries
	new BadgeClass("React Hook Form", "EC5990", "reacthookform", "white"),
	new BadgeClass("Formik", "172B4D", "formik", "white"),
	new BadgeClass("Yup", "1A1A1A", "yup", "white"),
	new BadgeClass("Zod", "283339", "zod", "white"),
	new BadgeClass("Joi", "0080FF", "joi", "white"),
	new BadgeClass("VeeValidate", "4FC08D", "vue.js", "white"),
	new BadgeClass("Vuelidate", "34495E", "vue.js", "white"),
	new BadgeClass("React Final Form", "CA4245", "react", "white"),

	// Data Fetching & API
	new BadgeClass("TanStack Query", "FF4154", "reactquery", "white"),
	new BadgeClass("TanStack Router", "FF4154", "reactquery", "white"),
	new BadgeClass("SWR", "000000", "swr", "white"),
	new BadgeClass("Apollo Client", "311C87", "apollographql", "white"),
	new BadgeClass("Relay", "F26B00", "relay", "white"),
	new BadgeClass("tRPC", "2596BE", "trpc", "white"),
	new BadgeClass("Ky", "7B42BC", "ky", "white"),
	new BadgeClass("Got", "00ADD8", "got", "white"),

	// Languages
	new BadgeClass("Python", "3776AB", "python", "white"),
	new BadgeClass("Go", "00ADD8", "go", "white"),
	new BadgeClass("Rust", "000000", "rust", "white"),
	new BadgeClass("Java", "007396", "java", "white"),
	new BadgeClass("Kotlin", "7F52FF", "kotlin", "white"),
	new BadgeClass("C", "A8B9CC", "c", "black"),
	new BadgeClass("C++", "00599C", "c%2B%2B", "white"),
	new BadgeClass("C#", "239120", "c-sharp", "white"),
	new BadgeClass("PHP", "777BB4", "php", "white"),
	new BadgeClass("Ruby", "CC342D", "ruby", "white"),
	new BadgeClass("Swift", "FA7343", "swift", "white"),
	new BadgeClass("Dart", "0175C2", "dart", "white"),
	new BadgeClass("Elixir", "4B275F", "elixir", "white"),
	new BadgeClass("Scala", "DC322F", "scala", "white"),
	new BadgeClass("Clojure", "5881D8", "clojure", "white"),
	new BadgeClass("Haskell", "5D4F85", "haskell", "white"),
	new BadgeClass("Lua", "2C2D72", "lua", "white"),
	new BadgeClass("R", "276DC3", "r", "white"),
	new BadgeClass("Julia", "9558B2", "julia", "white"),
	new BadgeClass("Zig", "F7A41D", "zig", "black"),

	// Cloud providers
	new BadgeClass("AWS", "232F3E", "amazon-aws", "white"),
	new BadgeClass("Google Cloud", "4285F4", "google-cloud", "white"),
	new BadgeClass("Azure", "0078D4", "microsoft-azure", "white"),
	new BadgeClass("DigitalOcean", "0080FF", "digitalocean", "white"),
	new BadgeClass("Linode", "00A95C", "linode", "white"),
	new BadgeClass("Cloudflare", "F38020", "cloudflare", "white"),

	// API & Backend Tools
	new BadgeClass("GraphQL", "E10098", "graphql", "white"),
	new BadgeClass("REST API", "009688", "rest", "white"),
	new BadgeClass("tRPC", "2596BE", "trpc", "white"),
	new BadgeClass("Apollo GraphQL", "311C87", "apollo-graphql", "white"),
	new BadgeClass("Socket.io", "010101", "socket.io", "white"),
	new BadgeClass("WebRTC", "333333", "webrtc", "white"),
	new BadgeClass("gRPC", "244C5A", "grpc", "white"),
	new BadgeClass("OpenAPI", "6BA539", "openapi", "white"),
	new BadgeClass("Swagger", "85EA2D", "swagger", "black"),
	new BadgeClass("Postman", "FF6C37", "postman", "white"),
	new BadgeClass("Insomnia", "4000BF", "insomnia", "white"),

	// Authentication
	new BadgeClass("Auth0", "EB5424", "auth0", "white"),
	new BadgeClass("Firebase", "FFCA28", "firebase", "black"),
	new BadgeClass("Supabase Auth", "3ECF8E", "supabase", "white"),
	new BadgeClass("OAuth", "4285F4", "oauth", "white"),
	new BadgeClass("JWT", "000000", "json-web-tokens", "white"),

	// Monitoring & Analytics
	new BadgeClass("Google Analytics", "E37400", "google-analytics", "white"),
	new BadgeClass("Sentry", "362D59", "sentry", "white"),
	new BadgeClass("Datadog", "632CA6", "datadog", "white"),
	new BadgeClass("New Relic", "008C99", "new-relic", "white"),
	new BadgeClass("Grafana", "F46800", "grafana", "white"),
	new BadgeClass("Prometheus", "E6522C", "prometheus", "white"),
	new BadgeClass("LogRocket", "764ABC", "logrocket", "white"),

	// Mobile Development
	new BadgeClass("React Native", "61DAFB", "react", "black"),
	new BadgeClass("Flutter", "02569B", "flutter", "white"),
	new BadgeClass("Ionic", "3880FF", "ionic", "white"),
	new BadgeClass("Capacitor", "119EFF", "capacitor", "white"),
	new BadgeClass("NativeScript", "3655FF", "nativescript", "white"),
	new BadgeClass("Expo", "000020", "expo", "white"),

	// Game Development
	new BadgeClass("Unity", "000000", "unity", "white"),
	new BadgeClass("Unreal Engine", "0E1128", "unreal-engine", "white"),
	new BadgeClass("Godot", "478CBF", "godot-engine", "white"),
	new BadgeClass("Phaser", "3C91E6", "phaser", "white"),

	// AI/ML
	new BadgeClass("TensorFlow", "FF6F00", "tensorflow", "white"),
	new BadgeClass("PyTorch", "EE4C2C", "pytorch", "white"),
	new BadgeClass("scikit-learn", "F7931E", "scikit-learn", "white"),
	new BadgeClass("Keras", "D00000", "keras", "white"),
	new BadgeClass("OpenAI", "412991", "openai", "white"),
	new BadgeClass("Hugging Face", "FFD21E", "huggingface", "black"),
	new BadgeClass("LangChain", "000000", "langchain", "white"),

	// Blockchain
	new BadgeClass("Ethereum", "3C3C3D", "ethereum", "white"),
	new BadgeClass("Solidity", "363636", "solidity", "white"),
	new BadgeClass("Web3.js", "F16822", "web3.js", "white"),
	new BadgeClass("Hardhat", "FFF100", "hardhat", "black"),

	// Documentation
	new BadgeClass("Markdown", "000000", "markdown", "white"),
	new BadgeClass("MDX", "1B1F24", "mdx", "white"),
	new BadgeClass("Docusaurus", "3ECC5F", "docusaurus", "white"),
	new BadgeClass("VitePress", "646CFF", "vitepress", "white"),
	new BadgeClass("Storybook", "FF4785", "storybook", "white"),
	new BadgeClass("Swagger", "85EA2D", "swagger", "black"),

	// Other tools
	new BadgeClass("JSON", "000000", "json", "white"),
	new BadgeClass("YAML", "CB171E", "yaml", "white"),
	new BadgeClass("XML", "0060AC", "xml", "white"),
	new BadgeClass("Nginx", "009639", "nginx", "white"),
	new BadgeClass("Apache", "D22128", "apache", "white"),
	new BadgeClass("Electron", "47848F", "electron", "white"),
	new BadgeClass("Tauri", "FFC131", "tauri", "black"),
	new BadgeClass("PWA", "5A0FC8", "pwa", "white"),
	new BadgeClass("WebAssembly", "654FF0", "webassembly", "white"),
	new BadgeClass("Three.js", "000000", "three.js", "white"),
	new BadgeClass("D3.js", "F68E56", "d3.js", "white"),
	new BadgeClass("Chart.js", "FF6384", "chart.js", "white"),
	new BadgeClass("Leaflet", "199900", "leaflet", "white"),
	new BadgeClass("Mapbox", "000000", "mapbox", "white"),
];
