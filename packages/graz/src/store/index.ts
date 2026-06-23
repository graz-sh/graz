import type { ChainInfo, Keplr } from "@keplr-wallet/types";
import type { WalletConnectModalConfig } from "@walletconnect/modal";
import type { ISignClient, SignClientTypes } from "@walletconnect/types";
import { create } from "zustand";
import type { PersistOptions } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";
import { persist, subscribeWithSelector } from "zustand/middleware";

import type { Dictionary } from "../types/core";
import { LogCategory, type LogLevel } from "../types/logger";
import type { ParaGrazConfig, ParaGrazConnector } from "../types/para";
import type { Key } from "../types/wallet";
import { WalletType } from "../types/wallet";

export interface ChainConfig {
  path?: string;
  rpcHeaders?: Dictionary;
  gas?: {
    price: string;
    denom: string;
  };
}

export interface WalletConnectStore {
  options: SignClientTypes.Options | null;
  walletConnectModal?: Pick<
    WalletConnectModalConfig,
    "themeVariables" | "themeMode" | "privacyPolicyUrl" | "termsOfServiceUrl"
  > | null;
}

export interface IframeOptions {
  /**
   * Origins to allow wrapping this app in an iframe and connecting to this Graz
   * instance.
   */
  allowedIframeParentOrigins: string[];
  /**
   * Whether or not to auto connect when in an iframe running Cosmiframe. This
   * will attempt to connect to all chains provided to GrazProvider.
   *
   * Defaults to true.
   */
  autoConnect?: boolean;
}

export interface GrazInternalStore {
  recentChainIds: string[] | null;
  paraConfig: ParaGrazConfig | null | undefined;
  chains: ChainInfo[] | null;
  chainsConfig: Record<string, ChainConfig> | null;
  iframeOptions: IframeOptions | null;
  /**
   * Graz will use this number to determine how many concurrent requests to make when querying multiple chains.
   * All hooks now operate on multiple chains by default (returning Record<chainId, T>).
   * Defaults to 3.
   */
  multiChainFetchConcurrency: number;
  walletType: WalletType;
  walletConnect: WalletConnectStore | null;
  walletDefaultOptions: Keplr["defaultOptions"] | null;
  /**
   * Interval in milliseconds to ping the wallet.
   */
  pingInterval: number;
  /**
   * Logger configuration
   */
  loggerConfig: {
    enabled: boolean;
    level?: LogLevel | LogLevel[];
    categories?: (keyof typeof LogCategory)[];
  } | null;
  _notFoundFn: () => void;
  _reconnect: boolean;
  _reconnectConnector: WalletType | null;
  _onReconnectFailed: () => void;
}

export interface GrazSessionStore {
  accounts: Record<string, Key> | null;
  activeChainIds: string[] | null;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
  lastPing: number | null;

  wcSignClients: Map<WalletType, ISignClient>;
  paraConnector: ParaGrazConnector | null;
}

export type GrazSessionPersistedStore = Pick<GrazSessionStore, "accounts" | "activeChainIds" | "lastPing" | "status">;

export type GrazInternalPersistedStore = Pick<
  GrazInternalStore,
  "recentChainIds" | "_reconnect" | "_reconnectConnector" | "walletType" | "chains"
>;

export const grazInternalDefaultValues: GrazInternalStore = {
  iframeOptions: null,
  recentChainIds: null,
  chains: null,
  chainsConfig: null,
  paraConfig: null,
  multiChainFetchConcurrency: 3,
  walletType: WalletType.KEPLR,
  walletConnect: {
    options: null,
    walletConnectModal: null,
  },
  walletDefaultOptions: null,
  pingInterval: 3600000 /* 1 hour */,
  loggerConfig: null,
  _notFoundFn: () => null,
  _onReconnectFailed: () => null,
  _reconnect: false,
  _reconnectConnector: null,
};

export const GRAZ_INTERNAL_STORAGE_KEY = "graz-internal";
export const GRAZ_SESSION_STORAGE_KEY = "graz-session";

export const grazSessionDefaultValues: GrazSessionStore = {
  accounts: null,
  activeChainIds: null,
  status: "disconnected",
  lastPing: null,
  wcSignClients: new Map(),
  paraConnector: null,
};

const sessionOptions: PersistOptions<GrazSessionStore, GrazSessionPersistedStore> = {
  name: GRAZ_SESSION_STORAGE_KEY,
  version: 2,
  partialize: (x) => ({
    accounts: x.accounts,
    activeChainIds: x.activeChainIds,
    lastPing: x.lastPing,
    status: x.status,
  }),
  storage: createJSONStorage(() => sessionStorage),
};

const persistOptions: PersistOptions<GrazInternalStore, GrazInternalPersistedStore> = {
  name: GRAZ_INTERNAL_STORAGE_KEY,
  partialize: (x) => ({
    recentChainIds: x.recentChainIds,
    _reconnect: x._reconnect,
    _reconnectConnector: x._reconnectConnector,
    walletType: x.walletType,
    chains: x.chains,
  }),
  version: 3,
};

export const useGrazSessionStore = create(
  subscribeWithSelector(persist(() => grazSessionDefaultValues, sessionOptions)),
);

export const useGrazInternalStore = create(
  subscribeWithSelector(persist(() => grazInternalDefaultValues, persistOptions)),
);
