import type { Key } from "@keplr-wallet/types";
import type { ISignClient, SignClientTypes } from "@walletconnect/types";
import type { Web3ModalConfig } from "@web3modal/standalone";
import { create } from "zustand";
import type { PersistOptions } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";
import { persist, subscribeWithSelector } from "zustand/middleware";

import type { GrazChain } from "../chains";
import { WalletType } from "../types/wallet";

export interface WalletConnectStore {
  options: SignClientTypes.Options | null;
  web3Modal?: Pick<Web3ModalConfig, "themeVariables" | "themeMode" | "privacyPolicyUrl" | "termsOfServiceUrl"> | null;
}
export interface GrazInternalStore {
  recentChainIds: string[] | null;
  chains: GrazChain[] | null;
  /**
   * Graz will use this number to determine how many concurrent requests to make when using `multiChain` args in hooks.
   * Defaults to 3.
   */
  multiChainConcurrency: number;
  walletType: WalletType;
  walletConnect: WalletConnectStore | null;
  _notFoundFn: () => void;
  _reconnect: boolean;
  _reconnectConnector: WalletType | null;
  _onReconnectFailed: () => void;
}

export interface GrazSessionStore {
  accounts: Record<string, Key> | null;
  activeChainIds: string[] | null;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
  wcSignClient?: ISignClient | null;
}

export type GrazSessionPersistedStore = Pick<GrazSessionStore, "accounts" | "activeChainIds">;

export type GrazInternalPersistedStore = Pick<
  GrazInternalStore,
  "recentChainIds" | "_reconnect" | "_reconnectConnector"
>;

export const grazInternalDefaultValues: GrazInternalStore = {
  recentChainIds: null,
  chains: null,
  multiChainConcurrency: 3,
  walletType: WalletType.KEPLR,
  walletConnect: {
    options: null,
    web3Modal: null,
  },
  _notFoundFn: () => null,
  _onReconnectFailed: () => null,
  _reconnect: false,
  _reconnectConnector: null,
};

export const grazSessionDefaultValues: GrazSessionStore = {
  accounts: null,
  activeChainIds: null,
  status: "disconnected",
  wcSignClient: null,
};

const sessionOptions: PersistOptions<GrazSessionStore, GrazSessionPersistedStore> = {
  name: "graz-session",
  version: 2,
  partialize: (x) => ({
    accounts: x.accounts,
    activeChainIds: x.activeChainIds,
  }),
  storage: createJSONStorage(() => sessionStorage),
};

const persistOptions: PersistOptions<GrazInternalStore, GrazInternalPersistedStore> = {
  name: "graz-internal",
  partialize: (x) => ({
    recentChainIds: x.recentChainIds,
    _reconnect: x._reconnect,
    _reconnectConnector: x._reconnectConnector,
  }),
  version: 2,
};

export const useGrazSessionStore = create(
  subscribeWithSelector(persist(() => grazSessionDefaultValues, sessionOptions)),
);

export const useGrazInternalStore = create(
  subscribeWithSelector(persist(() => grazInternalDefaultValues, persistOptions)),
);
