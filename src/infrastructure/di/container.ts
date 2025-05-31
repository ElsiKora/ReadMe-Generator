import type { IContainer } from "@elsikora/cladi";

import type { ICliInterfaceService } from "../../application/interface/cli-interface-service.interface.js";
import type { ILlmService } from "../../application/interface/llm-service.interface.js";

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
import { NodeFileSystemService } from "../service/node-file-system.service.js";
import { PromptsCliInterface } from "../service/prompts-cli-interface.service.js";
import { ReadmeBuilder } from "../service/readme-builder.service.js";

// Service tokens
export const FileSystemServiceToken: symbol = Symbol("FileSystemService");
export const CliInterfaceServiceToken: symbol = Symbol("CliInterfaceService");
export const GitRepositoryToken: symbol = Symbol("GitRepository");
export const LLMServicesToken: symbol = Symbol("LLMServices");
export const ReadmeBuilderToken: symbol = Symbol("ReadmeBuilder");

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
	container.register(ReadmeBuilderToken, new ReadmeBuilder());

	// Register all LLM services with factory functions
	container.register(LLMServicesToken, () => {
		const readmeBuilder: ReadmeBuilder | undefined = container.get<ReadmeBuilder>(ReadmeBuilderToken);

		if (!readmeBuilder) {
			throw new Error("ReadmeBuilder not found in container");
		}

		return [new OpenAILlmService(readmeBuilder), new AnthropicLlmService(readmeBuilder), new GoogleLlmService(readmeBuilder), new AzureOpenAILlmService(readmeBuilder), new AWSBedrockLlmService(readmeBuilder), new OllamaLlmService(readmeBuilder)];
	});

	// Register use cases with factory functions
	container.register(GenerateReadmeUseCaseToken, () => {
		const llmServices: Array<ILlmService> | undefined = container.get<Array<ILlmService>>(LLMServicesToken);

		if (!llmServices) {
			throw new Error("LLM services not found in container");
		}

		return new GenerateReadmeUseCaseImpl(llmServices);
	});

	container.register(ConfigureLLMUseCaseToken, () => {
		const cliInterface: ICliInterfaceService | undefined = container.get<ICliInterfaceService>(CliInterfaceServiceToken);

		if (!cliInterface) {
			throw new Error("CLI interface service not found in container");
		}

		return new ConfigureLLMUseCaseImpl(cliInterface);
	});

	return container;
}
