import type { ChainInfo } from "@keplr-wallet/types";

import type { ChainConfig, GrazInternalStore } from "../store";
import { useGrazInternalStore } from "../store";
import type { WalletType } from "../types/wallet";

export interface ConfigureGrazArgs {
  defaultWallet?: WalletType;
  chains: ChainInfo[];
  chainsConfig?: Record<string, ChainConfig>;
  onNotFound?: () => void;
  onReconnectFailed?: () => void;
  walletConnect?: GrazInternalStore["walletConnect"];
  /**
   * default to true
   */
  autoReconnect?: boolean;
  /**
   * Graz will use this number to determine how many concurrent requests to make when using `multiChain` args in hooks.
   * Defaults to 3.
   */
  multiChainFetchConcurrency?: number;
}

export const configureGraz = (args: ConfigureGrazArgs): ConfigureGrazArgs => {
  useGrazInternalStore.setState((prev) => ({
    walletConnect: args.walletConnect || prev.walletConnect,
    walletType: args.defaultWallet || prev.walletType,
    chains: args.chains || prev.chains,
    chainsConfig: args.chainsConfig || prev.chainsConfig,
    multiChainFetchConcurrency: args.multiChainFetchConcurrency || prev.multiChainFetchConcurrency,
    _notFoundFn: args.onNotFound || prev._notFoundFn,
    _onReconnectFailed: args.onReconnectFailed || prev._onReconnectFailed,
    _reconnect: args.autoReconnect === undefined ? true : args.autoReconnect || prev._reconnect,
  }));
  return args;
};
