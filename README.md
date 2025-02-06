<p align="center">
  <img src="https://6jft62zmy9nx2oea.public.blob.vercel-storage.com/readmegenerator-TuPz6OHqMeOzHujeclsr8xhWR9G7Cg.png" width="500" alt="project-logo">
</p>
<h1 align="center">📝 ReadMe Generator</h1>
<p align="center"><em>A powerful CLI tool for automatically generating comprehensive README files for your projects</em></p>

<p align="center">
    <a aria-label="ElsiKora logo" href="https://elsikora.com">
  <img src="https://img.shields.io/badge/MADE%20BY%20ElsiKora-333333.svg?style=for-the-badge" alt="ElsiKora">
</a> <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"> <img src="https://img.shields.io/badge/Node.js-339933.svg?style=for-the-badge&logo=nodejs&logoColor=white" alt="Node.js"> <img src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint"> <img src="https://img.shields.io/badge/Prettier-F7B93E.svg?style=for-the-badge&logo=prettier&logoColor=black" alt="Prettier"> <img src="https://img.shields.io/badge/OpenAI-412991.svg?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI">
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

ReadMe Generator is a sophisticated command-line tool designed to streamline the documentation process for developers. By leveraging advanced AI capabilities from providers like OpenAI and Anthropic, it analyzes your project's structure, code, and dependencies to generate detailed, well-structured README files. The tool supports multiple languages, integrates with both local and GitHub repositories, and provides intelligent context-aware documentation that captures the essence of your project.

Built with TypeScript and modern JavaScript practices, this tool helps solve the common challenge of maintaining high-quality project documentation. Whether you're working on a small personal project or a large open-source initiative, ReadMe Generator helps you create professional documentation that meets industry standards and effectively communicates your project's value to potential users and contributors.

## 🚀 Features

- ✨ **Multi-language support with translations for English, Spanish, French, German, and Russian**
- ✨ **Seamless integration with both local repositories and GitHub projects**
- ✨ **AI-powered content generation using OpenAI and Anthropic models**
- ✨ **Smart project analysis with customizable scan depth**
- ✨ **Automatic detection and inclusion of technical stack badges**
- ✨ **Interactive CLI with user-friendly prompts**
- ✨ **Comprehensive documentation structure with Table of Contents**
- ✨ **Intelligent roadmap generation with changelog integration**
- ✨ **Customizable output with support for different file paths**

## 🛠 Installation

```bash
npm install -g @elsikora/readme-generator
```

## 💡 Usage

# Basic Usage

```bash
# Generate README with interactive prompts
npx @elsikora/readme-generator generate .

# Generate README for a GitHub repository
npx @elsikora/readme-generator generate -r owner/repo

# Generate README in a specific language
npx @elsikora/readme-generator generate . -l ru
```

## Command Line Options

```bash
Options:
  -r, --repo <path>      Local repo path or GitHub repo (owner/repo)
  -l, --lang <language>  Documentation language (en, es, fr, de, ru)
  -d, --scanDepth <n>    Folder scan depth (1-3)
  -p, --provider         AI provider to use (openai, anthropic)
  -m, --model           AI model to use
  -h, --help            Display help information
```

## Environment Configuration

```bash
# Create .env file with your API keys
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GITHUB_TOKEN=your_github_token  # Optional, for private repos
```

## Advanced Usage

### Custom Output Location

```bash
# Generate README with a specific output path
npx @elsikora/readme-generator generate . -o ./docs/README.md
```

### Using with Different AI Models

```bash
# Use specific OpenAI model
npx @elsikora/readme-generator generate . -p openai -m gpt-4

# Use Anthropic Claude
npx @elsikora/readme-generator generate . -p anthropic -m claude-3-opus
```

### Integration with CI/CD

```yaml
# GitHub Actions example
steps:
  - uses: actions/checkout@v2
  - name: Generate README
    run: |
      npm install -g @elsikora/readme-generator
      readme-generator generate . -l en -d 2
    env:
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

## 🛣 Roadmap

| Task / Feature                                                                                    | Status         |
| ------------------------------------------------------------------------------------------------- | -------------- |
| Implement multi-file documentation generation                                                     | 🚧 In Progress |
| Add support for additional AI providers                                                           | 🚧 In Progress |
| Integrate with more version control platforms                                                     | 🚧 In Progress |
| Implement template customization                                                                  | 🚧 In Progress |
| Add support for automated screenshot generation                                                   | 🚧 In Progress |
| Create a web interface version                                                                    | 🚧 In Progress |
| (done) Multi-language support with translations for English, Spanish, French, German, and Russian | 🚧 In Progress |
| (done) Seamless integration with both local repositories and GitHub projects                      | 🚧 In Progress |
| (done) AI-powered content generation using OpenAI and Anthropic models                            | 🚧 In Progress |

## ❓ FAQ

### How does the AI content generation work?

The tool analyzes your project's structure, code, and dependencies, then uses advanced AI models to generate contextually relevant documentation that accurately describes your project.

### Which AI providers are supported?

Currently, the tool supports OpenAI (GPT-4) and Anthropic (Claude) models. Additional providers may be added in future updates.

### Can I customize the generated README?

Yes, you can modify the output file after generation. Future updates will include template customization features.

### Does it work with private GitHub repositories?

Yes, but you'll need to provide a GitHub token with appropriate permissions.

### What languages are supported?

The tool currently supports generating documentation in English, Spanish, French, German, and Russian.

## 🔒 License

This project is licensed under **MIT**.
