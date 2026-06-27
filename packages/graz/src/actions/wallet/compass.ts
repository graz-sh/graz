import type { Wallet } from "../../types/wallet";
import { createKeplrLikeWallet, throwWalletNotFound } from "./keplr-like";

/**
 * Function to return Compass object (which is {@link Wallet}) and throws and error if it does not exist on `window`.
 *
 * @example
 * ```ts
 * try {
 *   const compass = getCompass();
 * } catch (error: Error) {
 *   console.error(error.message);
 * }
 * ```
 */
export const getCompass = (): Wallet => {
  if (typeof window !== "undefined" && typeof window.compass !== "undefined")
    return createKeplrLikeWallet(window.compass, "leap_keystorechange");
  return throwWalletNotFound("window.compass is not defined");
};
