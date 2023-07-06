import { defineConfig } from "tsup";

import packageJson from "./package.json";

export default defineConfig(({ watch }) => ({
  clean: true,
  dts: true,
  entry: ["src/*.ts"],
  external: [
    ...Object.keys(packageJson.dependencies),
    ...Object.keys(packageJson.peerDependencies),
    /^@cosmjs\/.*/,
    /^@keplr-wallet\/.*/,
  ],
  format: ["cjs", "esm"],
  minify: false,
}));
