import type { AppCurrency, ChainInfo } from "@keplr-wallet/types";

import type { Dictionary } from "../types/core";
import type { ChainInfoWithPath } from "../types/keplr";
import { axelar } from "./mainnet/axelar";
import { cosmoshub } from "./mainnet/cosmoshub";
import { juno } from "./mainnet/juno";
import { osmosis } from "./mainnet/osmosis";
import { sommelier } from "./mainnet/sommelier";
import { crescentTestnet } from "./testnet/crescent";
import { junoTestnet } from "./testnet/juno";
import { osmosisTestnet } from "./testnet/osmosis";

export interface GrazChain {
  chainId: string;
  currencies: AppCurrency[];
  path?: string;
  rest: string;
  rpc: string;
  rpcHeaders?: Dictionary;
  gas?: {
    price: string;
    denom: string;
  };
}

/**
 * Helper function to define chain information records (key values).
 *
 * This function does not do anything special else than providing type safety
 * when defining chain informations.
 *
 * @example
 * ```ts
 * import { connect, defineChains } from "graz";
 *
 * const myChains = defineChains({
 *    cosmoshub: {
 *      rpc: "https://rpc.cosmoshub.strange.love",
 *      rest: "https://api.cosmoshub.strange.love",
 *      chainId: "cosmoshub-4",
 *      ...
 *    },
 * });
 *
 * connect(myChains.cosmoshub);
 * ```
 */
export function defineChains<T extends Dictionary<GrazChain>>(chains: T): T {
  return chains;
}

/**
 * Helper function to define chain information object.
 *
 * This function does not do anything special else than providing type safety
 * when defining chain information.
 *
 * @example
 * ```ts
 * import { connect, defineChain } from "graz";
 *
 * const cosmoshub = defineChain({
 *    rpc: "https://rpc.cosmoshub.strange.love",
 *    rest: "https://api.cosmoshub.strange.love",
 *    chainId: "cosmoshub-4",
 *    ...
 * });
 *
 * connect(cosmoshub);
 * ```
 */
export function defineChain<T extends GrazChain>(chain: T): T {
  return chain;
}

/**
 * Helper function to define Keplr's `ChainInfo` object.
 *
 * This function does not do anything special else than providing type safety
 * when defining chain information.
 *
 * @example
 * ```ts
 * import { defineChainInfo } from "graz";
 *
 * const cosmoshub = defineChainInfo({
 *   chainId: "cosmoshub-4",
 *   currencies: [ ... ],
 *   path: "cosmoshub",
 *   rest: "https://lcd-cosmoshub.blockapsis.com/",
 *   rpc: "https://rpc-cosmoshub.ecostake.com/",
 *   ...
 * });
 * ```
 */
export function defineChainInfo<T extends ChainInfo | ChainInfoWithPath>(chain: T): T {
  return chain;
}

/**
 * Provided mainnet chains
 *
 * @example
 * ```ts
 * import { connect, mainnetChains } from "graz";
 * connect(mainnetChains.cosmos);
 * ```
 *
 * @see {@link testnetChains}
 */
export const mainnetChains = defineChains({
  axelar,
  /** @deprecated kept for compatibilty purposes; change to `mainnetChains.cosmoshub` */
  cosmos: cosmoshub,
  cosmoshub,
  juno,
  osmosis,
  sommelier,
});

/**
 * Arary version on {@link mainnetChains}
 *
 * @see {@link mainnetChains}
 */
export const mainnetChainsArray = [axelar, cosmoshub, juno, osmosis, sommelier];

/**
 * Provided testnet chains
 *
 * @example
 * ```ts
 * import { connect, testnetChains } from "graz";
 * connect(testnetChains.osmosis);
 * ```
 *
 * @see {@link mainnetChains}
 */
export const testnetChains = defineChains({
  crescent: crescentTestnet,
  juno: junoTestnet,
  osmosis: osmosisTestnet,
});

/**
 * Arary version on {@link testnetChains}
 *
 * @see {@link testnetChains}
 */
export const testnetChainsArray = [crescentTestnet, junoTestnet, osmosisTestnet];
