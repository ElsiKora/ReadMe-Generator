import fs from "node:fs";

export function parseChangelogTasks(changelogPath: string): Array<string> {
	if (!fs.existsSync(changelogPath)) return [];

	const content: string = fs.readFileSync(changelogPath, "utf8");
	const lines: Array<string> = content.split("\n");
	const tasks: Array<string> = [];

	for (const line of lines) {
		if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
			const text: string = line.replace(/^[-*]\s*/, "").trim();

			if (text) tasks.push(text);
		}
	}

	return tasks;
}
