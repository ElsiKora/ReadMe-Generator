import { Command } from "commander";

import { createGenerateReadmeCommand } from "./commands/generate-readme/command";

const program: Command = new Command();

program.name("@elsikora/readme-generator").description("CLI tool for generating repository README files").version("1.0.3");

createGenerateReadmeCommand(program);

program.parse(process.argv);
