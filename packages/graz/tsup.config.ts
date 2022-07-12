import { defineConfig } from "tsup";

import packageJson from "./package.json";

export default defineConfig(({ watch }) => ({
  clean: !watch,
  dts: true,
  entry: ["src/*.ts"],
  external: [...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.peerDependencies)],
  format: ["cjs", "esm"],
  inject: ["./inject-react.js"],
  minify: !watch,
  minifyIdentifiers: !watch,
  minifySyntax: !watch,
  minifyWhitespace: !watch,
}));
