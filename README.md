<p align="center">
  <img src="https://6jft62zmy9nx2oea.public.blob.vercel-storage.com/readmegenerator-TuPz6OHqMeOzHujeclsr8xhWR9G7Cg.png" width="500" alt="project-logo">
</p>

<h1 align="center">🚀 ReadMe-Generator</h1>
<p align="center"><em>Transform your codebase into stunning documentation with AI-powered intelligence</em></p>

<p align="center">
    <a aria-label="ElsiKora logo" href="https://elsikora.com">
  <img src="https://img.shields.io/badge/MADE%20BY%20ElsiKora-333333.svg?style=for-the-badge" alt="ElsiKora">
</a> <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"> <img src="https://img.shields.io/badge/Node.js-339933.svg?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"> <img src="https://img.shields.io/badge/npm-CB3837.svg?style=for-the-badge&logo=npm&logoColor=white" alt="npm"> <img src="https://img.shields.io/badge/Rollup-EC4A3F.svg?style=for-the-badge&logo=rollup&logoColor=white" alt="Rollup"> <img src="https://img.shields.io/badge/Vitest-6E9F18.svg?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest"> <img src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint"> <img src="https://img.shields.io/badge/Prettier-F7B93E.svg?style=for-the-badge&logo=prettier&logoColor=black" alt="Prettier"> <img src="https://img.shields.io/badge/OpenAI-412991.svg?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI"> <img src="https://img.shields.io/badge/Git-F05032.svg?style=for-the-badge&logo=git&logoColor=white" alt="Git"> <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF.svg?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions">
</p>

## 📚 Table of Contents

