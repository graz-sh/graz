import type { Options } from "tsup";
import { defineConfig } from "tsup";

const defaultOptions: Options = {
  // Enable CommonJS interop for better compatibility
  cjsInterop: true,

  // Clean output directory before build
  clean: true,

  // Generate both CJS and ESM formats
  format: ["cjs", "esm"],

  // Add shims for __dirname, __filename, etc.
  shims: true,

  // Enable code splitting for better tree-shaking
  splitting: true,

  // Enable tree-shaking to remove unused code
  treeshake: {
    preset: "recommended",
  },

  // Target modern browsers/Node (React >=17 implies modern environment)
  target: "es2020",

  // Generate source maps for better debugging
  // Only generate source maps in watch mode to reduce package size
  sourcemap: false,

  // Platform targeting
  platform: "browser",

  // Skip node_modules bundling
  skipNodeModulesBundle: true,

  // Preserve module directives
  // keepNames: true,
};

export default defineConfig(({ watch }) => [
  // Main library bundle
  {
    ...defaultOptions,

    // Generate both .d.ts and .d.mts for proper TypeScript module resolution
    dts: {
      banner: '/// <reference types="../types/global" />',
      resolve: false, // Faster DTS generation, external types stay external
    },

    entry: ["src/index.ts"],

    // Externalize all peer dependencies and heavy dependencies
    external: [
      // Peer dependencies
      "react",
      "react-dom",
      "@tanstack/react-query",
      /^@cosmjs\/.*/,

      // Large dependencies that should remain external
      /^@keplr-wallet\/.*/,
      /^@walletconnect\/.*/,
      /^@getpara\/.*/,
      /^@vectis\/.*/,
      /^@dao-dao\/.*/,
      /^@cosmsnap\/.*/,
      /^@initia\/.*/,
      "zustand",
      "long",
      "cosmos-directory-client",
    ],

    // Minify in production with better compression
    minify: !watch && "terser",

    // Better output naming
    outExtension: ({ format }) => ({
      js: format === "esm" ? ".mjs" : ".js",
    }),

    // Provide build feedback
    onSuccess: watch ? undefined : "echo '✓ Main bundle built successfully'",
  },

  // CLI bundle
  {
    ...defaultOptions,

    // No TypeScript declarations for CLI
    dts: false,

    entry: ["src/cli.mjs"],

    // CLI is Node.js only
    format: ["cjs"],
    platform: "node",

    // Externalize Node.js built-ins and dependencies
    external: ["arg", "cosmos-directory-client"],

    minify: !watch,

    // Simpler output for CLI
    splitting: false,
    treeshake: true,

    outExtension: () => ({
      js: ".js",
    }),

    onSuccess: watch ? undefined : "echo '✓ CLI built successfully'",
  },
]);
