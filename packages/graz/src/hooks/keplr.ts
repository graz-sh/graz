import { useGrazStore } from "../store";

/**
 * graz hook which returns boolean whether Keplr Wallet is supported
 *
 * @example
 * ```ts
 * import { useCheckKeplr } from "graz";
 *
 * // basic example
 * const isSupported = useCheckKeplr();
 * if (isSupported) {
 *   ...
 * }
 * ```
 *
 * @see {@link getKeplr}
 */
export function useCheckKeplr() {
  return useGrazStore((x) => x._supported);
}
