import type { ChainInfo } from "@keplr-wallet/types";

import { getKeplr } from "../keplr";
import { connect } from "./account";

export async function suggestChain(chainInfo: ChainInfo) {
  const keplr = getKeplr();
  await keplr.experimentalSuggestChain(chainInfo);
  return chainInfo;
}

export async function suggestChainAndConnect(chainInfo: ChainInfo) {
  await suggestChain(chainInfo);
  await connect(chainInfo);
  return chainInfo;
}
