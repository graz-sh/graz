import type { ChainInfo } from "@keplr-wallet/types";

import { cosmoshub } from "./cosmoshub";

export const defaultChains: ChainInfo[] = [cosmoshub];

export const chain = {
  cosmoshub,
};
