import type { IContainer } from "@elsikora/cladi";

import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface.js";
import type { IConfigService } from "../../application/interface/config-service.interface.js";
import type { IFileSystemService } from "../../application/interface/file-system-service.interface.js";
import type { ILlmService } from "../../application/interface/llm-service.interface.js";
import type { IPromptBuilder } from "../../application/interface/prompt-builder.interface.js";
import type { IReadmeBuilder } from "../../application/interface/readme-builder.interface.js";
import type { IReadmeResponseParser } from "../../application/interface/readme-response-parser.interface.js";

import { createContainer } from "@elsikora/cladi";

import { ConfigureLLMUseCase as ConfigureLLMUseCaseImpl } from "../../application/use-case/configure-llm.use-case.js";
import { GenerateReadmeUseCase as GenerateReadmeUseCaseImpl } from "../../application/use-case/generate-readme.use-case.js";
import { GitRepositoryService } from "../git/git-repository.service.js";
import { AnthropicLlmService } from "../llm/anthropic-llm.service.js";
import { AWSBedrockLlmService } from "../llm/aws-bedrock-llm.service.js";
import { AzureOpenAILlmService } from "../llm/azure-openai-llm.service.js";
import { GoogleLlmService } from "../llm/google-llm.service.js";
import { OllamaLlmService } from "../llm/ollama-llm.service.js";
import { OpenAILlmService } from "../llm/openai-llm.service.js";
import { CosmicConfigService } from "../service/cosmic-config.service.js";
import { GitCloneService } from "../service/git-clone.service.js";
import { ImgurImageUploadService } from "../service/imgur-upload.service.js";
import { NodeFileSystemService } from "../service/node-file-system.service.js";
import { PromptBuilderService } from "../service/prompt-builder.service.js";
import { PromptsCliInterface } from "../service/prompts-cli-interface.service.js";
import { ReadmeBuilder } from "../service/readme-builder.service.js";
import { ReadmeResponseParserService } from "../service/readme-response-parser.service.js";

// Service tokens
export const FileSystemServiceToken: symbol = Symbol("FileSystemService");
export const CliInterfaceServiceToken: symbol = Symbol("CliInterfaceService");
export const GitRepositoryToken: symbol = Symbol("GitRepository");
export const GitCloneServiceToken: symbol = Symbol("GitCloneService");
export const LlmServicesToken: symbol = Symbol("LlmServices");
export const ImageUploadServiceToken: symbol = Symbol("ImageUploadService");
export const ReadmeBuilderToken: symbol = Symbol("ReadmeBuilder");
export const PromptBuilderServiceToken: symbol = Symbol("PromptBuilderService");
export const ReadmeResponseParserServiceToken: symbol = Symbol("ReadmeResponseParserService");
export const ConfigServiceToken: symbol = Symbol("ConfigService");

// Use case tokens
export const GenerateReadmeUseCaseToken: symbol = Symbol("GenerateReadmeUseCase");
export const ConfigureLLMUseCaseToken: symbol = Symbol("ConfigureLLMUseCase");

/**
 * Create and configure the application DI container
 * @returns {IContainer} The configured DI container
 */
export function createAppContainer(): IContainer {
	const container: IContainer = createContainer({});

	// Register infrastructure services
	container.register(FileSystemServiceToken, new NodeFileSystemService());
	container.register(CliInterfaceServiceToken, new PromptsCliInterface());
	container.register(GitRepositoryToken, new GitRepositoryService());
	container.register(GitCloneServiceToken, new GitCloneService());
	container.register(ReadmeBuilderToken, new ReadmeBuilder());
	container.register(ImageUploadServiceToken, new ImgurImageUploadService());

	// Register Config Service with factory function
	container.register(
		ConfigServiceToken,
		((): IConfigService => {
			const fileSystemService: IFileSystemService | undefined = container.get(FileSystemServiceToken);

			if (!fileSystemService) {
				throw new Error("FileSystemService not found in container");
			}

			return new CosmicConfigService(fileSystemService);
		})(),
	);

	// Register Prompt Builder
	container.register(PromptBuilderServiceToken, new PromptBuilderService());

	// Register README Response Parser with factory function
	container.register(
		ReadmeResponseParserServiceToken,
		((): ReadmeResponseParserService => {
			const readmeBuilder: IReadmeBuilder | undefined = container.get(ReadmeBuilderToken);

			if (!readmeBuilder) {
				throw new Error("ReadmeBuilder not found in container");
			}

			return new ReadmeResponseParserService(readmeBuilder);
		})(),
	);

	// Register all LLM services with factory functions
	container.register(
		LlmServicesToken,
		((): Array<ILlmService> => {
			const readmeBuilder: IReadmeBuilder | undefined = container.get(ReadmeBuilderToken);
			const promptBuilder: IPromptBuilder | undefined = container.get(PromptBuilderServiceToken);
			const responseParser: IReadmeResponseParser | undefined = container.get(ReadmeResponseParserServiceToken);

			if (!readmeBuilder || !promptBuilder || !responseParser) {
				throw new Error("ReadmeBuilder, PromptBuilder, or ReadmeResponseParser not found in container");
			}

			return [new OpenAILlmService(promptBuilder, responseParser), new AnthropicLlmService(promptBuilder, responseParser), new GoogleLlmService(promptBuilder, responseParser), new AzureOpenAILlmService(promptBuilder, responseParser), new AWSBedrockLlmService(promptBuilder, responseParser), new OllamaLlmService(promptBuilder, responseParser)];
		})(),
	);

	// Register use cases with factory functions
	container.register(
		GenerateReadmeUseCaseToken,
		((): GenerateReadmeUseCaseImpl => {
			const llmServices: Array<ILlmService> | undefined = container.get(LlmServicesToken);

			if (!llmServices) {
				throw new Error("LLM services not found in container");
			}

			return new GenerateReadmeUseCaseImpl(llmServices);
		})(),
	);

	container.register(
		ConfigureLLMUseCaseToken,
		((): ConfigureLLMUseCaseImpl => {
			const cliInterface: ICliInterfaceService | undefined = container.get(CliInterfaceServiceToken);
			const configService: IConfigService | undefined = container.get(ConfigServiceToken);

			if (!cliInterface || !configService) {
				throw new Error("CLI interface service or Config service not found in container");
			}

			return new ConfigureLLMUseCaseImpl(cliInterface, configService);
		})(),
	);

	return container;
}
