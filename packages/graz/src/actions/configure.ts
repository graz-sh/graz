import type { ChainInfo } from "@keplr-wallet/types";

import type { ChainConfig, GrazInternalStore, IframeOptions } from "../store";
import { useGrazInternalStore } from "../store";
import { LogCategory, type LogLevel } from "../types/logger";
import type { WalletType } from "../types/wallet";
import { configureLogger } from "../utils/logger";

export interface ConfigureGrazArgs {
  defaultWallet?: WalletType;
  chains: ChainInfo[];
  chainsConfig?: Record<string, ChainConfig>;
  paraConfig?: GrazInternalStore["paraConfig"];
  onNotFound?: () => void;
  onReconnectFailed?: () => void;
  walletConnect?: GrazInternalStore["walletConnect"];
  walletDefaultOptions?: GrazInternalStore["walletDefaultOptions"];
  /**
   * default to true
   */
  autoReconnect?: boolean;
  /**
   * Graz will use this number to determine how many concurrent requests to make when querying multiple chains.
   * All hooks now operate on multiple chains by default (returning Record<chainId, T>).
   * Defaults to 3.
   */
  multiChainFetchConcurrency?: number;
  /**
   * Options to enable iframe wallet connection.
   */
  iframeOptions?: IframeOptions;
  pingInteval?: number;
  /**
   * Logger configuration
   */
  logger?: {
    enabled?: boolean;
    level?: LogLevel | LogLevel[] | undefined;
    categories?: (keyof typeof LogCategory)[] | undefined;
  };
}

export const configureGraz = (args: ConfigureGrazArgs): ConfigureGrazArgs => {
  // Configure logger - only enable if explicitly provided
  configureLogger({
    enabled: args.logger?.enabled ?? false,
    level: args.logger?.level,
    categories: args.logger?.categories,
  });

  useGrazInternalStore.setState((prev) => {
    // Merge provider chains with any persisted chains (e.g., from useSuggestChain)
    const persistedChains = prev.chains ?? [];
    const providerChains = args.chains;

    // Create a map to track chains by chainId to avoid duplicates
    const chainMap = new Map<string, ChainInfo>();

    // Add provider chains first (they take precedence)
    providerChains.forEach((chain) => chainMap.set(chain.chainId, chain));

    // Add persisted chains that aren't in the provider
    persistedChains.forEach((chain) => {
      if (!chainMap.has(chain.chainId)) {
        chainMap.set(chain.chainId, chain);
      }
    });

    const mergedChains = Array.from(chainMap.values());

    return {
      iframeOptions: args.iframeOptions || prev.iframeOptions,
      walletConnect: args.walletConnect || prev.walletConnect,
      walletType: args.defaultWallet || prev.walletType,
      paraConfig: args.paraConfig || prev.paraConfig,
      walletDefaultOptions: args.walletDefaultOptions || prev.walletDefaultOptions,
      chains: mergedChains,
      chainsConfig: args.chainsConfig || prev.chainsConfig,
      multiChainFetchConcurrency: args.multiChainFetchConcurrency || prev.multiChainFetchConcurrency,
      pingInterval: args.pingInteval || prev.pingInterval,
      loggerConfig: args.logger
        ? {
            enabled: args.logger.enabled ?? prev.loggerConfig?.enabled ?? false,
            level: args.logger.level ?? prev.loggerConfig?.level ?? 1,
            categories: args.logger.categories ?? prev.loggerConfig?.categories ?? [],
          }
        : prev.loggerConfig,
      _notFoundFn: args.onNotFound || prev._notFoundFn,
      _onReconnectFailed: args.onReconnectFailed || prev._onReconnectFailed,
      _reconnect: args.autoReconnect === undefined ? true : args.autoReconnect || prev._reconnect,
    };
  });
  return args;
};
