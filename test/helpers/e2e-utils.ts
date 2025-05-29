import { execSync } from "child_process";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

/**
 * Create a temporary test repository
 * @returns {Promise<string>} Path to the test repository
 */
export async function createTestRepo(): Promise<string> {
	const testRepoPath = join(tmpdir(), `readme-generator-test-${Date.now()}`);
	
	// Create directory
	mkdirSync(testRepoPath, { recursive: true });
	
	// Initialize git repo
	execSync("git init", { cwd: testRepoPath });
	execSync('git config user.email "test@example.com"', { cwd: testRepoPath });
	execSync('git config user.name "Test User"', { cwd: testRepoPath });
	
	// Create initial commit
	writeFileSync(join(testRepoPath, "package.json"), JSON.stringify({
		name: "test-project",
		version: "1.0.0",
		description: "Test project for README generator",
		license: "MIT",
	}, null, 2));
	
	execSync("git add .", { cwd: testRepoPath });
	execSync('git commit -m "Initial commit"', { cwd: testRepoPath });
	
	return testRepoPath;
}

/**
 * Clean up test repository
 * @param {string} repoPath - Path to the test repository
 */
export async function cleanupTestRepo(repoPath: string): Promise<void> {
	try {
		rmSync(repoPath, { recursive: true, force: true });
	} catch {
		// Ignore errors during cleanup
	}
}

/**
 * Stage files in the test repository
 * @param {string} repoPath - Path to the test repository
 * @param {Record<string, string>} files - Files to create and stage
 */
export async function stageFiles(repoPath: string, files: Record<string, string>): Promise<void> {
	for (const [filename, content] of Object.entries(files)) {
		const filePath = join(repoPath, filename);
		writeFileSync(filePath, content);
		execSync(`git add ${filename}`, { cwd: repoPath });
	}
}

/**
 * Run the README generator CLI
 * @param {string} cwd - Working directory
 * @param {string} input - Input to pipe to the CLI
 * @param {Record<string, string>} env - Environment variables
 * @returns {Promise<{stdout: string; stderr: string; exitCode: number}>} CLI output
 */
export async function runCli(
	cwd: string,
	input: string = "",
	env: Record<string, string> = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
	try {
		const cliPath = join(process.cwd(), "bin", "index.js");
		const result = execSync(
			`echo "${input}" | node ${cliPath}`,
			{
				cwd,
				encoding: "utf8",
				env: { ...process.env, ...env },
				stdio: ["pipe", "pipe", "pipe"],
			}
		);
		
		return {
			stdout: result.toString(),
			stderr: "",
			exitCode: 0,
		};
	} catch (error: any) {
		return {
			stdout: error.stdout?.toString() ?? "",
			stderr: error.stderr?.toString() ?? "",
			exitCode: error.status ?? 1,
		};
	}
}

/**
 * Run the README generator CLI with injected answers
 * @param {string} cwd - Working directory
 * @param {(string | number)[]} answers - Answers to inject into prompts
 * @param {Record<string, string>} env - Environment variables
 * @returns {Promise<{stdout: string; stderr: string; exitCode: number}>} CLI output
 */
export async function runCliWithAnswers(
	cwd: string,
	answers: (string | number)[],
	env: Record<string, string> = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
	try {
		const wrapperPath = join(process.cwd(), "test", "helpers", "test-cli-wrapper.js");
		const result = execSync(
			`node ${wrapperPath}`,
			{
				cwd,
				encoding: "utf8",
				env: { 
					...process.env, 
					...env,
					PROMPT_INJECT_ANSWERS: JSON.stringify(answers)
				},
				stdio: ["pipe", "pipe", "pipe"],
			}
		);
		
		return {
			stdout: result.toString(),
			stderr: "",
			exitCode: 0,
		};
	} catch (error: any) {
		return {
			stdout: error.stdout?.toString() ?? "",
			stderr: error.stderr?.toString() ?? "",
			exitCode: error.status ?? 1,
		};
	}
}

/**
 * Check if README.md was created
 * @param {string} repoPath - Path to the test repository
 * @returns {boolean} True if README.md exists
 */
export function readmeExists(repoPath: string): boolean {
	try {
		execSync("test -f README.md", { cwd: repoPath });
		return true;
	} catch {
		return false;
	}
}

/**
 * Read README.md content
 * @param {string} repoPath - Path to the test repository
 * @returns {string} README content
 */
export function readReadme(repoPath: string): string {
	const readmePath = join(repoPath, "README.md");
	return execSync(`cat ${readmePath}`, { encoding: "utf8" });
}

/**
 * Create test environment variables
 * @param {Record<string, string>} overrides - Environment variable overrides
 * @returns {Record<string, string>} Environment variables
 */
export function createTestEnv(overrides: Record<string, string> = {}): Record<string, string> {
	return {
		NODE_ENV: "test",
		CI: "true",
		...overrides,
	};
} 