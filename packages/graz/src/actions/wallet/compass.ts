import type { KeplrIntereactionOptions } from "@keplr-wallet/types";

import { useGrazInternalStore } from "../../store";
import type { Wallet } from "../../types/wallet";
import { clearSession } from ".";

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
  if (typeof window.compass !== "undefined") {
    const compass = window.compass;
    const subscription: (reconnect: () => void) => () => void = (reconnect) => {
      const listener = () => {
        clearSession();
        reconnect();
      };
      window.addEventListener("compass_keystorechange", listener);
      return () => {
        window.removeEventListener("compass_keystorechange", listener);
      };
    };
    const setDefaultOptions = (options: KeplrIntereactionOptions) => {
      compass.defaultOptions = options;
    };
    const res = Object.assign(compass, {
      subscription,
      setDefaultOptions,
    });
    return res as unknown as Wallet;
  }

  useGrazInternalStore.getState()._notFoundFn();
  throw new Error("window.compass is not defined");
};
