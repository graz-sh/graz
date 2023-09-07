import type { Options } from "tsup";
import { defineConfig } from "tsup";

const defaultOptions: Options = {
  cjsInterop: true,
  clean: true,
  format: ["cjs", "esm"],
  shims: true,
  splitting: true,
  treeshake: true,
};

export default defineConfig(({ watch }) => [
  {
    ...defaultOptions,
    dts: {
      banner: '/// <reference types="../types/global" />',
    },
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    minify: !watch,
  },
  {
    ...defaultOptions,
    dts: false,
    entry: ["src/cli.mjs"],
    format: ["cjs"],
    minify: !watch,
  },
]);
