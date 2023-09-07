import type { ChainInfo } from "@keplr-wallet/types";

import { useGrazInternalStore } from "../store";
import type { Dictionary } from "../types/core";
import type { WalletType } from "../types/wallet";
import type { ConnectResult } from "./account";
import { connect } from "./account";
import { getWallet } from "./wallet";

export const clearRecentChain = (): void => {
  useGrazInternalStore.setState({ recentChainIds: null });
};

export const getRecentChainIds = (): string[] | null => {
  return useGrazInternalStore.getState().recentChainIds;
};

export const getRecentChains = (): ChainInfo[] | null => {
  const { recentChainIds: recentChains, chains } = useGrazInternalStore.getState();
  return recentChains?.map((chainId) => chains!.find((x) => x.chainId === chainId)!) ?? null;
};

export const suggestChain = async ({ chainInfo, walletType }: { chainInfo: ChainInfo; walletType?: WalletType }) => {
  const wallet = getWallet(walletType);
  await wallet.experimentalSuggestChain(chainInfo);
  return chainInfo;
};

export interface SuggestChainAndConnectArgs {
  chainInfo: ChainInfo;
  walletType?: WalletType;
  gas?: {
    price: string;
    denom: string;
  };
  rpcHeaders?: Dictionary;
  path?: string;
  autoReconnect?: boolean;
}

export const suggestChainAndConnect = async (args: SuggestChainAndConnectArgs): Promise<ConnectResult> => {
  const defaultWalletType = useGrazInternalStore.getState().walletType;
  await suggestChain({ chainInfo: args.chainInfo, walletType: args.walletType ?? defaultWalletType });
  const result = await connect({
    chainId: args.chainInfo.chainId,
    walletType: args.walletType,
    autoReconnect: args.autoReconnect,
  });
  return result;
};
