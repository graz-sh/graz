import type { Options } from "tsup";
import { defineConfig } from "tsup";

const defaultOptions: Options = {
  cjsInterop: true,
  clean: true,
  dts: true,
  format: ["cjs", "esm"],
  shims: true,
  splitting: true,
  treeshake: true,
};

export default defineConfig(({ watch }) => [
  {
    ...defaultOptions,
    entry: ["src/*.ts"],
    external: [/^@cosmjs\/.*/, /^@keplr-wallet\/.*/],
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
