import type { AppCurrency } from "@keplr-wallet/types";

import type { Dictionary } from "../types/core";
import { cosmoshub } from "./cosmoshub";
import { juno } from "./juno";
import { osmosis } from "./osmosis";

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

export const defaultChains = defineChains({
  cosmos: cosmoshub,
  juno,
  osmosis,
});

export const defaultChainsArray = [cosmoshub, juno, osmosis];
