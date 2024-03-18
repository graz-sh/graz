import type { KeplrIntereactionOptions } from "@keplr-wallet/types";

import { useGrazInternalStore } from "../../store";
import type { Wallet } from "../../types/wallet";
import { clearSession } from ".";

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
  if (typeof window.cosmostation?.providers.keplr !== "undefined") {
    const cosmostation = window.cosmostation.providers.keplr;
    const subscription: (reconnect: () => void) => () => void = (reconnect) => {
      const listener = () => {
        clearSession();
        reconnect();
      };
      window.cosmostation?.cosmos.on("accountChanged", listener);
      return () => {
        window.cosmostation?.cosmos.off("accountChanged", listener);
      };
    };

    const setDefaultOptions = (options: KeplrIntereactionOptions) => {
      cosmostation.defaultOptions = options;
    };
    const res = Object.assign(cosmostation, {
      subscription,
      setDefaultOptions,
    });
    return res;
  }

  useGrazInternalStore.getState()._notFoundFn();
  throw new Error("window.cosmostation.providers.keplr is not defined");
};
