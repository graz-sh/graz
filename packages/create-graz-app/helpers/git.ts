import { execSync } from "node:child_process";
import path from "node:path";

import { rimraf } from "rimraf";

const isInGitRepository = (): boolean => {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch (_) {
    return false;
  }
};
const isInMercurialRepository = (): boolean => {
  try {
    execSync("hg --cwd . root", { stdio: "ignore" });
    return true;
  } catch (_) {
    return false;
  }
};

export const tryGitInit = (root: string): boolean => {
  let didInit = false;
  try {
    execSync("git --version", { stdio: "ignore" });
    if (isInGitRepository() || isInMercurialRepository()) {
      return false;
    }

    execSync("git init", { stdio: "ignore" });
    didInit = true;

    execSync("git checkout -b main", { stdio: "ignore" });

    execSync("git add -A", { stdio: "ignore" });

    // execSync('git commit -m "Initial commit from create-graz-app"', {
    //   stdio: "ignore",
    // });
    return true;
  } catch (e) {
    if (didInit) {
      try {
        rimraf.sync(path.join(root, ".git"));
      } catch (_) {
        return false;
      }
    }
    return false;
  }
};
