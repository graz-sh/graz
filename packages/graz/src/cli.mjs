#!/usr/bin/env node
// @ts-check

import path from "node:path";

import { cac } from "cac";
import { generate } from "wadesta";
import { parseOptions, withDefaultGenerateFlags } from "wadesta/cli";
import { GenerateEventEmitter } from "wadesta/events";

import * as p from "./utils/cli/clack";
import { promptParsedOptions } from "./utils/cli/prompt-opt";

const cli = cac("graz")
  .help()
  .version(process.env.WADESTA_VERSION || "0.0.0");

const cmd = withDefaultGenerateFlags(cli.command("generate", "Generate client"));

cmd.action(
  async (options) => {
    const parsed = parseOptions(options, {
      outDir: path.resolve(__dirname, "../chains"),
    });
    const { isActuallyInteractive } = parsed;

    isActuallyInteractive && p.intro("graz generate");

    const inputs = await promptParsedOptions(parsed);

    const emitter = new GenerateEventEmitter();
    if (isActuallyInteractive) {
      p.withSpinner((s) => {
        emitter.on("cloneRegistry", () => s.start("Loading registry"));
        emitter.on("cloneRegistryEnd", () => s.stop("✅ Loaded registry"));
      });
      p.withSpinner((s) => {
        emitter.on("clean", () => s.start("Cleaning output directory"));
        emitter.on("cleanEnd", () => s.stop("✅ Cleaned output directory"));
      });
      p.withSpinner((s) => {
        emitter.on("writeChains", () => s.start("Generating chain sources"));
        emitter.on("writeChainsEnd", () => s.stop("✅ Generated chain sources"));
      });
      p.withSpinner((s) => {
        emitter.on("writeRoot", () => s.start("Generating root sources"));
        emitter.on("writeRootEnd", () => s.stop("✅ Generated root sources"));
      });
    }

    await generate(inputs, emitter);

    isActuallyInteractive && p.outro(`🎉 Chain registry client generated at "graz/chains".`);
  },
  //
);

cli.command("").action(() => cli.outputHelp());

cli.parse();
