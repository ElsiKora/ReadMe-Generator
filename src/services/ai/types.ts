import type { IGeneratedReadme, IRepoInfo } from "../../types";

export interface IGenerateReadmeInput {
	changelogContent: string;
	lang?: string;
	model: string;
	projectContext: string;
	repoInfo: IRepoInfo;
}

export interface IGenerateReadmeOutput extends IGeneratedReadme {
	readme: string;
}
