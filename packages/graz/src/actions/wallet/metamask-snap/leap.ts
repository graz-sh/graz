import type { Wallet } from "../../../types/wallet";
import type { GetMetamaskSnap } from ".";
import { getMetamaskSnap } from ".";

export const getMetamaskSnapLeap = (): Wallet => {
  const params: GetMetamaskSnap = {
    id: "npm:@leapwallet/metamask-cosmos-snap",
  };
  return getMetamaskSnap(params);
};
