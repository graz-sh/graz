import type { KeplrIntereactionOptions } from "@keplr-wallet/types";

import { useGrazInternalStore } from "../../store";
import type { Wallet } from "../../types/wallet";
import { clearSession } from ".";

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
  if (typeof window.keplr !== "undefined") {
    const keplr = window.keplr;
    const subscription: (reconnect: () => void) => () => void = (reconnect) => {
      const listener = () => {
        clearSession();
        reconnect();
      };
      window.addEventListener("keplr_keystorechange", listener);
      return () => {
        window.removeEventListener("keplr_keystorechange", listener);
      };
    };
    const setDefaultOptions = (options: KeplrIntereactionOptions) => {
      keplr.defaultOptions = options;
    };
    const res = Object.assign(keplr, {
      subscription,
      setDefaultOptions,
    });

    return res;
  }

  useGrazInternalStore.getState()._notFoundFn();
  throw new Error("window.keplr is not defined");
};
