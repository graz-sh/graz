import type { ChainInfo } from "@keplr-wallet/types";

import { getKeplr } from "../keplr";

export async function suggestChain(chainInfo: ChainInfo) {
  const keplr = getKeplr();
  await keplr.experimentalSuggestChain(chainInfo);
  return chainInfo;
}
