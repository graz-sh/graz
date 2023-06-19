import { defineConfig } from "tsup";

export default defineConfig(({ watch }) => [
  {
    clean: true,
    dts: true,
    entry: ["src/*.ts"],
    external: [/^@cosmjs\/.*/, /^@keplr-wallet\/.*/],
    format: ["cjs", "esm"],
    minify: !watch,
    treeshake: true,
  },
  {
    // https://github.com/evanw/esbuild/issues/1921#issuecomment-1491470829
    banner: {
      js: /* js */ `import{createRequire as $tsup_createRequire}from"module";const require=$tsup_createRequire(import.meta.url);`,
    },
    clean: true,
    dts: false,
    entry: ["src/cli/index.ts"],
    format: ["esm"],
    minify: !watch,
    outDir: "dist/cli/",
    shims: true,
    treeshake: true,
  },
]);
