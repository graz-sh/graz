import type { AppCurrency } from "@keplr-wallet/types";

import type { Dictionary } from "../types/core";
import { axelar } from "./axelar";
import { cosmoshub } from "./cosmoshub";
import { crescentTestnet } from "./crescent-testnet";
import { juno } from "./juno";
import { osmosis } from "./osmosis";
import { osmosisTestnet } from "./osmosis-testnet";
import { sommelier } from "./sommelier";

export interface GrazChain {
  chainId: string;
  currencies: AppCurrency[];
  rest: string;
  rpc: string;
  rpcHeaders?: Dictionary;
  gas?: {
    price: string;
    denom: string;
  };
}

export function defineChains<T extends Record<string, GrazChain>>(chains: T) {
  return chains;
}

export const mainnetChains = defineChains({
  cosmos: cosmoshub,
  juno,
  osmosis,
  axelar,
  sommelier,
});

export const mainnetChainsArray = [cosmoshub, juno, osmosis];

export const testnetChains = defineChains({
  osmosis: osmosisTestnet,
  crescent: crescentTestnet,
});

export const testnetChainsArray = [osmosisTestnet];
