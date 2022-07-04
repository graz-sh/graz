import type { ChainInfo } from "@keplr-wallet/types";

import { useWadestaStore } from "../store";
import { cosmoshub } from "./cosmoshub";

export const defaultChains: ChainInfo[] = [cosmoshub];

/**
 *
 * get default chains and custom provided chains
 */
export const getAllChains = () => {
  const { chains } = useWadestaStore.getState();
  if (!chains) return defaultChains;
  const chainsSet = new Set(chains.map((d) => d.chainId));
  // remove duplicate on default chains (priority on custom provided chains)
  const merged = [...chains, ...defaultChains.filter((d) => !chainsSet.has(d.chainId))];
  return merged;
};

export const chain = {
  cosmoshub,
};
