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

export const suggestChain = async ({ chainInfo, walletType }: { chainInfo: ChainInfo; walletType?: WalletType }) => {
  const wallet = getWallet(walletType);
  await wallet.experimentalSuggestChain(chainInfo);
  return {
    chainInfo,
    walletType,
  };
};

export interface SuggestChainAndConnectArgs {
  chainInfo: ChainInfo;
  autoReconnect?: boolean;
  walletType?: WalletType;
}

export const suggestChainAndConnect = async (args: SuggestChainAndConnectArgs): Promise<ConnectResult> => {
  const defaultWalletType = useGrazInternalStore.getState().walletType;
  await suggestChain({ chainInfo: args.chainInfo, walletType: args.walletType ?? defaultWalletType });
  const result = await connect({
    chainId: [args.chainInfo.chainId],
    autoReconnect: args.autoReconnect,
    walletType: args.walletType ?? defaultWalletType,
  });
  return result;
};

export const getChain = ({ chainId }: { chainId: string }) => {
  const chain = useGrazInternalStore.getState().chains?.find((x) => x.chainId === chainId);
  return chain;
};
