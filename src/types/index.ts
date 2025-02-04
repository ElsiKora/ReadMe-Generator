export interface IGeneratedReadme {
	badges: Array<{
		color: string;
		logo: string;
		logoColor: string;
		name: string;
	}>;
	changelog: string;
	faq: string;
	features: Array<string>;
	folder_structure: string;
	installation: string;
	license: string;
	logoUrl: string;
	long_description: string;
	readme?: string;
	roadmap: string;
	screenshots: Array<{
		description: string;
		url: string;
	}>;
	short_description: string;
	title: string;
	usage: string;
}

export interface IRepoInfo {
	author?: string;
	codeStats: string;
	description: string;
	name: string;
	tempDir?: string;
}
