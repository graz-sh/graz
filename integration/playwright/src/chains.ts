import { defineChainInfo } from "graz";
import type { ChainInfo } from "@keplr-wallet/types";

import type { GrazE2EChainConfig } from "./e2e-wallet/types";

const defaultConfig: GrazE2EChainConfig = {
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
  rpc: "https://cosmos-rpc.publicnode.com",
  rest: "https://rest.cosmos.directory/cosmoshub",
  bech32Prefix: "cosmos",
  denom: "uatom",
  displayDenom: "ATOM",
  gasPrice: "0.025",
};

export const getE2EConfig = (): GrazE2EChainConfig => {
  return window.__GRAZ_E2E_CONFIG__?.chain ?? defaultConfig;
};

export const getE2EChainInfo = (): ChainInfo => {
  const config = getE2EConfig();

  return defineChainInfo({
    chainId: config.chainId,
    chainName: config.chainName,
    rpc: config.rpc,
    rest: config.rest,
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: config.bech32Prefix,
      bech32PrefixAccPub: `${config.bech32Prefix}pub`,
      bech32PrefixValAddr: `${config.bech32Prefix}valoper`,
      bech32PrefixValPub: `${config.bech32Prefix}valoperpub`,
      bech32PrefixConsAddr: `${config.bech32Prefix}valcons`,
      bech32PrefixConsPub: `${config.bech32Prefix}valconspub`,
    },
    currencies: [
      {
        coinDenom: config.displayDenom,
        coinMinimalDenom: config.denom,
        coinDecimals: 6,
      },
    ],
    feeCurrencies: [
      {
        coinDenom: config.displayDenom,
        coinMinimalDenom: config.denom,
        coinDecimals: 6,
        gasPriceStep: {
          low: Number(config.gasPrice),
          average: Number(config.gasPrice),
          high: Number(config.gasPrice) * 2,
        },
      },
    ],
    stakeCurrency: {
      coinDenom: config.displayDenom,
      coinMinimalDenom: config.denom,
      coinDecimals: 6,
    },
    features: ["stargate"],
  });
};