- [Description](#-description)
- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
- [Roadmap](#-roadmap)
- [FAQ](#-faq)
- [License](#-license)

## 📖 Description

ReadMe-Generator is an advanced command-line utility that revolutionizes the way developers create project documentation. By leveraging cutting-edge AI models from OpenAI, Anthropic, Google, and AWS Bedrock, this tool analyzes your entire codebase to generate comprehensive, context-aware README files that truly capture the essence of your project.

Built with clean architecture principles and domain-driven design, ReadMe-Generator goes beyond simple template filling. It intelligently scans your project structure, understands your technology stack, detects dependencies, and creates beautifully formatted documentation complete with badges, feature lists, installation guides, and usage examples.

Whether you're maintaining an open-source library, documenting an internal tool, or preparing a project for public release, ReadMe-Generator ensures your documentation is professional, comprehensive, and engaging. The tool supports multiple languages, custom configurations, and even generates project logos automatically.

## 🚀 Features

- ✨ **🤖 **Multi-AI Provider Support** - Choose from OpenAI (GPT-4), Anthropic (Claude), Google AI (Gemini), or AWS Bedrock for optimal results**
- ✨ **📊 **Intelligent Code Analysis** - Deep scanning with configurable depth to understand your project structure and dependencies**
- ✨ **🎨 **Automatic Logo Generation** - Creates custom project logos using AI-powered image generation**
- ✨ **💬 **Interactive CLI Experience** - User-friendly prompts guide you through the configuration process**
- ✨ **🌍 **Multi-Language Documentation** - Generate READMEs in multiple languages for global accessibility**
- ✨ **🏷️ **Smart Badge Detection** - Automatically identifies and adds relevant technology badges based on your stack**
- ✨ **📝 **Context-Aware Content** - Generates descriptions, features, and usage examples tailored to your specific project**
- ✨ **⚡ **Clean Architecture** - Built with DDD principles for maintainability and extensibility**
- ✨ **🔧 **Flexible Configuration** - Supports both interactive mode and configuration files for CI/CD integration**
- ✨ **📦 **NPM Package Support** - Seamlessly integrates with your Node.js development workflow**

## 🛠 Installation

```bash
# Install globally for system-wide usage
npm install -g @elsikora/readme-generator

# Or install as a dev dependency in your project
npm install --save-dev @elsikora/readme-generator

# Using yarn
yarn add -D @elsikora/readme-generator

# Using pnpm
pnpm add -D @elsikora/readme-generator


### Configuration

Before using the tool, you'll need to set up your AI provider credentials:


# Create a .env file in your project root
touch .env

# Add your preferred AI provider API key
echo "OPENAI_API_KEY=your_openai_key_here" >> .env
# OR
echo "ANTHROPIC_API_KEY=your_anthropic_key_here" >> .env
# OR
echo "GOOGLE_API_KEY=your_google_ai_key_here" >> .env
```

## 💡 Usage

## Basic Usage

```bash
# Navigate to your project directory
cd your-awesome-project

# Run the generator with interactive prompts
@elsikora/readme-generator
```

## Advanced Usage

### Command Line Options

```bash
# Specify AI provider and model
@elsikora/readme-generator --provider anthropic --model claude-3-5-haiku-latest

# Set documentation language
@elsikora/readme-generator --language es

# Configure scan depth for larger projects
@elsikora/readme-generator --scan-depth 5

# Skip confirmations for CI/CD
@elsikora/readme-generator --skip-confirmations
```

### Configuration File

Create a `.elsikora/readme-generator.config.js` file for persistent settings:

```javascript
export default {
	language: "en",
	llm: {
		provider: "anthropic",
		model: "claude-3-5-haiku-latest",
	},
	logoType: "local",
	scanDepth: 3,
	skipConfirmations: false,
};
```

### Programmatic Usage

```javascript
import { createAppContainer } from "@elsikora/readme-generator";
import { GenerateReadmeCommand } from "@elsikora/readme-generator";

const container = createAppContainer();
const command = new GenerateReadmeCommand(container);

await command.execute();
```

### CI/CD Integration

```yaml
# GitHub Actions example
name: Update README
on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'

jobs:
  update-readme:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install -g @elsikora/readme-generator
      - run: @elsikora/readme-generator --skip-confirmations
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'docs: update README.md'
```

### Supported AI Models

| Provider    | Models                                                        | Best For                                               |
| ----------- | ------------------------------------------------------------- | ------------------------------------------------------ |
| OpenAI      | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`                        | Comprehensive documentation with creative descriptions |
| Anthropic   | `claude-3-5-haiku-latest`, `claude-3-opus`, `claude-3-sonnet` | Technical accuracy and structured content              |
| Google AI   | `gemini-1.5-pro`, `gemini-1.5-flash`                          | Multilingual documentation                             |
| AWS Bedrock | Various models                                                | Enterprise environments with AWS integration           |

## 🛣 Roadmap

| Task / Feature                                             | Status         |
| ---------------------------------------------------------- | -------------- |
| Multi-AI Provider Support (OpenAI, Anthropic, Google, AWS) | ✅ Done        |
| Clean Architecture Implementation                          | ✅ Done        |
| Interactive CLI with Clack Prompts                         | ✅ Done        |
| Automatic Logo Generation                                  | ✅ Done        |
| Configuration File Support                                 | ✅ Done        |
| NPM Package Publishing                                     | ✅ Done        |
| Unit & E2E Testing Suite                                   | ✅ Done        |
| Custom Template System                                     | 🚧 In Progress |
| VS Code Extension                                          | 🚧 In Progress |
| GitHub App Integration                                     | 🚧 In Progress |
| Project Statistics Dashboard                               | 🚧 In Progress |
| README Preview in Terminal                                 | 🚧 In Progress |
| Markdown Linting Integration                               | 🚧 In Progress |
| README Translation API                                     | 🚧 In Progress |
| Badge Customization UI                                     | 🚧 In Progress |

## ❓ FAQ

**Q: Which AI provider should I choose?** A: Each provider has its strengths:

- **OpenAI (GPT-4)**: Best for creative, engaging descriptions and comprehensive documentation
- **Anthropic (Claude)**: Excellent for technical accuracy and well-structured content
- **Google AI (Gemini)**: Great for multilingual support and fast generation
- **AWS Bedrock**: Ideal for enterprise environments already using AWS

**Q: How much does it cost to use?** A: The tool itself is free and open-source. You'll only pay for the AI API usage based on your chosen provider's pricing.

**Q: Can I use this in my CI/CD pipeline?** A: Absolutely! Use the `--skip-confirmations` flag and set your API keys as environment variables for automated workflows.

**Q: How deep should I set the scan depth?** A: For most projects, the default depth of 3 is sufficient. Increase it for monorepos or deeply nested projects.

**Q: Can I customize the generated README?** A: Currently, you can edit the generated README manually. Custom template support is coming soon!

**Q: Is my code sent to the AI providers?** A: Yes, file contents are sent to generate context-aware documentation. Ensure you're comfortable with your chosen provider's data policies.

**Q: What file types are scanned?** A: The tool scans common code files (JS, TS, JSON, etc.) while intelligently ignoring build artifacts, dependencies, and binary files.

**Q: Can I generate READMEs in multiple languages?** A: Yes! Use the `--language` flag with any ISO 639-1 language code (e.g., 'es' for Spanish, 'fr' for French).

## 🔒 License

This project is licensed under \*\*This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 ElsiKora

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\*\*.
