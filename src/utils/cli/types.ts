import type { EAIProvider } from "../../services/ai/provider.enum";

export type TLanguage = "de" | "en" | "es" | "fr" | "ru";
export type TLanguageChoice = {
	readonly name: string;
	readonly value: TLanguage;
};

export type TModelChoice = {
	readonly label: string;
	readonly value: string;
};

export type TProviderChoice = {
	readonly name: string;
	readonly value: EAIProvider;
};

export type TRepoMode = "local" | "remote";

export type TRepoModeChoice = {
	readonly name: string;
	readonly value: TRepoMode;
};

export type TSelectOption<T> = {
	readonly label: string;
	readonly value: T;
};

export type TSpinnerInstance = {
	readonly stop: (message?: string) => void;
};
