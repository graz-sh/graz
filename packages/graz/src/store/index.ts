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
  defaultChain: GrazChain | null;
  recentChain: GrazChain | null;
  walletType: WalletType;
  walletConnect: WalletConnectStore | null;
  _notFoundFn: () => void;
  _reconnect: boolean;
  _reconnectConnector: WalletType | null;
  _onReconnectFailed: () => void;
}

export interface Account {
  chain: GrazChain;
  key: Key;
}

export interface GrazSessionStore {
  account: Key | null;
  accounts: Map<GrazChain, Account>;
  activeChain: GrazChain | null;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
  wcSignClient?: ISignClient | null;
}

export type GrazSessionPersistedStore = Pick<GrazSessionStore, "account" | "activeChain">;

export type GrazInternalPersistedStore = Pick<GrazInternalStore, "recentChain" | "_reconnect" | "_reconnectConnector">;

export const grazInternalDefaultValues: GrazInternalStore = {
  recentChain: null,
  defaultChain: null,
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
  account: null,
  accounts: new Map<GrazChain, Account>(),
  activeChain: null,
  status: "disconnected",
  wcSignClient: null,
};

const sessionOptions: PersistOptions<GrazSessionStore, GrazSessionPersistedStore> = {
  name: "graz-session",
  version: 1,
  partialize: (x) => ({
    account: x.account,
    accounts: x.accounts,
    activeChain: x.activeChain,
  }),
  storage: createJSONStorage(() => sessionStorage),
};

const persistOptions: PersistOptions<GrazInternalStore, GrazInternalPersistedStore> = {
  name: "graz-internal",
  partialize: (x) => ({
    recentChain: x.recentChain,
    _reconnect: x._reconnect,
    _reconnectConnector: x._reconnectConnector,
  }),
  version: 1,
};

export const useGrazSessionStore = create(
  subscribeWithSelector(persist(() => grazSessionDefaultValues, sessionOptions)),
);

export const useGrazInternalStore = create(
  subscribeWithSelector(persist(() => grazInternalDefaultValues, persistOptions)),
);
