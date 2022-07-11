import type { ChainInfo, Key } from "@keplr-wallet/types";

import { getKeplr } from "../keplr";
import { connect } from "./account";

export async function suggestChain(chainInfo: ChainInfo): Promise<ChainInfo> {
  const keplr = getKeplr();
  await keplr.experimentalSuggestChain(chainInfo);
  return chainInfo;
}

export async function suggestChainAndConnect(chainInfo: ChainInfo): Promise<{ account: Key; chain: ChainInfo }> {
  const chain = await suggestChain(chainInfo);
  const account = await connect(chainInfo);
  return { account, chain };
}
