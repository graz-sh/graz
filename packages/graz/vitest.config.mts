import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    pool: "forks",
    // Temporarily exclude multi-chain tests due to Vitest 2.x bug with @keplr-wallet/types
    // See: https://github.com/vitest-dev/vitest/issues/...
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "**/createMultiChainAsyncFunction.test.ts",
      "**/createMultiChainFunction.test.ts",
      "**/multi-chain-consistency.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
