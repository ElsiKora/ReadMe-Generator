#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import cliProgress from 'cli-progress';
import { spinner, select, isCancel, cancel, text } from '@clack/prompts';
import { exec } from 'node:child_process';
import os from 'node:os';
import { promisify } from 'node:util';
import axios from 'axios';
import { rimrafSync } from 'rimraf';
import { glob } from 'glob';

var EAIProvider;
(function (EAIProvider) {
    EAIProvider["ANTHROPIC"] = "anthropic";
    EAIProvider["OPENAI"] = "openai";
})(EAIProvider || (EAIProvider = {}));

const DEFAULT_LOGO_URL = "https://placehold.co/600x200/444/FFF?text=Project+Logo";
const DEFAULT_BADGES = [
    {
        color: "F7DF1E",
        logo: "javascript",
        logoColor: "black",
        name: "JavaScript",
    },
];
const ELSIKORA_BADGE = `<a aria-label="ElsiKora logo" href="https://elsikora.com">
  <img src="https://img.shields.io/badge/MADE%20BY%20ElsiKora-333333.svg?style=for-the-badge" alt="ElsiKora">
</a>`;
const SCANNER_CHAR_PER_TOKEN = 4;
const SCANNER_CODE_FILE_EXTENSIONS = [".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs"];
const SCANNER_INGNORED_DIRS = ["node_modules", ".git", "dist", "build", "coverage", ".next", ".nuxt"];
const SCANNER_TOKEN_LIMIT = 100_000;
const LANGUAGE_CHOICES = [
    { name: "English", value: "en" },
    { name: "Spanish", value: "es" },
    { name: "French", value: "fr" },
    { name: "German", value: "de" },
    { name: "Russian", value: "ru" },
];
const PROVIDER_CHOICES = [
    { name: "OpenAI", value: EAIProvider.OPENAI },
    { name: "Anthropic", value: EAIProvider.ANTHROPIC },
];
const REPO_MODE_CHOICES = [
    { name: "Local path", value: "local" },
    { name: "GitHub (owner/repo)", value: "remote" },
];
const DEFAULT_SCAN_DEPTH = "4";
const DEFAULT_OUTPUT_FILE = "README.md";
const DEFAULT_LOCAL_PATH = ".";
const PREDEFINED_LIB_BADGES = {
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

async function showProgressBar(text, duration = 1000) {
    console.log(chalk.blue(text));
    const bar = new cliProgress.SingleBar({
        barCompleteChar: "#",
        barIncompleteChar: "-",
        format: "Progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
        // eslint-disable-next-line @elsikora-typescript/naming-convention
        hideCursor: true,
    }, cliProgress.Presets.shades_classic);
    bar.start(100, 0);
    for (let index = 0; index <= 100; index++) {
        // eslint-disable-next-line no-await-in-loop,@elsikora-typescript/no-redundant-type-constituents
        await new Promise((resolve) => {
            setTimeout(resolve, duration / 100);
        });
        bar.update(index);
    }
    bar.stop();
    console.log(chalk.green("Progress completed!\n"));
}

function startSpinner(text = "Processing...") {
    const s = spinner();
    s.start(text);
    return {
        stop: (message) => {
            s.stop(message);
        },
    };
}
function stopSpinner(spinnerInstance, text = "Done", isSuccess = true) {
    if (!spinnerInstance)
        return;
    spinnerInstance.stop(isSuccess ? `✓ ${text}` : `✕ ${text}`);
}

class AIService {
    ANTHROPIC;
    OPENAI;
    constructor(apiKey) {
        this.ANTHROPIC = new Anthropic({ apiKey });
        this.OPENAI = new OpenAI({
            apiKey,
        });
    }
    async generateReadme({ doneFromChangelog, lang = "en", model, projectContext, provider, repoInfo }) {
        const spinner = startSpinner("Generating README...");
        try {
            let licenseContent = "";
            const licensePaths = ["LICENSE", "LICENSE.md", "license", "license.md"];
            for (const licensePath of licensePaths) {
                try {
                    // eslint-disable-next-line no-await-in-loop
                    const content = await fs.promises.readFile(licensePath, "utf8");
                    licenseContent = content;
                    break;
                }
                catch {
                    continue;
                }
            }
            const promptContent = this.buildPrompt(repoInfo, lang, projectContext) + (licenseContent ? `\n\nLICENSE file contents:\n${licenseContent}` : "");
            let rawContent = "";
            if (provider === EAIProvider.ANTHROPIC) {
                const response = await this.ANTHROPIC.messages.create({
                    max_tokens: 8192,
                    messages: [
                        {
                            content: promptContent,
                            role: "user",
                        },
                    ],
                    model,
                });
                rawContent = "text" in response.content[0] ? response.content[0]?.text : "";
            }
            else {
                const response = await this.OPENAI.chat.completions.create({
                    messages: [{ content: promptContent, role: "user" }],
                    model,
                    response_format: { type: "json_object" },
                });
                rawContent = response.choices?.[0]?.message?.content || "";
            }
            stopSpinner(spinner, "Raw README data received");
            await showProgressBar("Parsing generated JSON...");
            const parsedData = this.parseResponse(rawContent, repoInfo.name);
            return this.buildFinalReadme(parsedData, doneFromChangelog);
        }
        catch (error) {
            stopSpinner(spinner, "Failed to generate README", false);
            throw error;
        }
    }
    applyPredefinedBadgeColors(badges) {
        for (let b of badges) {
            const normalizedName = b.name.toLowerCase();
            if (PREDEFINED_LIB_BADGES[normalizedName]) {
                // eslint-disable-next-line @elsikora-sonar/no-dead-store,@elsikora-sonar/updated-loop-counter
                b = {
                    ...b,
                    ...PREDEFINED_LIB_BADGES[normalizedName],
                };
            }
        }
    }
    beautifyRoadmap(roadmapText, doneFromChangelog, features) {
        let lines = roadmapText
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
        const hasAnyDone = lines.some((line) => /$begin:math:text$done$end:math:text$|$begin:math:display$done$end:math:display$|$begin:math:text$complete$end:math:text$|$begin:math:display$complete$end:math:display$/i.test(line));
        if (lines.length === 0 || (!hasAnyDone && doneFromChangelog.length === 0)) {
            const doneFeatures = features.slice(0, 3).map((f) => `(done) ${f}`);
            if (doneFeatures.length === 0) {
                doneFeatures.push("(done) Initial Setup", "(done) Basic Functionality");
            }
            lines = [...lines, ...doneFeatures];
        }
        if (!roadmapText.trim() && doneFromChangelog.length === 0 && lines.length === 0) {
            return "No roadmap provided.";
        }
        const tableHeader = `| Task / Feature | Status |\n|---------------|--------|\n`;
        const tableRows = [];
        for (const line of lines) {
            const isDone = /$begin:math:text$done$end:math:text$|$begin:math:display$done$end:math:display$|$begin:math:text$complete$end:math:text$|$begin:math:display$complete$end:math:display$/i.test(line);
            const cleanLine = line.replace(/$begin:math:text$done$end:math:text$|$begin:math:display$done$end:math:display$|$begin:math:text$complete$end:math:text$|$begin:math:display$complete$end:math:display$/i, "").trim();
            const status = isDone ? "✅ Done" : "🚧 In Progress";
            tableRows.push(`| ${cleanLine} | ${status} |`);
        }
        if (doneFromChangelog.length > 0) {
            tableRows.push(`| **Completed tasks from CHANGELOG:** |  |`);
            for (const task of doneFromChangelog) {
                tableRows.push(`| ${task} | ✅ Done |`);
            }
        }
        return tableHeader + tableRows.join("\n");
    }
    buildFinalReadme(parsedData, doneFromChangelog) {
        parsedData.logoUrl = parsedData.logoUrl || DEFAULT_LOGO_URL;
        if (!Array.isArray(parsedData.badges) || parsedData.badges.length === 0) {
            parsedData.badges = DEFAULT_BADGES;
        }
        else {
            this.applyPredefinedBadgeColors(parsedData.badges);
        }
        const otherBadges = parsedData.badges
            .map((badge) => {
            const badgeUrl = `https://img.shields.io/badge/${encodeURIComponent(badge.name)}-${badge.color}.svg?style=for-the-badge&logo=${badge.logo}&logoColor=${badge.logoColor}`;
            return `<img src="${badgeUrl}" alt="${badge.name}">`;
        })
            .join(" ");
        const cleanInstallation = this.cleanCodeBlock(parsedData.installation);
        const cleanUsage = parsedData.usage.trim();
        const beautifiedRoadmap = this.beautifyRoadmap(parsedData.roadmap, doneFromChangelog, parsedData.features);
        const tableOfContents = `
## 📚 Table of Contents
- [Description](#-description)
- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Roadmap](#-roadmap)
- [FAQ](#-faq)
- [License](#-license)
`;
        const prettyFeatures = parsedData.features.map((f) => `- ✨ **${f}**`).join("\n");
        const readme = `<p align="center">
  <img src="${parsedData.logoUrl}" width="500" alt="project-logo">
</p>

<h1 align="center">${parsedData.title}</h1>
<p align="center"><em>${parsedData.short_description}</em></p>

<p align="center">
    ${ELSIKORA_BADGE} ${otherBadges}
</p>

${tableOfContents}

## 📖 Description
${parsedData.long_description}

## 🚀 Features
${prettyFeatures}

## 🛠 Installation
\`\`\`bash
${cleanInstallation}
\`\`\`

## 💡 Usage
${cleanUsage}

## 🛣 Roadmap
${beautifiedRoadmap}

## ❓ FAQ
${parsedData.faq}

## 🔒 License
This project is licensed under **${parsedData.license}**.`;
        return { ...parsedData, readme };
    }
    buildPrompt(repoInfo, lang = "en", projectContext = "") {
        const languageInstructions = {
            de: "Erstellen Sie die README auf Deutsch.",
            en: "Generate the README in English.",
            es: "Genera el README en español.",
            fr: "Générez le README en français.",
            ru: "Создайте README на русском языке.",
        };
        const usageExtraInstructions = `
**Important**: In the "usage" field of the JSON, provide a rich, detailed usage section with:
- Multiple subsections (e.g. "CLI Usage", "Usage with TypeScript", "Usage with Prettier", etc.)
- Multiple code blocks (at least a few, each with the appropriate \`\`\`language\`\`\`)
- Explanations and step-by-step instructions
- If the project provides a CLI, show how to run it with "npx <package> init" or other relevant commands
- Provide some advanced or extended use cases if possible
`;
        // @ts-ignore
        // eslint-disable-next-line @elsikora-typescript/restrict-template-expressions
        return `You are a creative technical writer tasked with generating an engaging README for a software project. Based on the following details, generate a complete README structure in JSON format with imaginative and compelling content. ${languageInstructions[lang] || languageInstructions.en}

Project information:
- name: "${repoInfo.name}"
- description: "${repoInfo.description}"
- codeStats: "${repoInfo.codeStats}"

${projectContext ? `Additional Project Context:\n${projectContext}\n` : ""}

${usageExtraInstructions}

Create an engaging narrative around this project. Infer the project's purpose, potential applications, and target audience from the available information. Generate creative features, clear installation steps, and practical usage examples.

For the logo, if possible, suggest a thematic image URL that represents the project well. If you can suggest a specific relevant image, include its URL in the logoUrl field. Otherwise, use the default placeholder.

The title should be the project name, optionally with an emoji but without any separator characters. The subtitle should be provided in the short_description field and will be displayed below the title.

The JSON must follow this structure:
{
 "title": string,             // Project name, can include emoji but no separators
  "short_description": string, // Subtitle/tagline to be shown below title
  "long_description": string,  // Detailed overview with real-world use cases
  "logoUrl": string,           // Suggest a thematic image URL or leave empty for default. Only provide existing image or just send empty string.
  "badges": [                  // Relevant tech stack badges, return as many as you can provide from package.json and that ones that will be good with shields.io
    {
      "name": string,
      "color": string,
      "logo": string,
      "logoColor": string
    }
  ],
  "features": string[],        // List of compelling features with benefits
  "installation": string,      // Clear step-by-step instructions
  "usage": string,             // Detailed usage with multiple code examples, sub-sections, CLI usage, etc.
  "screenshots": [],           // Array of screenshot URLs if available
  "roadmap": string,           // Future development possibilities
  "faq": string,               // Anticipated user questions and answers
  "license": string            // License information from LICENSE file
}

ONLY JSON OBJECT IN RESPONSE WITH NO ANY ADDITIONAL TEXT. NO MARKDOWN, NO ANY OTHER COMMENTS.`.trim();
    }
    cleanCodeBlock(text) {
        if (!text)
            return "";
        return text
            .replaceAll(/^```bash\n/g, "")
            .replaceAll(/\n```$/g, "")
            .replaceAll("```bash", "")
            .replaceAll("```", "")
            .trim();
    }
    parseResponse(rawContent, fallbackName) {
        console.log("RESPONSE", rawContent);
        try {
            // eslint-disable-next-line @elsikora-typescript/no-unsafe-return
            return JSON.parse(rawContent);
        }
        catch {
            console.log(chalk.yellow("Warning: JSON parse failed. Using fallback structure."));
            return {
                badges: [],
                changelog: "",
                faq: "",
                features: [],
                folder_structure: "",
                installation: "",
                license: "MIT",
                logoUrl: "",
                long_description: "No data from model. Provide an overview here.",
                roadmap: "",
                screenshots: [],
                short_description: "",
                title: fallbackName.toUpperCase(),
                usage: "",
            };
        }
    }
}

class LocalService {
    getRepoInfo(localRepoPath) {
        const absPath = path.resolve(localRepoPath);
        const repoName = path.basename(absPath);
        const packageJsonPath = path.join(absPath, "package.json");
        const projectInfo = this.parsePackageJson(packageJsonPath);
        const fileStats = this.analyzeFiles(absPath);
        return {
            author: projectInfo.author,
            codeStats: `deps: ${String(projectInfo.depsCount)}, devDeps: ${String(projectInfo.devDepsCount)};\n${fileStats}`,
            description: projectInfo.description,
            name: projectInfo.version ? `${repoName} ${projectInfo.version}` : repoName,
        };
    }
    analyzeFiles(absPath) {
        const files = glob.sync(`${absPath}/**/*.{js,ts,jsx,tsx}`, {
            ignore: ["**/node_modules/**", "**/.git/**"],
        });
        const fileCounts = {};
        for (const file of files) {
            const extension = path.extname(file).replace(".", "");
            fileCounts[extension] = (fileCounts[extension] || 0) + 1;
        }
        const totalFiles = files.length;
        if (totalFiles === 0)
            return "No JS/TS/JSX/TSX files found";
        const stats = Object.entries(fileCounts)
            .map(([extension, count]) => {
            const percent = ((count / totalFiles) * 100).toFixed(1);
            return `${extension.toUpperCase()}: ${percent}%`;
        })
            .join(", ");
        return `${stats} (total: ${totalFiles} files)`;
    }
    parsePackageJson(packageJsonPath) {
        const defaultInfo = {
            author: "",
            depsCount: 0,
            description: "",
            devDepsCount: 0,
            version: "",
        };
        if (!fs.existsSync(packageJsonPath))
            return defaultInfo;
        try {
            const packageData = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
            return {
                // eslint-disable-next-line @elsikora-typescript/no-unsafe-assignment,@elsikora-typescript/no-unsafe-member-access
                author: packageData.author || "",
                // eslint-disable-next-line @elsikora-typescript/no-unsafe-member-access,@elsikora-typescript/no-unsafe-argument
                depsCount: packageData.dependencies ? Object.keys(packageData.dependencies).length : 0,
                // eslint-disable-next-line @elsikora-typescript/no-unsafe-assignment,@elsikora-typescript/no-unsafe-member-access
                description: packageData.description || "",
                // eslint-disable-next-line @elsikora-typescript/no-unsafe-member-access,@elsikora-typescript/no-unsafe-argument
                devDepsCount: packageData.devDependencies ? Object.keys(packageData.devDependencies).length : 0,
                // eslint-disable-next-line @elsikora-typescript/no-unsafe-member-access,@elsikora-typescript/restrict-template-expressions
                version: packageData.version ? `v${packageData.version}` : "",
            };
        }
        catch {
            console.error(chalk.yellow("Warning: Failed to parse package.json"));
            return defaultInfo;
        }
    }
}

// @ts-ignore
const execAsync = promisify(exec);
class GithubService {
    // eslint-disable-next-line @elsikora-typescript/naming-convention
    tempBaseDir;
    constructor() {
        this.tempBaseDir = path.join(os.tmpdir(), "readme-generator");
        if (!fs.existsSync(this.tempBaseDir)) {
            // eslint-disable-next-line @elsikora-typescript/naming-convention
            fs.mkdirSync(this.tempBaseDir, { recursive: true });
        }
    }
    cleanup(repoInfo) {
        if (repoInfo.tempDir && fs.existsSync(repoInfo.tempDir)) {
            const spinner = startSpinner("Cleaning up temporary files...");
            try {
                rimrafSync(repoInfo.tempDir);
                stopSpinner(spinner, "Cleanup completed");
            }
            catch {
                stopSpinner(spinner, "Cleanup failed", false);
                console.warn("Failed to remove temporary directory:", repoInfo.tempDir);
            }
        }
    }
    async getRepoInfo(repoPath) {
        const [owner, repoName] = repoPath.split("/");
        const spinner = startSpinner(`Fetching ${owner}/${repoName} repository data...`);
        try {
            // eslint-disable-next-line @elsikora-typescript/typedef
            const response = await axios.get(`https://api.github.com/repos/${owner}/${repoName}`, {
                headers: process.env.GITHUB_TOKEN
                    ? {
                        Authorization: `token ${process.env.GITHUB_TOKEN}`,
                    }
                    : undefined,
            });
            const temporaryDirectory = path.join(this.tempBaseDir, `${owner}-${repoName}-${Date.now()}`);
            stopSpinner(spinner, "GitHub data retrieved, cloning repository...");
            const cloneSpinner = startSpinner("Cloning repository...");
            const cloneUrl = process.env.GITHUB_TOKEN ? `https://${process.env.GITHUB_TOKEN}@github.com/${owner}/${repoName}.git` : `https://github.com/${owner}/${repoName}.git`;
            try {
                await execAsync(`git clone ${cloneUrl} ${temporaryDirectory}`);
                stopSpinner(cloneSpinner, "Repository cloned successfully");
                const localService = new LocalService();
                const localInfo = localService.getRepoInfo(temporaryDirectory);
                const combinedInfo = {
                    author: response.data.owner.login,
                    codeStats: localInfo.codeStats,
                    description: response.data.description || "",
                    name: response.data.name || `${owner}/${repoName}`,
                    tempDir: temporaryDirectory,
                };
                return combinedInfo;
            }
            catch {
                stopSpinner(cloneSpinner, "Failed to clone repository", false);
                console.warn("Falling back to basic GitHub info only");
                return {
                    author: response.data.owner.login,
                    codeStats: "Remote repo; basic info from GitHub only",
                    description: response.data.description || "",
                    name: response.data.name || `${owner}/${repoName}`,
                };
            }
        }
        catch (error) {
            stopSpinner(spinner, "Failed to fetch repository data", false);
            throw error;
        }
    }
}

var EAnthropicModel;
(function (EAnthropicModel) {
    EAnthropicModel["CLAUDE_3_7_SONNET"] = "claude-3-7-sonnet-latest";
    EAnthropicModel["CLAUDE_3_5_HAIKU"] = "claude-3-5-haiku-latest";
    EAnthropicModel["CLAUDE_3_5_SONNET"] = "claude-3-5-sonnet-latest";
    EAnthropicModel["CLAUDE_3_HAIKU"] = "claude-3-haiku";
    EAnthropicModel["CLAUDE_3_OPUS"] = "claude-3-opus";
})(EAnthropicModel || (EAnthropicModel = {}));

var EOpenAIModel;
(function (EOpenAIModel) {
    EOpenAIModel["GPT_4_5_PREVIEW"] = "gpt-4.5-preview";
    EOpenAIModel["GPT_4"] = "gpt-4";
    EOpenAIModel["GPT_4O"] = "gpt-4o";
    EOpenAIModel["GPT_4O_MINI"] = "gpt-4o-mini";
    EOpenAIModel["O1"] = "o1";
    EOpenAIModel["O1_MINI"] = "o1-mini";
    EOpenAIModel["O1_PREVIEW"] = "o1-preview";
    EOpenAIModel["O3_MINI_HIGH"] = "o3-mini-high";
    EOpenAIModel["O3_MINI_LOW"] = "o3-mini-low";
})(EOpenAIModel || (EOpenAIModel = {}));

async function promptForApiKey(provider) {
    const providerName = provider === EAIProvider.ANTHROPIC ? "Anthropic" : "OpenAI";
    const apiKey = await text({
        message: `Enter ${providerName} API key:`,
        validate: (value) => {
            if (!value || value.trim().length === 0) {
                return "API key cannot be empty";
            }
            if (provider === EAIProvider.ANTHROPIC && !value.startsWith("sk-")) {
                return "Anthropic API key should start with 'sk-'";
            }
            if (provider === EAIProvider.OPENAI && !value.startsWith("sk-")) {
                return "OpenAI API key should start with 'sk-'";
            }
        },
    });
    if (isCancel(apiKey)) {
        cancel("Operation cancelled");
        // eslint-disable-next-line @elsikora-unicorn/no-process-exit,elsikora-node/no-process-exit
        process.exit(0);
    }
    console.log(chalk.green(`API key provided for ${providerName}`));
    return apiKey;
}
async function promptForLanguage() {
    const options = LANGUAGE_CHOICES.map((choice) => ({
        label: choice.name,
        value: choice.value,
    }));
    const language = await select({
        message: "Select documentation language:",
        // @ts-ignore
        options,
    });
    if (isCancel(language)) {
        cancel("Operation cancelled");
        // eslint-disable-next-line @elsikora-unicorn/no-process-exit,elsikora-node/no-process-exit
        process.exit(0);
    }
    console.log(chalk.green(`Selected language: ${language}`));
    return language;
}
async function promptForModel(provider) {
    const choices = [];
    switch (provider) {
        case EAIProvider.ANTHROPIC: {
            const keys = Object.keys(EAnthropicModel);
            for (const key of keys) {
                const value = EAnthropicModel[key];
                choices.push({ label: key, value });
            }
            break;
        }
        case EAIProvider.OPENAI: {
            const keys = Object.keys(EOpenAIModel);
            for (const key of keys) {
                const value = EOpenAIModel[key];
                choices.push({ label: key, value });
            }
            break;
        }
        default: {
            throw new Error("Invalid AI provider specified");
        }
    }
    const model = await select({
        message: "Select AI model to use:",
        options: choices,
    });
    if (isCancel(model)) {
        cancel("Operation cancelled");
        // eslint-disable-next-line @elsikora-unicorn/no-process-exit,elsikora-node/no-process-exit
        process.exit(0);
    }
    console.log(chalk.green(`Selected model: ${model}`));
    return model;
}
async function promptForOutputFile() {
    const outputFile = await text({
        defaultValue: DEFAULT_OUTPUT_FILE,
        message: "Enter output file name:",
        placeholder: DEFAULT_OUTPUT_FILE,
    });
    if (isCancel(outputFile)) {
        cancel("Operation cancelled");
        // eslint-disable-next-line @elsikora-unicorn/no-process-exit,elsikora-node/no-process-exit
        process.exit(0);
    }
    console.log(chalk.green(`Output file location: ${outputFile}`));
    return outputFile;
}
async function promptForProvider() {
    const options = PROVIDER_CHOICES.map((choice) => ({
        label: choice.name,
        value: choice.value,
    }));
    const provider = await select({
        message: "Select AI provider:",
        // @ts-ignore
        options,
    });
    if (isCancel(provider)) {
        cancel("Operation cancelled");
        // eslint-disable-next-line @elsikora-unicorn/no-process-exit,elsikora-node/no-process-exit
        process.exit(0);
    }
    console.log(chalk.green(`Selected provider: ${provider}`));
    return provider;
}
async function promptForRepo() {
    const options = REPO_MODE_CHOICES.map((choice) => ({
        label: choice.name,
        value: choice.value,
    }));
    const repoMode = await select({
        message: "Select repository location:",
        // @ts-ignore
        options,
    });
    if (isCancel(repoMode)) {
        cancel("Operation cancelled");
        // eslint-disable-next-line @elsikora-unicorn/no-process-exit,elsikora-node/no-process-exit
        process.exit(0);
    }
    if (repoMode === "local") {
        const repoPath = await text({
            defaultValue: DEFAULT_LOCAL_PATH,
            message: "Enter local repository path:",
            placeholder: DEFAULT_LOCAL_PATH,
        });
        if (isCancel(repoPath)) {
            cancel("Operation cancelled");
            // eslint-disable-next-line @elsikora-unicorn/no-process-exit,elsikora-node/no-process-exit
            process.exit(0);
        }
        console.log(chalk.green(`Selected local repository: ${repoPath}`));
        return repoPath;
    }
    const repoRemote = await text({
        message: "Enter owner/repo (e.g., vercel/next.js):",
    });
    if (isCancel(repoRemote)) {
        cancel("Operation cancelled");
        // eslint-disable-next-line @elsikora-unicorn/no-process-exit,elsikora-node/no-process-exit
        process.exit(0);
    }
    console.log(chalk.green(`Selected GitHub repository: ${repoRemote}`));
    return repoRemote;
}
async function promptForScanDepth() {
    const scanDepth = await text({
        defaultValue: DEFAULT_SCAN_DEPTH,
        message: "Enter folder scan depth:",
        validate: (value) => {
            if (!/^\d+$/.test(value)) {
                return "Please enter numbers only";
            }
            else if (Number.parseInt(value, 10) < 1) {
                return "Depth must be greater than 0";
            }
            else if (Number.parseInt(value, 10) > 10) {
                return "Depth must be less than 10";
            }
        },
    });
    if (isCancel(scanDepth)) {
        cancel("Operation cancelled");
        // eslint-disable-next-line @elsikora-unicorn/no-process-exit,elsikora-node/no-process-exit
        process.exit(0);
    }
    const depth = Number.parseInt(scanDepth, 10);
    console.log(chalk.green(`Folder scan depth: ${String(depth)}`));
    return depth;
}

function parseChangelogTasks(changelogPath) {
    if (!fs.existsSync(changelogPath))
        return [];
    const content = fs.readFileSync(changelogPath, "utf8");
    const lines = content.split("\n");
    const tasks = [];
    for (const line of lines) {
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
            const text = line.replace(/^[-*]\s*/, "").trim();
            if (text)
                tasks.push(text);
        }
    }
    return tasks;
}

