import type { Keplr } from "@keplr-wallet/types";

import { useGrazStore } from "../store";
import type { WalletType } from "../types/core";

/**
 * Function to check whether given {@link WalletType} or default configured wallet exists.
 *
 * @example
 * ```ts
 * const isSupported = checkWallet();
 * const isKeplrSupported = checkWallet("keplr");
 * ```
 */
export function checkWallet(type: WalletType = useGrazStore.getState().walletType): boolean {
  try {
    getWallet(type);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * Function to return {@link Keplr} object and throws and error if it does not exist on `window`.
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
export function getKeplr(): Keplr {
  if (typeof window.keplr !== "undefined") return window.keplr;
  useGrazStore.getState()._notFoundFn();
  throw new Error("window.keplr is not defined");
}

/**
 * Function to return wallet object based on given {@link WalletType} or from store and throws an error if it does not
 * exist on `window` or unknown wallet type.
 *
 * @example
 * ```ts
 * const wallet = getWallet();
 * const keplr = getWallet("keplr");
 * ```
 *
 * @see {@link getKeplr}
 */
export function getWallet(type: WalletType = useGrazStore.getState().walletType) {
  switch (type) {
    case "keplr": {
      return getKeplr();
    }
    default: {
      throw new Error("Unknown wallet type");
    }
  }
}
