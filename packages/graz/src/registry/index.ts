import type { Asset, AssetList, Chain } from "../types/registry";

/**
 * Helper function to define chain.
 *
 * This function does not do anything special else than providing type safety
 * when defining chain information.
 *
 * @example
 * ```ts
 * import { defineAsset } from "graz";
 *
 * const atom = defineAsset({
 *   base: "uatom",
 *   display: "atom",
 *   symbol: "ATOM",
 *   ...
 * });
 * ```
 */
export const defineAsset = <T extends Asset>(asset: T): T => {
  return asset;
};

/**
 * Helper function to define chains asset list.
 *
 * This function does not do anything special else than providing type safety
 * when defining chain information.
 *
 * @example
 * ```ts
 * import { defineAssetList } from "graz";
 *
 * const assetlist = defineAssetList({
 *   chain_name: "cosmoshub",
 *   assets: [...]
 * });
 * ```
 */
export const defineAssetList = <T extends AssetList>(assetlist: T): T => {
  return assetlist;
};

/**
 * Helper function to define chain with registry compliant type.
 *
 * This function does not do anything special else than providing type safety
 * when defining chain information.
 *
 * @example
 * ```ts
 * import { defineRegistryChain } from "graz";
 *
 * const cosmoshub = defineRegistryChain({
 *   chain_name: "cosmoshub",
 *   chain_id: "cosmoshub-4",
 *   ...
 * });
 * ```
 */
export const defineRegistryChain = <T extends Chain>(chain: T): T => {
  return chain;
};