class ProjectScanner {
    totalChars = 0;
    extractContextInfo(files) {
        let context = "";
        this.totalChars = 0;
        const sortedFiles = [...files].sort((a, b) => {
            // eslint-disable-next-line @elsikora-typescript/explicit-function-return-type,@elsikora-unicorn/consistent-function-scoping
            const configScore = (name) => {
                if (name.includes("config"))
                    return 1;
                if (name.includes("main") || name.includes("index"))
                    return 2;
                return 3;
            };
            return configScore(a.path) - configScore(b.path);
        });
        // eslint-disable-next-line @elsikora-unicorn/no-array-reduce
        const filesByExtension = sortedFiles.reduce((accumulator, file) => {
            const extension = file.extension.slice(1).toUpperCase();
            if (!accumulator[extension])
                accumulator[extension] = [];
            accumulator[extension].push(file);
            return accumulator;
        }, {});
        for (const [extension, files] of Object.entries(filesByExtension)) {
            const extensionContext = `\n## ${extension} Files Analysis:\n`;
            if (this.totalChars + extensionContext.length > SCANNER_TOKEN_LIMIT * SCANNER_CHAR_PER_TOKEN)
                break;
            context += extensionContext;
            this.totalChars += extensionContext.length;
            for (const file of files) {
                const fileHeader = `\n### ${file.path}:\n`;
                const fileContent = `\`\`\`${extension.toLowerCase()}\n${file.content}\n\`\`\`\n`;
                const totalBlockSize = fileHeader.length + fileContent.length;
                if (this.totalChars + totalBlockSize > SCANNER_TOKEN_LIMIT * SCANNER_CHAR_PER_TOKEN) {
                    context += "\n[Additional files omitted due to length limitations]\n";
                    break;
                }
                context += fileHeader + fileContent;
                this.totalChars += totalBlockSize;
            }
        }
        return context;
    }
    async scanProject(rootPath, maxDepth = 1) {
        const pattern = path.join(rootPath, "**", "*.*").replaceAll("\\", "/");
        const files = await glob(pattern, {
            ignore: SCANNER_INGNORED_DIRS.map((directory) => `**/${directory}/**`),
            maxDepth: maxDepth,
            // eslint-disable-next-line @elsikora-typescript/naming-convention
            nodir: true,
        });
        const results = [];
        for (const file of files) {
            const extension = path.extname(file);
            const basename = path.basename(file);
            const hasValidExtension = SCANNER_CODE_FILE_EXTENSIONS.some((extension) => basename.endsWith(extension));
            if (hasValidExtension) {
                try {
                    // eslint-disable-next-line no-await-in-loop
                    const content = await fs.promises.readFile(file, "utf8");
                    results.push({
                        content: content,
                        extension: extension,
                        path: path.relative(rootPath, file),
                    });
                }
                catch {
                    /* empty */
                }
            }
        }
        return results;
    }
}

