import type { Wallet } from "../../types/wallet";
import { createKeplrLikeWallet, throwWalletNotFound } from "./keplr-like";

/**
 * Function to return xfi object (which is {@link Wallet}) and throws and error if it does not exist on `window`.
 *
 * @example
 * ```ts
 * try {
 *   const xDefi = getXDefi();
 * } catch (error: Error) {
 *   console.error(error.message);
 * }
 * ```
 *
 * @see https://docs.xdefi.io/docs/technical-documentation/xdefi-extension-integration/cosmos
 */
export const getXDefi = (): Wallet => {
  if (typeof window.xfi?.keplr !== "undefined")
    return createKeplrLikeWallet(window.xfi.keplr, "keplr_keystorechange", { setDefaultOptions: false });
  return throwWalletNotFound("window.xfi.keplr is not defined");
};
