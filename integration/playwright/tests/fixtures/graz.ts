import { expect, test as base } from "@playwright/test";

import type { GrazE2EConfig } from "../../src/e2e-wallet/types";

const localMnemonic =
  "test test test test test test test test test test test junk";
const localMnemonicAddress = "cosmos15yk64u7zc9g9k2yr2wmzeva5qgwxps6yxj00e7";

const readConfig = (): GrazE2EConfig => {
  const mnemonic = process.env.GRAZ_E2E_WALLET_MNEMONIC || (!process.env.CI ? localMnemonic : "");
  if (!mnemonic) {
    throw new Error("GRAZ_E2E_WALLET_MNEMONIC is required in CI");
  }

  let rpcHeaders: Record<string, string> | undefined;
  if (process.env.GRAZ_E2E_RPC_HEADERS_JSON) {
    try {
      rpcHeaders = JSON.parse(process.env.GRAZ_E2E_RPC_HEADERS_JSON) as Record<string, string>;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse GRAZ_E2E_RPC_HEADERS_JSON as a JSON object: ${message}`);
    }
  }

  return {
    mnemonic,
    chain: {
      chainId: process.env.GRAZ_E2E_CHAIN_ID ?? "cosmoshub-4",
      chainName: process.env.GRAZ_E2E_CHAIN_NAME ?? "Cosmos Hub",
      rpc: process.env.GRAZ_E2E_RPC_URL ?? "https://cosmos-rpc.publicnode.com",
      rest: process.env.GRAZ_E2E_REST_URL ?? "https://rest.cosmos.directory/cosmoshub",
      bech32Prefix: process.env.GRAZ_E2E_BECH32_PREFIX ?? "cosmos",
      denom: process.env.GRAZ_E2E_DENOM ?? "uatom",
      displayDenom: process.env.GRAZ_E2E_DISPLAY_DENOM ?? "ATOM",
      gasPrice: process.env.GRAZ_E2E_GAS_PRICE ?? "0.025",
      rpcHeaders,
      expectedAddress:
        process.env.GRAZ_E2E_EXPECTED_ADDRESS ||
        (mnemonic === localMnemonic ? localMnemonicAddress : undefined),
      enableTx: process.env.GRAZ_E2E_ENABLE_TX === "1",
      recipientAddress: process.env.GRAZ_E2E_RECIPIENT_ADDRESS || undefined,
    },
  };
};

type GrazFixtures = {
  grazConfig: GrazE2EConfig;
};

export const test = base.extend<GrazFixtures>({
  grazConfig: [
    async ({ baseURL: _baseURL }, run) => {
      await run(readConfig());
    },
    { option: true },
  ],
  page: async ({ page, grazConfig }, run) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      consoleErrors.push(error.message);
    });
    await page.addInitScript((config) => {
      window.__GRAZ_E2E_CONFIG__ = config;
    }, grazConfig);

    await run(page);

    expect(consoleErrors).toEqual([]);
  },
});

export { expect };
