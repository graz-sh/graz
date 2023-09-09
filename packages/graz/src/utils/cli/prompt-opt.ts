import * as fs from "node:fs";

import type { GenerateOptions, ParsedGenerateOptions } from "wadesta";

import * as p from "./clack";

export const DEFAULT_OUT_DIR = "./generated/chains";
export const DEFAULT_REGISTRY_SRC = "github:cosmos/chain-registry";
export const DEFAULT_REGISTRY_TMP_PREFIX = "wadesta-registry";

type ClackGenerateOptions = {
  [K in keyof GenerateOptions]: (NonNullable<GenerateOptions[K]> extends string ? string : GenerateOptions[K]) | symbol;
};

export const promptParsedOptions = async (
  args: ParsedGenerateOptions,
  overrides: GenerateOptions = {},
): Promise<GenerateOptions> => {
  if (!args.isActuallyInteractive) return args;
  if (overrides.interactive === false || args.interactive === false) return args;
  return p.group<ClackGenerateOptions>(
    {
      registry: async () => {
        if ("registry" in overrides) return overrides.registry;
        if (args.registrySrc) return "local";
        if (args.registry) return args.registry;
        return p.text({
          message: "Enter a chain registry source",
          placeholder: DEFAULT_REGISTRY_SRC,
          defaultValue: DEFAULT_REGISTRY_SRC,
        });
      },
      registrySrc: async ({ results }) => {
        if ("registrySrc" in overrides) return overrides.registrySrc;
        if (args.registrySrc) return args.registrySrc;
        if (results.registry !== "local") return;
        return p.text({
          message: "Enter local registry path",
          placeholder: "./path/to/registry",
          validate: (val) => {
            try {
              fs.lstatSync(val);
            } catch {
              return "Enter a valid path";
            }
          },
        });
      },
      outDir: async () => {
        if ("outDir" in overrides) return overrides.outDir;
        if (args.outDir) return args.outDir;
        return p.text({
          message: "Enter generated client output directory",
          placeholder: DEFAULT_OUT_DIR,
          defaultValue: DEFAULT_OUT_DIR,
        });
      },
      merged: async () => {
        if ("merged" in overrides) return overrides.merged;
        if (args.merged) return args.merged;
        return p.confirm({
          message: "Merge variables? (true: `chainIds`, false: `mainnetChainIds`, `testnetChainIds`, and `chainIds`)",
          active: "merge",
          inactive: "do not merge",
        });
      },
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(1);
      },
    },
  );
};
