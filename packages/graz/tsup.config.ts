import { defineConfig } from "tsup";

export default defineConfig(({ watch }) => [
  {
    clean: true,
    dts: true,
    entry: ["src/*.ts"],
    external: [/^@cosmjs\/.*/, /^@keplr-wallet\/.*/],
    format: ["cjs", "esm"],
  },
  {
    clean: true,
    dts: false,
    entry: ["src/cli/*.mjs", "src/cli/*.ts"],
    format: ["esm"],
    minify: !watch,
    outDir: "dist/cli/",
  },
]);
