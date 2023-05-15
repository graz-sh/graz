import type { SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import type { AppCurrency, ChainInfo } from "@keplr-wallet/types";

import type { GrazChain } from "../chains";
import { useGrazStore } from "../store";
import type { Dictionary } from "../types/core";
import type { WalletType } from "../types/wallet";
import type { ConnectResult } from "./account";
import { connect } from "./account";
import { getWallet } from "./wallet";

export * from "./clients/tendermint";

export const clearRecentChain = (): void => {
  useGrazStore.setState({ recentChain: null });
};

export const getActiveChainCurrency = (denom: string): AppCurrency | undefined => {
  const { activeChain } = useGrazStore.getState();
  return activeChain?.currencies.find((x) => x.coinMinimalDenom === denom);
};

export const getRecentChain = (): GrazChain | null => {
  return useGrazStore.getState().recentChain;
};

export const suggestChain = async (chainInfo: ChainInfo): Promise<ChainInfo> => {
  const wallet = getWallet();
  await wallet.experimentalSuggestChain(chainInfo);
  return chainInfo;
};

export interface SuggestChainAndConnectArgs {
  chainInfo: ChainInfo;
  signerOpts?: SigningCosmWasmClientOptions;
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
  const chain = await suggestChain(chainInfo);
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
