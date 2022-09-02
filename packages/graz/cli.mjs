#!/usr/bin/env node
// @ts-check
import { Bech32Address } from "@keplr-wallet/cosmos";
import arg from "arg";
import { createClient, createTestnetClient } from "cosmos-directory-client";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

import pmap from "./compiled/p-map/index.mjs";

const HELP_MESSAGE = `Usage: graz [options]

Options:

  -g, --generate        Generate chain definitions and export to "graz/chains"
  -h, --help            Show this help message

https://github.com/strangelove-ventures/graz
`;

async function cli() {
  try {
    const args = arg({
      "--generate": Boolean,
      "-g": "--generate",

      "--help": Boolean,
      "-h": "--help",
    });

    if (args["--help"]) {
      console.log(HELP_MESSAGE);
      return;
    }

    if (args["--generate"]) {
      await generate();
      return;
    }

    console.log(HELP_MESSAGE);
  } catch (error) {
    console.error(String(error));
  }
}

async function generate() {
  console.log(`⏳ Generating chain list from cosmos.directory ...`);

  const [mainnetRecord, testnetRecord] = await Promise.all([
    makeRecord(createClient()),
    makeRecord(createTestnetClient()),
  ]);

  const [jsStub, mjsStub] = await Promise.all([
    fs.readFile(chainsDir("index.js.stub"), { encoding: "utf-8" }),
    fs.readFile(chainsDir("index.mjs.stub"), { encoding: "utf-8" }),
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
    fs.writeFile(chainsDir("index.js"), jsContent, { encoding: "utf-8" }),
    fs.writeFile(chainsDir("index.mjs"), mjsContent, { encoding: "utf-8" }),
    fs.writeFile(chainsDir("index.ts"), mjsContent, { encoding: "utf-8" }),
  ]);

  console.log('✨ Generate complete! You can import `mainnetChains` and `testnetChains` from "graz/chains".');
}

/** @param {string[]} args */
function chainsDir(...args) {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "chains", ...args);
}

/**
 * @param {Record<string, import(".").ChainInfoWithPath>} record
 * @param {Record<string, boolean>} opts
 */
function makeChainMap(record, { testnet = false } = {}) {
  return Object.keys(record)
    .map((k) => `  ${k}: ${k}${testnet ? "Testnet" : ""},`)
    .join("\n");
}

/**
 * @param {Record<string, import(".").ChainInfoWithPath>} record
 * @param {Record<string, boolean>} opts
 */
function makeDefs(record, { mjs = false, testnet = false } = {}) {
  return Object.entries(record)
    .map(([k, v]) => {
      const jsVariable = `${k}${testnet ? "Testnet" : ""}`;
      const jsChainInfo = JSON.stringify(v, null, 2);
      return `${mjs ? "export " : ""}const ${jsVariable} = defineChainInfo(${jsChainInfo});\n`;
    })
    .join("");
}

/**
 * @param {Record<string, import(".").ChainInfoWithPath>} record
 * @param {Record<string, boolean>} opts
 */
function makeExports(record, { testnet = false } = {}) {
  return Object.keys(record)
    .map((k) => `  ${k}${testnet ? "Testnet" : ""},`)
    .join("\n");
}

/**
 * @param {import("cosmos-directory-client").DirectoryClient} client
 */
async function makeRecord(client) {
  const { chains } = await client.fetchChains();

  const resolvedChains = await pmap(chains, async (c) => client.fetchChain(c.path).then((x) => x.chain), {
    concurrency: 8,
  });

  const filteredChains = resolvedChains.filter((chain) => (chain.assets ? chain.assets.length > 0 : false));

  /** @type {Record<string, import(".").ChainInfoWithPath>} */
  const record = {};
  filteredChains.forEach((chain) => {
    try {
      if (!chain.assets) {
        throw new Error(`${chain.name} has no assets, skipping codegen...`);
      }

      const mainAsset = chain.assets[0];

      /** @type{import("@keplr-wallet/types").Currency} */
      const nativeChainCoinRes = {
        coinDenom: mainAsset.denom_units[mainAsset.denom_units.length - 1].denom || "",
        coinMinimalDenom: mainAsset.denom_units[0].denom || "",
        coinDecimals: mainAsset.denom_units[mainAsset.denom_units.length - 1].exponent,
        coinGeckoId: mainAsset.coingecko_id,
      };

      record[chain.path] = {
        chainId: chain.chain_id,
        currencies: chain.assets.map((asset) => ({
          coinDenom: asset.denom_units[asset.denom_units.length - 1].denom,
          coinMinimalDenom: asset.denom_units[0].denom,
          coinDecimals: asset.denom_units[asset.denom_units.length - 1].exponent,
          coinGeckoId: asset.coingecko_id,
        })),
        path: chain.path,
        rest: chain.best_apis.rest[0]?.address || "",
        rpc: chain.best_apis.rpc[0]?.address || "",
        bech32Config: Bech32Address.defaultBech32Config(chain.bech32_prefix),
        chainName: chain.chain_name,
        feeCurrencies: [nativeChainCoinRes],
        stakeCurrency: nativeChainCoinRes,
        bip44: {
          coinType: chain.slip44 || 0,
        },
      };
    } catch (error) {
      console.error(error);
    }
  });
  return record;
}

void cli();
