import type { Keplr } from "@keplr-wallet/types";

import { useGrazStore } from "./store";

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
  throw new Error("Keplr is not defined");
}

/**
 * Register a callback to run when invoking {@link getKeplr} throws an error.
 *
 * @example
 * ```ts
 * registerKeplrNotFound(() => {
 *   console.error("keplr not found");
 * });
 * ```
 *
 * @see {@link unregisterKeplrNotFound}
 */
export function registerKeplrNotFound(fn: () => void): void {
  useGrazStore.setState({ _notFoundFn: fn });
}

/**
 * Clear registered callback when using {@link registerKeplrNotFound}.
 *
 * @see {@link registerKeplrNotFound}
 */
export function unregisterKeplrNotFound(): void {
  useGrazStore.setState({ _notFoundFn: () => null });
}
