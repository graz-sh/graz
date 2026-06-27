import type { Wallet } from "../../types/wallet";
import { createKeplrLikeWallet, throwWalletNotFound } from "./keplr-like";

/**
 * Function to return okxwallet object (which is {@link Wallet}) and throws and error if it does not exist on `window`.
 *
 * @example
 * ```ts
 * try {
 *   const okxWallet = getOkx();
 * } catch (error: Error) {
 *   console.error(error.message);
 * }
 * ```
 *
 * @see https://www.okx.com/web3/build/docs/sdks/chains/cosmos/provider
 */
export const getOkx = (): Wallet => {
  if (typeof window.okxwallet?.keplr !== "undefined")
    return createKeplrLikeWallet(window.okxwallet.keplr, "accountsChanged", {
      on: (event, listener) => window.okxwallet?.on(event, listener),
      off: (event, listener) => window.okxwallet?.removeListener(event, listener),
    });
  return throwWalletNotFound("window.okxwallet.keplr is not defined");
};
