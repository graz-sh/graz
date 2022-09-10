import type { ChainInfo, Key } from "@keplr-wallet/types";

import type { GrazChain } from "../chains";
import { useGrazStore } from "../store";
import { connect } from "./account";
import { getKeplr } from "./wallet";

export function clearRecentChain(): void {
  useGrazStore.setState({ recentChain: null });
}

export function getRecentChain(): GrazChain | null {
  return useGrazStore.getState().recentChain;
}

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
