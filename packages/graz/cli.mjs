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

Generate options:
  -b, --best            Set REST and RPC endpoint to best available nodes instead or first listed ones
  -M, --mainnet         Generate given mainnet chain paths seperated by commas (e.g. "axelar,cosmoshub,juno")
  -T, --testnet         Generate given testnet chain paths seperated by commas (e.g. "atlantic,bitcannadev,cheqdtestnet")
  --authz               Generate only authz compatible chains

https://github.com/strangelove-ventures/graz
`;

const args = arg({
  "--generate": Boolean,
  "-g": "--generate",

  "--authz": Boolean,
  "--best": Boolean,
  "--mainnet": String,
  "--testnet": String,
  "-b": "--best",
  "-M": "--mainnet",
  "-T": "--testnet",

  "--help": Boolean,
  "-h": "--help",
});

async function cli() {
  if (args["--help"]) {
    console.log(HELP_MESSAGE);
    return;
  }

  if (args["--generate"]) {
    await generate();
    return;
  }

  console.log(HELP_MESSAGE);
}

async function generate() {
  console.log(`⏳\tGenerating chain list from cosmos.directory...`);
  if (args["--authz"]) {
    console.log(`✍️\tDetected authz flag, generating only compatible chains...`);
  }
  if (args["--best"]) {
    console.log(`💁‍♂️\tDetected best flag, setting REST and RPC endpoints to best latency...`);
  }
  if (args["--mainnet"] || args["--testnet"]) {
    console.log(`🐙\tDetected chain filtering flag, generating only given chain paths...`);
  }

  const [mainnetRecord, testnetRecord] = await Promise.all([
    makeRecord(createClient(), { filter: args["--mainnet"] }),
    makeRecord(createTestnetClient(), { filter: args["--testnet"] }),
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
    fs.writeFile(chainsDir("index.mjs"), mjsContent.replace('"../dist"', '"../dist/index.mjs"'), { encoding: "utf-8" }),
    fs.writeFile(chainsDir("index.ts"), mjsContent, { encoding: "utf-8" }),
  ]);

  console.log('✨\tGenerate complete! You can import `mainnetChains` and `testnetChains` from "graz/chains".\n');
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
 * @param {{ filter?: string }} opts
 */
async function makeRecord(client, { filter = "" } = {}) {
  const paths = filter
    ? filter.split(",").map((path) => ({ path }))
    : await client.fetchChains().then((c) => c.chains.map(({ path }) => ({ path })));

  const chains = await pmap(paths, async (c) => client.fetchChain(c.path).then((x) => x.chain), { concurrency: 4 });

  /** @type {Record<string, import(".").ChainInfoWithPath>} */
  const record = {};

  chains.forEach((chain) => {
    try {
      if (args["--authz"] && !chain.params?.authz) {
        return;
      }

      const apis = args["--best"] ? chain.best_apis : chain.apis;
      if (!apis || !apis.rest?.[0] || !apis.rpc?.[0]) {
        throw new Error(`⚠️\t${chain.name} has no REST/RPC endpoints, skipping codegen...`);
      }

      if (!chain.assets) {
        throw new Error(`⚠️\t${chain.name} has no assets, skipping codegen...`);
      }
      const mainAsset = chain.assets[0];

      /** @type{import("@keplr-wallet/types").Currency} */
      const nativeCurrency = {
        coinDenom: mainAsset.denom_units[mainAsset.denom_units.length - 1].denom,
        coinMinimalDenom: mainAsset.denom_units[0].denom,
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
        rest: apis.rest[0].address || "",
        rpc: apis.rpc[0].address || "",
        bech32Config: Bech32Address.defaultBech32Config(chain.bech32_prefix),
        chainName: chain.chain_name,
        feeCurrencies: [nativeCurrency],
        stakeCurrency: nativeCurrency,
        bip44: {
          coinType: chain.slip44 ?? 0,
        },
      };
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
    }
  });
  return record;
}

void cli();
