import { defineConfig } from "tsup";

import { devDependencies } from "./package.json";

export default defineConfig(({ watch }) => ({
  clean: !watch,
  dts: true,
  external: [...Object.keys(devDependencies), /^@chakra-ui\/.+/],
  entry: ["src/*.ts"],
  format: ["cjs", "esm"],
  inject: ["./inject-react.js"],
}));
