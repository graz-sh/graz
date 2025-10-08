import type { ChainInfo } from "@keplr-wallet/types";

import { useGrazInternalStore } from "../store";
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

export const getChainInfo = ({ chainId }: { chainId?: string } = {}): ChainInfo | undefined => {
  return useGrazInternalStore.getState().chains?.find((x) => x.chainId === chainId);
};

export const getChainInfos = ({ chainId }: { chainId?: string[] } = {}): ChainInfo[] | undefined => {
  const chains = useGrazInternalStore.getState().chains;
  if (!chainId) return chains ?? undefined;
  return chains?.filter((x) => chainId.includes(x.chainId));
};

export interface AddChainArgs {
  chainInfo: ChainInfo;
}

export const addChain = async ({ chainInfo }: AddChainArgs): Promise<ChainInfo> => {
  // Add chain to internal store if not already present
  const { chains } = useGrazInternalStore.getState();
  const existingChain = chains?.find((x) => x.chainId === chainInfo.chainId);

  if (existingChain) {
    throw new Error(`Chain with chainId "${chainInfo.chainId}" already exists in the store`);
  }

  useGrazInternalStore.setState((prev) => ({
    chains: [...(prev.chains || []), chainInfo],
  }));

  return chainInfo;
};

export interface SuggestChainArgs {
  chainInfo: ChainInfo;
  walletType: WalletType;
}

export const suggestChain = async ({ chainInfo, walletType }: SuggestChainArgs): Promise<ChainInfo> => {
  const wallet = getWallet(walletType);
  await wallet.experimentalSuggestChain(chainInfo);

  // Add chain to internal store if not already present
  const { chains } = useGrazInternalStore.getState();
  const existingChain = chains?.find((x) => x.chainId === chainInfo.chainId);

  if (!existingChain) {
    useGrazInternalStore.setState((prev) => ({
      chains: [...(prev.chains || []), chainInfo],
    }));
  }

  return chainInfo;
};

export interface SuggestChainAndConnectArgs {
  chainInfo: ChainInfo;
  walletType?: WalletType;
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
