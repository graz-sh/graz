import path from "node:path";

import retry from "async-retry";
import chalk from "chalk";

import type { PackageManager } from "./helpers/get-pkg-manager";
import { tryGitInit } from "./helpers/git";
import { install } from "./helpers/install";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { getOnline } from "./helpers/is-online";
import { isWriteable } from "./helpers/is-writeable";
import { makeDir } from "./helpers/make-dir";
import type { RepoInfo } from "./helpers/repo";
import { downloadAndExtractRepo } from "./helpers/repo";

export class DownloadError extends Error {}

export const createApp = async ({
  appPath,
  packageManager,
}: {
  appPath: string;
  packageManager: PackageManager;
}): Promise<void> => {
  const repo: RepoInfo = {
    username: "strangelove-ventures",
    branch: "dev",
    name: "graz",
    filePath: "templates/default",
  };

  const root = path.resolve(appPath);

  if (!(await isWriteable(path.dirname(root)))) {
    console.error("The application path is not writable, please check folder permissions and try again.");
    console.error("It is likely you do not have write permissions for this folder.");
    process.exit(1);
  }

  const appName = path.basename(root);

  await makeDir(root);
  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  const useYarn = packageManager === "yarn";
  const isOnline = !useYarn || (await getOnline());
  const originalDirectory = process.cwd();

  console.log(`Creating a cosmos frontend in ${chalk.green(root)}.`);
  console.log();

  process.chdir(root);

  try {
    console.log(`Downloading files from repo. This might take a moment.`);
    console.log();

    await retry(() => downloadAndExtractRepo(root, repo), {
      retries: 3,
    });
  } catch (reason) {
    const isErrorLike = (err: unknown): err is { message: string } =>
      typeof err === "object" && err !== null && typeof (err as { message?: unknown }).message === "string";

    throw new DownloadError(isErrorLike(reason) ? reason.message : `${reason}`);
  }
  console.log("Installing packages. This might take a couple of minutes.");
  console.log();
  await install(root, null, { packageManager, isOnline });

  if (tryGitInit(root)) {
    console.log("Initialized a git repository.");
    console.log();
  }

  let cdpath: string;
  if (path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  console.log(`${chalk.green("Success!")} Created ${appName} at ${appPath}`);

  console.log("Inside that directory, you can run several commands:");
  console.log();
  console.log(chalk.cyan(`  ${packageManager} ${useYarn ? "" : "run "}dev`));
  console.log("    Starts the development server.");
  console.log();
  console.log(chalk.cyan(`  ${packageManager} ${useYarn ? "" : "run "}build`));
  console.log("    Builds the app for production.");
  console.log();
  console.log(chalk.cyan(`  ${packageManager} start`));
  console.log("    Runs the built app in production mode.");
  console.log();
  console.log("We suggest that you begin by typing:");
  console.log();
  console.log(chalk.cyan("  cd"), cdpath);
  console.log(`  ${chalk.cyan(`${packageManager} ${useYarn ? "" : "run "}dev`)}`);
};
