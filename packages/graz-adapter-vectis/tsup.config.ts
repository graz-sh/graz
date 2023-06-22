import { defineConfig } from "tsup";

export default defineConfig(({ watch }) => ({
  clean: !watch,
  dts: true,
  entry: ["src/*.ts"],
  format: ["cjs", "esm"],
  minify: !watch,
  minifyIdentifiers: !watch,
  minifySyntax: !watch,
  minifyWhitespace: !watch,
}));
