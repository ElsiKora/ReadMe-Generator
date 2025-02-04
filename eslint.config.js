import createConfig from "@elsikora/eslint-config";

export default [
	{
		ignores: ["**/node_modules/", "**/.git/", "**/dist/", "**/build/", "**/coverage/", "**/.vscode/", "**/.idea/", "**/*.min.js", "**/*.bundle.js"],
	},
	...createConfig({
		withJavascript: true,
		withSonar: true,
		withUnicorn: true,
		withPerfectionist: true,
		withTypescript: true,
		withJson: true,
		withYaml: true,
		withCheckFile: true,
		withPackageJson: true,
		withNode: true,
		withRegexp: true,
		withPrettier: true,
		withStylistic: true,
	}),
];
