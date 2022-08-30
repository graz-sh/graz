import type { AppCurrency } from "@keplr-wallet/types";

import type { Dictionary } from "../types/core";
import { axelar } from "./axelar";
import { cosmoshub } from "./cosmoshub";
import { crescentTestnet } from "./crescent-testnet";
import { juno } from "./juno";
import { junoTestnet } from "./juno-testnet";
import { osmosis } from "./osmosis";
import { osmosisTestnet } from "./osmosis-testnet";
import { sommelier } from "./sommelier";

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
