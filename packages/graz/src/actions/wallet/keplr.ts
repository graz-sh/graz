import type { Wallet } from "../../types/wallet";
import { createKeplrLikeWallet, throwWalletNotFound } from "./keplr-like";

/**
 * Function to return {@link Wallet} object and throws and error if it does not exist on `window`.
 *
 * @example
 * ```ts
 * try {
 *   const keplr = getKeplr();
 * } catch (error: Error) {
 *   console.error(error.message);
 * }
 * ```
 *
 * @see https://docs.keplr.app
 */
export const getKeplr = (): Wallet => {
  if (typeof window.keplr !== "undefined")
    return createKeplrLikeWallet(window.keplr, "keplr_keystorechange");
  return throwWalletNotFound("window.keplr is not defined");
};
