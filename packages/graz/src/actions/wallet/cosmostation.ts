import type { Wallet } from "../../types/wallet";
import { createKeplrLikeWallet, throwWalletNotFound } from "./keplr-like";

/**
 * Function to return cosmostation object (which is {@link Wallet}) and throws and error if it does not exist on `window`.
 *
 * @example
 * ```ts
 * try {
 *   const cosmostation = getCosmostation();
 * } catch (error: Error) {
 *   console.error(error.message);
 * }
 * ```
 *
 * @see https://docs.cosmostation.io/integration-extension/cosmos/integrate-keplr
 */
export const getCosmostation = (): Wallet => {
  if (typeof window.cosmostation?.providers.keplr !== "undefined")
    return createKeplrLikeWallet(window.cosmostation.providers.keplr, "cosmostation_keystorechange");
  return throwWalletNotFound("window.cosmostation.providers.keplr is not defined");
};
