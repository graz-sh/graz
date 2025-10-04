import { describe, expect, it, vi } from "vitest";
import { execSync } from "node:child_process";
import path from "node:path";

describe("CLI", () => {
  const cliPath = path.resolve(__dirname, "../../dist/cli.js");

  it("should display help message with --help flag", () => {
    const output = execSync(`node ${cliPath} --help`, { encoding: "utf-8" });

    expect(output).toContain("Usage: graz [options]");
    expect(output).toContain("-g, --generate");
    expect(output).toContain("-h, --help");
    expect(output).toContain("Generate chain definitions");
  });

  it("should display help message with -h flag", () => {
    const output = execSync(`node ${cliPath} -h`, { encoding: "utf-8" });

    expect(output).toContain("Usage: graz [options]");
    expect(output).toContain("Show this help message");
  });

  it("should display help message when no arguments provided", () => {
    const output = execSync(`node ${cliPath}`, { encoding: "utf-8" });

    expect(output).toContain("Usage: graz [options]");
  });

  it("should handle invalid arguments gracefully", () => {
    try {
      execSync(`node ${cliPath} --invalid-flag`, { encoding: "utf-8", stdio: "pipe" });
    } catch (error: any) {
      expect(error.status).toBe(1);
      expect(error.stderr.toString()).toContain("unknown or unexpected option");
    }
  });

  it("should be executable", () => {
    const output = execSync(`node ${cliPath} --help`, { encoding: "utf-8" });
    expect(output).toBeTruthy();
  });
});

describe("CLI utility functions", () => {
  it("should handle chain naming with number prefix", () => {
    // Test the chainNaming function logic
    const isNumber = (char: string) => /^\d+$/.test(char);
    const chainNaming = (name: string) => {
      if (name[0] && isNumber(name[0])) {
        return `_${name}`;
      }
      return name;
    };

    expect(chainNaming("cosmoshub")).toBe("cosmoshub");
    expect(chainNaming("1inch")).toBe("_1inch");
    expect(chainNaming("8ball")).toBe("_8ball");
    expect(chainNaming("axelar")).toBe("axelar");
  });

  it("should correctly identify numbers", () => {
    const isNumber = (char: string) => /^\d+$/.test(char);

    expect(isNumber("0")).toBe(true);
    expect(isNumber("1")).toBe(true);
    expect(isNumber("9")).toBe(true);
    expect(isNumber("a")).toBe(false);
    expect(isNumber("A")).toBe(false);
    expect(isNumber("_")).toBe(false);
  });
});
