import type { DirectoryClient } from "cosmos-directory-client";
import { createClient, createTestnetClient } from "cosmos-directory-client";
import * as fs from "fs/promises";
import * as path from "path";

import type { GrazChain } from "../chains";

export async function generate() {
  console.log(`⏳ Generating chain list from cosmos.directory ...`);

  const [mainnetRecord, testnetRecord] = await Promise.all([
    makeRecord(createClient()),
    makeRecord(createTestnetClient()),
  ]);

  const [jsStub, mjsStub] = await Promise.all([
    fs.readFile(cwd("chains/index.js.stub"), { encoding: "utf-8" }),
    fs.readFile(cwd("chains/index.mjs.stub"), { encoding: "utf-8" }),
  ]);

  const jsContent = jsStub
    .replace("/* REPLACE_MAINNET_DEFS */", makeDefs(mainnetRecord))
    .replace("/* REPLACE_TESTNET_DEFS */", makeDefs(testnetRecord, { testnet: true }))
    .replace("/* REPLACE_MAINNET_CHAINS */", makeChainMap(mainnetRecord))
    .replace("/* REPLACE_TESTNET_CHAINS */", makeChainMap(testnetRecord, { testnet: true }))
    .replace("/* REPLACE_MAINNET_CHAINS_ARRAY */", makeExports(mainnetRecord))
    .replace("/* REPLACE_TESTNET_CHAINS_ARRAY */", makeExports(testnetRecord, { testnet: true }))
    .replace("/* REPLACE_MAINNET_EXPORTS */", makeExports(mainnetRecord))
    .replace("/* REPLACE_TESTNET_EXPORTS */", makeExports(testnetRecord, { testnet: true }))
    .replace(/"(.+)":/g, "$1:")
    .trim();

  const mjsContent = mjsStub
    .replace("/* REPLACE_MAINNET_DEFS */", makeDefs(mainnetRecord, { mjs: true }))
    .replace("/* REPLACE_TESTNET_DEFS */", makeDefs(testnetRecord, { mjs: true, testnet: true }))
    .replace("/* REPLACE_MAINNET_CHAINS */", makeChainMap(mainnetRecord))
    .replace("/* REPLACE_TESTNET_CHAINS */", makeChainMap(testnetRecord, { testnet: true }))
    .replace("/* REPLACE_MAINNET_CHAINS_ARRAY */", makeExports(mainnetRecord))
    .replace("/* REPLACE_TESTNET_CHAINS_ARRAY */", makeExports(testnetRecord, { testnet: true }))
    .replace(/"(.+)":/g, "$1:")
    .trim();

  await Promise.all([
    fs.writeFile(cwd("chains/index.js"), jsContent, { encoding: "utf-8" }),
    fs.writeFile(cwd("chains/index.mjs"), mjsContent, { encoding: "utf-8" }),
    fs.writeFile(cwd("chains/index.ts"), mjsContent, { encoding: "utf-8" }),
  ]);

  console.log('✨ Generate complete! You can import `mainnetChains` and `testnetChains` from "graz/chains".');
}

function cwd(...args: string[]) {
  return path.resolve(path.dirname(""), ...args);
}

function makeChainMap(record: Record<string, GrazChain>, { testnet = false } = {}) {
  return Object.keys(record)
    .map((k) => `  ${k}: ${k}${testnet ? "Testnet" : ""},`)
    .join("\n");
}

function makeDefs(record: Record<string, GrazChain>, { mjs = false, testnet = false } = {}) {
  return Object.entries(record)
    .map(([k, v]) => `${mjs ? "export " : ""}const ${k}${testnet ? "Testnet" : ""} = ${JSON.stringify(v, null, 2)};\n`)
    .join("");
}

function makeExports(record: Record<string, GrazChain>, { testnet = false } = {}) {
  return Object.keys(record)
    .map((k) => `  ${k}${testnet ? "Testnet" : ""},`)
    .join("\n");
}

async function makeRecord(client: DirectoryClient) {
  const { chains } = await client.fetchChains();

  const record: Record<string, GrazChain> = {};
  chains.forEach((chain) => {
    record[chain.path] = {
      chainId: chain.chain_id,
      currencies:
        chain.assets?.map((asset) => ({
          coinDenom: asset.denom_units[asset.denom_units.length - 1]!.denom,
          coinMinimalDenom: asset.denom_units[0]!.denom,
          coinDecimals: asset.denom_units[asset.denom_units.length - 1]!.exponent,
        })) || [],
      path: chain.path,
      rest: chain.best_apis.rest[0]?.address || "",
      rpc: chain.best_apis.rpc[0]?.address || "",
    };
  });

  return record;
}