dotenv.config();
async function generateReadmeAction(argv) {
    // eslint-disable-next-line @elsikora-typescript/no-non-null-assertion
    const userRepoChoice = argv.repo === "." ? await promptForRepo() : argv.repo;
    const outputFile = await promptForOutputFile();
    const language = argv.lang ?? (await promptForLanguage());
    const scanDepth = argv.scanDepth ?? (await promptForScanDepth());
    const provider = argv.provider || (await promptForProvider());
    const model = argv.model ?? (await promptForModel(provider));
    let key;
    switch (provider) {
        case EAIProvider.ANTHROPIC: {
            key = argv.key ?? process.env.ANTHROPIC_API_KEY ?? (await promptForApiKey(provider));
            break;
        }
        case EAIProvider.OPENAI: {
            key = argv.key ?? process.env.OPENAI_API_KEY ?? (await promptForApiKey(provider));
            break;
        }
    }
    const isRemoteRepo = userRepoChoice.includes("/") && !fs.existsSync(userRepoChoice);
    let repoInfo;
    let projectContext = "";
    if (isRemoteRepo) {
        const githubService = new GithubService();
        repoInfo = await githubService.getRepoInfo(userRepoChoice);
    }
    else {
        const localService = new LocalService();
        repoInfo = localService.getRepoInfo(userRepoChoice);
    }
    repoInfo.author = repoInfo.author || "elsikora";
    // eslint-disable-next-line @elsikora-typescript/no-non-null-assertion
    const repoPath = isRemoteRepo ? repoInfo.tempDir : path.resolve(userRepoChoice);
    const scanner = new ProjectScanner();
    const files = await scanner.scanProject(repoPath, scanDepth);
    projectContext = scanner.extractContextInfo(files);
    const changelogPath = path.join(isRemoteRepo ? "." : path.resolve(userRepoChoice), "CHANGELOG.md");
    const doneFromChangelog = parseChangelogTasks(changelogPath);
    const anthropicService = new AIService(key);
    const generatedData = await anthropicService.generateReadme({
        doneFromChangelog,
        lang: language,
        model,
        projectContext,
        provider,
        repoInfo,
    });
    let finalReadme = generatedData.readme;
    if (fs.existsSync(changelogPath)) {
        finalReadme += "\n\n## 📋 Changelog\nSee [CHANGELOG.md](CHANGELOG.md) for details.\n";
    }
    fs.writeFileSync(outputFile, finalReadme, "utf8");
    console.log(chalk.green(`\nREADME successfully created: ${outputFile}\n`));
    console.log(chalk.magenta("Generated data:\n"));
    console.log(`Title: ${chalk.cyan(generatedData.title)}`);
    console.log(`Short description: ${chalk.cyan(generatedData.short_description)}`);
    console.log(`Logo URL: ${chalk.cyan(generatedData.logoUrl)}`);
    console.log(`Features: ${chalk.cyan(generatedData.features.join(", "))}`);
    console.log(`Badges: ${chalk.cyan("formatted in Shields.io style")}`);
    console.log(`License: ${chalk.cyan(generatedData.license)}`);
}

