import fs from "node:fs/promises";
import os from "node:os";

import * as p from "@clack/prompts";
import { Command } from "commander";
import pMap from "p-map";

import { cloneRegistry } from "./clone-registry";
import { getChainPaths } from "./get-chain-paths";
import { makeRootSources } from "./make-root-sources";
import { makeSources } from "./make-sources";

const cli = async () => {
  const program = new Command();

  program
    .name("graz")
    .description("React hooks for Cosmos")
    .addHelpText("afterAll", "\nhttps://github.com/strangelove-ventures/graz\n");

  program
    .command("generate")
    .description('generate typescript chain definitions and export to "graz/chains"')
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
    .action(async (options) => {
      const customRegistry = options.registry as string | undefined;
      const mainnetFilter = options.mainnet as string[] | undefined;
      const testnetFilter = options.testnet as string[] | undefined;

      p.intro("graz generate");
      const s = p.spinner();

      // p.log.step("Cloning chain registry...");
      s.start(`Cloning chain registry`);
      await cloneRegistry(customRegistry);
      s.stop("Cloned chain registry ✅");

      // p.log.step("Retrieving chain paths...");
      s.start("Retrieving chain paths");
      const { mainnetPaths, testnetPaths } = await getChainPaths({ mainnetFilter, testnetFilter });
      s.stop("Retrieved chain paths ✅");

      // p.log.step("Generating chain sources...");
      s.start("Generating chain sources");
      await fs.rm("chains/", { recursive: true, force: true });
      await pMap([...mainnetPaths, ...testnetPaths], makeSources, {
        concurrency: Math.max(1, (os.cpus() || { length: 1 }).length - 1),
      });
      s.stop("Generated chain sources ✅");

      // p.log.step("Generating chain index...");
      s.start("Generating chain index");
      await makeRootSources({ mainnetPaths, testnetPaths });
      s.stop("Generated chain index ✅");

      p.outro('Generate complete! You can import `mainnetChains` and `testnetChains` from "graz/chains". 🎉');
    });

  await program.parseAsync();
};

void cli();
