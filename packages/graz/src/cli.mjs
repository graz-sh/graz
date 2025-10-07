#!/usr/bin/env node
// @ts-check
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { Bech32Address } from "@keplr-wallet/cosmos";
import arg from "arg";
import { createClient, createTestnetClient } from "cosmos-directory-client";
import pmap from "p-map";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isNumber = (char) => /^\d+$/.test(char);

const chainNaming = (name) => {
  if (isNumber(name[0])) {
    return `_${name}`;
  }
  return name;
};

const HELP_MESSAGE = `Usage: graz [options]

Options:

  -g, --generate        Generate chain definitions and export to "graz/chains"
  -h, --help            Show this help message

Generate options:
  -b, --best            Set REST and RPC endpoint to best available nodes instead or first listed ones
  -e, --endpoint <url>  Specify the endpoint URL to fetch chain information
  -M, --mainnet         Generate given mainnet chain paths seperated by commas (e.g. "axelar,cosmoshub,juno")
  -T, --testnet         Generate given testnet chain paths seperated by commas (e.g. "atlantic,bitcannadev,cheqdtestnet")
  --authz               Generate only authz compatible chains

https://github.com/graz-sh/graz
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

  "--endpoint": String,
  "-e": "--endpoint",
});

const cli = async () => {
  if (args["--help"]) {
    console.log(HELP_MESSAGE);
    return;
  }

  if (args["--generate"]) {
    await generate();
    return;
  }

  console.log(HELP_MESSAGE);
};

const generate = async () => {
  console.log("⏳\tGenerating chain list...");
  if (args["--authz"]) {
    console.log("✍️\tDetected authz flag, generating only compatible chains...");
  }
  if (args["--best"]) {
    console.log("💁‍♂️\tDetected best flag, setting REST and RPC endpoints to best latency...");
  }
  if (args["--mainnet"] || args["--testnet"]) {
    console.log("🐙\tDetected chain filtering flag, generating only given chain paths...");
  }

  /** @type {Record<string, import("@keplr-wallet/types").ChainInfo>} */
  let mainnetRecord;
  /** @type {Record<string, import("@keplr-wallet/types").ChainInfo>} */
  let testnetRecord;

  if (args["--endpoint"]) {
    console.log("🌐\tFetching chain information from specified endpoint");
    try {
      const response = await fetch(args["--endpoint"]);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      mainnetRecord = filterChains(data.mainnet, args["--mainnet"]);
      testnetRecord = filterChains(data.testnet, args["--testnet"]);
    } catch (error) {
      console.error(`❌\tFailed to fetch chain information: ${error.message}`);
      process.exit(1);
    }
  } else {
    [mainnetRecord, testnetRecord] = await Promise.all([
      makeRecord(createClient(), { filter: args["--mainnet"] }),
      makeRecord(createTestnetClient(), { filter: args["--testnet"] }),
    ]);
  }

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
};

/**
 * @param {Record<string, import("@keplr-wallet/types").ChainInfo>} chains
 * @param {string | undefined} filter
 * @returns {Record<string, import("@keplr-wallet/types").ChainInfo>}
 */
const filterChains = (chains, filter) => {
  if (!filter) return chains;
  const filterPaths = new Set(filter.split(","));
  return Object.fromEntries(Object.entries(chains).filter(([path]) => filterPaths.has(path)));
};

/** @param {string[]} args */
const chainsDir = (...args) => path.resolve(__dirname, "../chains", ...args);

/**
 * @param {Record<string, import("@keplr-wallet/types").ChainInfo>} record
 * @param {Record<string, boolean>} opts
 */
const makeChainMap = (record, { testnet = false } = {}) =>
  Object.keys(record)
    .map((k) => `  ${chainNaming(k)}: ${chainNaming(k)},`)
    .join("\n");

/**
 * @param {Record<string, import("@keplr-wallet/types").ChainInfo>} record
 * @param {Record<string, boolean>} opts
 */
const makeDefs = (record, { mjs = false, testnet = false } = {}) =>
  Object.entries(record)
    .map(([k, v]) => {
      const jsVariable = `${chainNaming(k)}`;
      const jsChainInfo = JSON.stringify(v, null, 2);
      return `${mjs ? "export " : ""}const ${jsVariable} = defineChainInfo(${jsChainInfo});\n`;
    })
    .join("");

/**
 * @param {Record<string, import("@keplr-wallet/types").ChainInfo>} record
 * @param {Record<string, boolean>} opts
 */
const makeExports = (record, { testnet = false } = {}) =>
  Object.keys(record)
    .map((k) => `  ${chainNaming(k)},`)
    .join("\n");

/**
 * @param {import("cosmos-directory-client").DirectoryClient} client
 * @param {{ filter?: string }} opts
 */
const makeRecord = async (client, { filter = "" } = {}) => {
  let paths;
  if (filter) {
    paths = filter.split(",").map((path) => ({ path }));
  } else {
    try {
      const chainsResponse = await client.fetchChains();
      paths = chainsResponse.chains.map(({ path }) => ({ path }));
    } catch (error) {
      console.error(`❌\tFailed to fetch chains list: ${error.message}`);
      return {};
    }
  }

  const chains = await pmap(
    paths,
    async (c) => {
      try {
        const result = await client.fetchChain(c.path);
        return result.chain;
      } catch (error) {
        console.error(`❌\tFailed to fetch chain "${c.path}": ${error.message}`);
        return null;
      }
    },
    { concurrency: 4 },
  );

  // Filter out failed fetches
  const validChains = chains.filter((chain) => chain !== null);

  /** @type {Record<string, import("@keplr-wallet/types").ChainInfo>} */
  const record = {};

  validChains.forEach((chain) => {
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

      const feeCurrencies = chain.fees?.fee_tokens.map((token) => {
        const isGasPriceStepAvailable = token.low_gas_price && token.average_gas_price && token.high_gas_price;

        if (isGasPriceStepAvailable) {
          return {
            coinDenom:
              chain.assets?.find((asset) => asset.denom === token.denom)?.denom_units.at(-1)?.denom || token.denom,
            coinMinimalDenom:
              chain.assets?.find((asset) => asset.denom === token.denom)?.denom_units[0]?.denom || token.denom,
            coinDecimals: Number(chain.assets?.find((asset) => asset.denom === token.denom)?.decimals),
            coinGeckoId: chain.assets?.find((asset) => asset.denom === token.denom)?.coingecko_id || undefined,
            gasPriceStep: {
              low: Number(token.low_gas_price),
              average: Number(token.average_gas_price),
              high: Number(token.high_gas_price),
            },
          };
        }
        return {
          coinDenom:
            chain.assets?.find((asset) => asset.denom === token.denom)?.denom_units.at(-1)?.denom || token.denom,
          coinMinimalDenom:
            chain.assets?.find((asset) => asset.denom === token.denom)?.denom_units[0]?.denom || token.denom,
          coinDecimals: Number(chain.assets?.find((asset) => asset.denom === token.denom)?.decimals),
          coinGeckoId: chain.assets?.find((asset) => asset.denom === token.denom)?.coingecko_id || undefined,
        };
      });

      if (!feeCurrencies) {
        throw new Error(`⚠️\t${chain.name} has no fee currencies, skipping codegen...`);
      }

      record[chain.path] = {
        chainId: chain.chain_id,
        currencies: chain.assets.map((asset) => ({
          coinDenom: asset.denom_units[asset.denom_units.length - 1].denom,
          coinMinimalDenom: asset.denom_units[0].denom,
          coinDecimals: asset.denom_units[asset.denom_units.length - 1].exponent,
          coinGeckoId: asset.coingecko_id,
        })),
        rest: apis.rest[0].address || "",
        rpc: apis.rpc[0].address || "",
        bech32Config: Bech32Address.defaultBech32Config(chain.bech32_prefix),
        chainName: chain.chain_name,
        feeCurrencies,
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
};

void cli();
