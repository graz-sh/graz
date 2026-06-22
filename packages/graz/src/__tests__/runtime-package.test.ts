import { execFileSync } from "node:child_process";
import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

const packageRoot = path.resolve(__dirname, "../..");
const pnpmBin = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const runNode = (code: string) =>
  execFileSync(process.execPath, ["-e", code], {
    cwd: packageRoot,
    encoding: "utf-8",
  });

describe("published package runtime shape", () => {
  beforeAll(() => {
    execFileSync(pnpmBin, ["build"], {
      cwd: packageRoot,
      encoding: "utf-8",
    });
  }, 120_000);

  it("loads the CJS entry and keeps key root exports available", () => {
    const output = runNode(`
      const graz = require("./dist/index.js");
      const keys = ["connect", "disconnect", "useAccount", "useConnect", "WalletType"];
      for (const key of keys) {
        if (!(key in graz)) throw new Error("Missing export: " + key);
      }
      console.log(keys.map((key) => typeof graz[key]).join(","));
    `);

    expect(output.trim()).toBe("function,function,function,function,object");
  });

  it("loads the ESM entry and keeps key root exports available", () => {
    const output = runNode(`
      (async () => {
        const graz = await import("./dist/index.mjs");
        const keys = ["connect", "disconnect", "useAccount", "useConnect", "WalletType"];
        for (const key of keys) {
          if (!(key in graz)) throw new Error("Missing export: " + key);
        }
        console.log(keys.map((key) => typeof graz[key]).join(","));
      })();
    `);

    expect(output.trim()).toBe("function,function,function,function,object");
  });

  it("does not publish generated chain indexes", () => {
    const output = execFileSync(pnpmBin, ["pack", "--dry-run", "--json"], {
      cwd: packageRoot,
      encoding: "utf-8",
    });
    const pack = JSON.parse(output) as { files: Array<{ path: string }> };
    const files = pack.files.map((file) => file.path);

    expect(files).toContain("chains/index.js.stub");
    expect(files).toContain("chains/index.mjs.stub");
    expect(files).not.toContain("chains/index.js");
    expect(files).not.toContain("chains/index.mjs");
    expect(files).not.toContain("chains/index.ts");
  });
});
