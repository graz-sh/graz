import type { AppCurrency, ChainInfo } from "@keplr-wallet/types";

import type { GrazChain } from "../chains";
import { useGrazInternalStore, useGrazSessionStore } from "../store";
import type { Dictionary } from "../types/core";
import type { WalletType } from "../types/wallet";
import type { ConnectResult } from "./account";
import { connect } from "./account";
import { getWallet } from "./wallet";

export const clearRecentChain = (): void => {
  useGrazInternalStore.setState({ recentChain: null });
};

export const getActiveChainCurrency = (denom: string): AppCurrency | undefined => {
  const { activeChain } = useGrazSessionStore.getState();
  return activeChain?.currencies.find((x) => x.coinMinimalDenom === denom);
};

export const getRecentChain = (): GrazChain | null => {
  return useGrazInternalStore.getState().recentChain;
};

export interface SuggestChainArgs {
  chainInfo: ChainInfo;
  walletType: WalletType;
}

export const suggestChain = async ({ chainInfo, walletType }: SuggestChainArgs): Promise<ChainInfo> => {
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

export const suggestChainAndConnect = async ({
  chainInfo,
  rpcHeaders,
  gas,
  path,
  ...rest
}: SuggestChainAndConnectArgs): Promise<ConnectResult> => {
  const { walletType } = useGrazInternalStore.getState();
  const wallet = rest.walletType || walletType;
  const chain = await suggestChain({
    chainInfo,
    walletType: wallet,
  });
  const result = await connect({
    chain: {
      chainId: chainInfo.chainId,
      currencies: chainInfo.currencies,
      rest: chainInfo.rest,
      rpc: chainInfo.rpc,
      rpcHeaders,
      gas,
      path,
    },
    ...rest,
  });
  return { ...result, chain };
};