function createGenerateReadmeCommand(program) {
    return program
        .command("generate [repo]")
        .description(`Generate an intelligent README for your repository

This command analyzes your repository's structure, code, and contents to automatically
generate a comprehensive README.md file. It supports multiple languages, customizable 
scanning depth, and different AI providers for content generation.

Key Features:
• Intelligent project analysis and documentation generation
• Multi-language support for international projects
• Configurable scanning depth for large repositories
• Multiple AI provider options for content generation
• Interactive mode for customized README creation

Examples:
  $ generate .                      Generate README interactively for current directory
  $ generate -r owner/repo          Generate README for a GitHub repository
  $ generate . -l ru -d 2          Generate Russian README with medium scan depth
  $ generate . -p anthropic -m claude-3  Use specific AI model for generation
  $ generate . -k <your-api-key>   Use custom API key for generation

Options:
  --repo, -r       Local repository path or GitHub repository in owner/repo format
  --lang, -l       Documentation language code (en, es, fr, de, ru, zh, ja, etc.)
  --scanDepth, -d  Directory scanning depth (1=shallow, 2=medium, 3=deep)
  --provider, -p   AI provider to use for content generation (openai, anthropic)
  --model, -m      Specific AI model to use (e.g., gpt-4, claude-3)
  --key, -k        Custom API key for the selected AI provider

Note: Interactive mode will be enabled automatically when required options are missing.
For more details and documentation, visit: https://github.com/yourusername/readme-generator`)
        .option("-r, --repo <path>", "Local repo path or GitHub repo (owner/repo)", ".")
        .option("-l, --lang <language>", "Documentation language (en, es, fr, de, ru, etc.)")
        .option("-d, --scanDepth <depth>", "Folder scan depth (1-3)", Number)
        .option("-p, --provider <provider>", "AI provider to use (openai, anthropic)")
        .option("-m, --model <model>", "AI model to use")
        .option("-k, --key <key>", "API key for AI provider")
        .action(async (repo, options) => {
        const argumentsCommand = {
            ...options,
            repo: repo || options.repo,
        };
        await generateReadmeAction(argumentsCommand);
    });
}

const program = new Command();
program.name("@elsikora/readme-generator").description("CLI tool for generating repository README files").version("1.0.4");
createGenerateReadmeCommand(program);
program.parse(process.argv);
//# sourceMappingURL=index.js.map
