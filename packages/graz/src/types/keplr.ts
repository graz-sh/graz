import type { ChainInfo } from "@keplr-wallet/types";

export interface ChainInfoWithPath extends ChainInfo {
  path: string;
}
