import type { SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import type { AppCurrency, ChainInfo, Key } from "@keplr-wallet/types";

import type { GrazChain } from "../chains";
import { useGrazStore } from "../store";
import type { Dictionary } from "../types/core";
import type { WalletType } from "../types/wallet";
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
}

export const suggestChainAndConnect = async ({
  chainInfo,
  ...rest
}: SuggestChainAndConnectArgs): Promise<{ account: Key; chain: ChainInfo }> => {
  const chain = await suggestChain(chainInfo);
  const account = await connect({
    chainId: chainInfo.chainId,
    currencies: chainInfo.currencies,
    rest: chainInfo.rest,
    rpc: chainInfo.rpc,
    ...rest,
  });
  return { account, chain };
};
