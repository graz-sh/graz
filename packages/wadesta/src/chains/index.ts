import type { AppCurrency } from "@keplr-wallet/types";

import { cosmoshub } from "./cosmoshub";

export interface WadestaChain {
  chainId: string;
  currencies: AppCurrency[];
  rest: string;
  rpc: string;
}

export function defineChains<T extends Record<string, WadestaChain>>(chains: T) {
  return chains;
}

export const defaultChains = defineChains({
  cosmos: cosmoshub,
});
