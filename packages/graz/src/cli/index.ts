// @ts-check

import fs from "node:fs/promises";
import os from "node:os";

import * as p from "@clack/prompts";
import { Command } from "commander";
import type { Format } from "esbuild";
import pMap from "p-map";

import { cloneRegistry } from "./clone-registry";
import { getChainPaths } from "./get-chain-paths";
import { makeRootSources } from "./make-root-sources";
import { makeSources } from "./make-sources";
import { transpileSources } from "./transpile-sources";

const cli = async () => {
  const program = new Command();

  program
    .name("graz")
    .description("React hooks for Cosmos")
    .addHelpText("afterAll", "\nhttps://github.com/strangelove-ventures/graz\n");

  program
    .command("generate")
    .description('generate chain definitions and export to "graz/chains"')
    .option(
      "-R, --registry <url>",
      "specify a custom chain registry namespace (e.g. org/repo, github:org/repo, gitlab:org/repo)",
    )
    .option(
      "-M, --mainnet <chainPaths...>",
      'generate given mainnet chain paths separated by spaces (e.g. "axelar cosmoshub juno")',
    )
    .option(
      "-T, --testnet <chainPaths...>",
      'generate given testnet chain paths separated by spaces (e.g. "atlantic bitcannadev cheqdtestnet")',
    )
    .option("--format <format>", "specify javascript module format: cjs, esm (defaults to cjs)")
    .action(async (options) => {
      const customRegistry = options.registry as string | undefined;
      const mainnetFilter = options.mainnet as string[] | undefined;
      const testnetFilter = options.testnet as string[] | undefined;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const jsFormat: Format = options.format === "esm" || options.format === "cjs" ? options.format : "cjs";

      p.intro("graz generate");
      const s = p.spinner();

      s.start(`Cloning chain registry`);
      await cloneRegistry(customRegistry);
      s.stop("Cloned chain registry ✅");

      s.start("Retrieving chain paths");
      const { mainnetPaths, testnetPaths } = await getChainPaths({ mainnetFilter, testnetFilter });
      s.stop("Retrieved chain paths ✅");

      s.start("Generating chain sources");
      await fs.rm("chains/", { recursive: true, force: true });
      await pMap([...mainnetPaths, ...testnetPaths], makeSources, {
        concurrency: Math.max(1, (os.cpus() || { length: 1 }).length - 1),
      });
      s.stop("Generated chain sources ✅");

      s.start("Generating chain index");
      await makeRootSources({ mainnetPaths, testnetPaths });
      s.stop("Generated chain index ✅");

      if (jsFormat === "cjs") {
        s.start("Transpiling javascript esm sources to cjs");
        await transpileSources("cjs");
        s.stop("Transpiled sources ✅");
      }

      p.outro('Generate complete! You can import `mainnetChains` and `testnetChains` from "graz/chains". 🎉');
    });

  await program.parseAsync();
};

void cli();
