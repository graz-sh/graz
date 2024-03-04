import { defineConfig } from "tsup";

export default defineConfig(({ watch }) => ({
  cjsInterop: true,
  clean: !watch,
  dts: true,
  entry: ["src/*.ts"],
  format: ["cjs", "esm"],
  minify: !watch,
  shims: true,
  splitting: true,
  treeshake: true,
}));
