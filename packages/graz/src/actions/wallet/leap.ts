import type { KeplrIntereactionOptions } from "@keplr-wallet/types";

import { useGrazInternalStore } from "../../store";
import type { Wallet } from "../../types/wallet";
import { clearSession } from ".";

/**
 * Function to return Leap object (which is {@link Wallet}) and throws and error if it does not exist on `window`.
 *
 * @example
 * ```ts
 * try {
 *   const leap = getLeap();
 * } catch (error: Error) {
 *   console.error(error.message);
 * }
 * ```
 *
 * @see https://docs.leapwallet.io/cosmos/for-dapps-connect-to-leap/add-leap-to-existing-keplr-integration
 */
export const getLeap = (): Wallet => {
  if (typeof window.leap !== "undefined") {
    const leap = window.leap;
    const subscription: (reconnect: () => void) => () => void = (reconnect) => {
      const listener = () => {
        clearSession();
        reconnect();
      };
      window.addEventListener("leap_keystorechange", listener);
      return () => {
        window.removeEventListener("leap_keystorechange", listener);
      };
    };
    const setDefaultOptions = (options: KeplrIntereactionOptions) => {
      leap.defaultOptions = options;
    };
    const res = Object.assign(leap, {
      subscription,
      setDefaultOptions,
    });
    return res;
  }

  useGrazInternalStore.getState()._notFoundFn();
  throw new Error("window.leap is not defined");
};
