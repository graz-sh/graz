import chalk from "chalk";
import { Command } from "commander";
import path from "path";
import prompts from "prompts";

import { createApp } from "./create-apps";
import { getPkgManager } from "./helpers/get-pkg-manager";
import { validateNpmName } from "./helpers/validate-pkg";
import packageJson from "./package.json";

let projectPath = "";

const program = new Command(packageJson.name)
  .version(packageJson.version)
  .arguments("<project-directory>")
  .usage(`${chalk.green("<project-directory>")} [options]`)
  .action((name: string) => {
    projectPath = name;
  })
  .option(
    "--use-npm",
    `

  Explicitly tell the CLI to bootstrap the app using npm
`,
  )
  .option(
    "--use-pnpm",
    `

  Explicitly tell the CLI to bootstrap the app using pnpm
`,
  )
  .allowUnknownOption();

const run = async () => {
  if (typeof projectPath === "string") {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      type: "text",
      name: "path",
      message: "What is your project named?",
      initial: "my-app",
      validate: (name: string) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return `Invalid project name: ${validation.problems![0]!}`;
      },
    });

    if (typeof res.path === "string") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log(
      "\nPlease specify the project directory:\n" +
        `  ${chalk.cyan(program.name())} ${chalk.green("<project-directory>")}\n` +
        "For example:\n" +
        `  ${chalk.cyan(program.name())} ${chalk.green("my-next-app")}\n\n` +
        `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`,
    );
    process.exit(1);
  }

  const resolvedProjectPath = path.resolve(projectPath);
  const projectName = path.basename(resolvedProjectPath);

  const { valid, problems } = validateNpmName(projectName);

  if (!valid) {
    console.error(
      `Could not create a project called ${chalk.red(`"${projectName}"`)} because of npm naming restrictions:`,
    );

    problems!.forEach((p) => console.error(`    ${chalk.red.bold("*")} ${p}`));
    process.exit(1);
  }
  const options = program.opts();
  // eslint-disable-next-line no-nested-ternary
  const packageManager = options.useNpm ? "npm" : options.usePnpm ? "pnpm" : getPkgManager();

  try {
    await createApp({
      appPath: resolvedProjectPath,
      packageManager,
    });
  } catch (error) {
    console.log((error as Error).message);
  }
};

run().catch((reason) => {
  console.log();
  console.log("Aborting installation.");

  if (reason.command) {
    console.log(`  ${chalk.cyan(reason.command)} has failed.`);
  } else {
    console.log(`${chalk.red("Unexpected error. Please report it as a bug:")}\n`, reason);
  }
  console.log();

  process.exit(1);
});
