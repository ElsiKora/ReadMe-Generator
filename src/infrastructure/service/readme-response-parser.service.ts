import type { ILlmPromptContext } from "../../application/interface/llm-service.interface";
import type { IMermaidDiagrams, IReadmeBuilder } from "../../application/interface/readme-builder.interface";
import type { IReadmeResponseParser } from "../../application/interface/readme-response-parser.interface";

import { Badge, Readme } from "../../domain/index";

/**
 * Service for parsing LLM responses into README objects
 */
export class ReadmeResponseParserService implements IReadmeResponseParser {
	private readonly README_BUILDER: IReadmeBuilder;

	constructor(readmeBuilder: IReadmeBuilder) {
		this.README_BUILDER = readmeBuilder;
	}

	/**
	 * Parse the LLM response content into a Readme object
	 * @param {string} content - The raw response content from the LLM
	 * @param {ILlmPromptContext} context - The context used for generating the README
	 * @returns {Readme} The parsed Readme object
	 * @throws {Error} If parsing fails or required fields are missing
	 */
	parseResponse(content: string, context: ILlmPromptContext): Readme {
		try {
			interface IReadmeJson {
				acknowledgments?: string;
				badges: Array<{
					color: string;
					logo: string;
					logoColor: string;
					name: string;
				}>;
				contributing?: string;
				faq: string;
				features: Array<string>;
				highlights?: Array<string>;
				installation: string;
				license: string;
				logoUrl: string;
				long_description: string;
				mermaid_diagrams?: {
					architecture?: string;
					data_flow?: string;
				};
				prerequisites?: Array<string>;
				roadmap: string;
				short_description: string;
				tech_stack?: Record<string, Array<string>>;
				title: string;
				usage: string;
			}

			// Extract JSON from the content
			const jsonContent: string = this.extractJson(content);
			const parsed: IReadmeJson = JSON.parse(jsonContent) as IReadmeJson;

			// Validate required fields
			if (!parsed.title || !parsed.short_description) {
				throw new Error("Missing required fields in response");
			}

			// Create Badge objects
			const badges: Array<Badge> = parsed.badges?.map((b: IReadmeJson["badges"][0]) => new Badge(b.name, b.color, b.logo, b.logoColor)) ?? [];

			// Use logo preferences from context if provided, otherwise use AI-generated
			let logoUrl: string | undefined = context.logoUrl;
			const logoType: typeof context.logoType = context.logoType;

			// If no logo preferences were provided, use AI suggestion
			if (!logoType && !logoUrl) {
				logoUrl = parsed.logoUrl;
			}

			// Parse mermaid diagrams
			const mermaidDiagrams: IMermaidDiagrams | undefined = parsed.mermaid_diagrams
				? {
						architecture: parsed.mermaid_diagrams.architecture,
						dataFlow: parsed.mermaid_diagrams.data_flow,
					}
				: undefined;

			// Build the final README content
			const readmeContent: string = this.README_BUILDER.build({
				acknowledgments: parsed.acknowledgments ?? "",
				badges,
				contributing: parsed.contributing ?? "",
				faq: parsed.faq || "",
				features: parsed.features || [],
				highlights: parsed.highlights ?? [],
				installation: parsed.installation || "",
				license: parsed.license || "MIT",
				logoType,
				logoUrl,
				longDescription: parsed.long_description,
				mermaidDiagrams,
				prerequisites: parsed.prerequisites ?? [],
				repositoryInfo: context.repositoryInfo,
				roadmap: parsed.roadmap || "",
				shortDescription: parsed.short_description,
				shouldIncludeContributing: context.shouldIncludeContributing,
				shouldIncludeContributors: context.shouldIncludeContributors,
				shouldIncludeGithubBadges: context.shouldIncludeGithubBadges,
				techStack: parsed.tech_stack ?? {},
				title: parsed.title,
				usage: parsed.usage || "",
			});

			return new Readme({
				acknowledgments: parsed.acknowledgments ?? "",
				badges,
				content: readmeContent,
				contributing: parsed.contributing ?? "",
				faq: parsed.faq || "",
				features: parsed.features || [],
				highlights: parsed.highlights ?? [],
				installation: parsed.installation || "",
				license: parsed.license || "MIT",
				logoUrl: parsed.logoUrl || "",
				longDescription: parsed.long_description,
				mermaidDiagrams,
				prerequisites: parsed.prerequisites ?? [],
				roadmap: parsed.roadmap || "",
				shortDescription: parsed.short_description,
				techStack: parsed.tech_stack ?? {},
				title: parsed.title,
				usage: parsed.usage || "",
			});
		} catch (error) {
			throw new Error(`Failed to parse README response: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Extract JSON from content that may be wrapped in markdown code blocks or other text
	 * @param {string} content - The raw content that may contain JSON
	 * @returns {string} The extracted JSON string
	 */
	private extractJson(content: string): string {
		// Trim whitespace
		let cleanContent: string = content.trim();

		// Remove markdown code blocks
		// Handle ```json ... ``` or ``` ... ```
		cleanContent = cleanContent.replace(/^```(?:json)?\s*/i, "");
		cleanContent = cleanContent.replace(/\n?```\s*$/, "");

		// Try to find JSON object boundaries
		const firstBrace: number = cleanContent.indexOf("{");
		const lastBrace: number = cleanContent.lastIndexOf("}");

		if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
			cleanContent = cleanContent.slice(firstBrace, lastBrace + 1);
		}

		// Remove any remaining leading/trailing whitespace
		return cleanContent.trim();
	}
}
