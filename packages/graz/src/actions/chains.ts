import type { ChainInfo } from "@keplr-wallet/types";

import { useGrazInternalStore } from "../store";
import type { WalletType } from "../types/wallet";
import type { ConnectResult } from "./account";
import { connect } from "./account";
import { getWallet } from "./wallet";

export const clearRecentChain = (): void => {
  useGrazInternalStore.setState({ recentChains: null });
};

export const getRecentChains = (): string[] | null => {
  return useGrazInternalStore.getState().recentChains;
};

export const suggestChain = async (chainInfo: ChainInfo): Promise<ChainInfo> => {
  const wallet = getWallet();
  await wallet.experimentalSuggestChain(chainInfo);
  return chainInfo;
};

export interface SuggestChainAndConnectArgs {
  chainInfo: ChainInfo;
  autoReconnect?: boolean;
  walletType?: WalletType;
}

export const suggestChainAndConnect = async (args: SuggestChainAndConnectArgs): Promise<ConnectResult> => {
  await suggestChain(args.chainInfo);
  const result = await connect({
    chainId: [args.chainInfo.chainId],
    autoReconnect: args.autoReconnect,
    walletType: args.walletType,
  });
  return result;
};
