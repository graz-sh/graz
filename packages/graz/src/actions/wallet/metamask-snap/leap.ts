import type { Wallet } from "../../../types/wallet";
import type { GetMetamaskSnap } from ".";
import { getMetamaskSnap } from ".";

/**
 * Function to return {@link Wallet} object and throws and error if it does not exist on `window`.
 *
 * @example
 * ```ts
 * try {
 *   const leapMetamaskSnap = getMetamaskSnapLeap();
 * } catch (error: Error) {
 *   console.error(error.message);
 * }
 * ```
 *
 *
 */
export const getMetamaskSnapLeap = (): Wallet => {
  const params: GetMetamaskSnap = {
    id: "npm:@leapwallet/metamask-cosmos-snap",
  };
  return getMetamaskSnap(params);
};
