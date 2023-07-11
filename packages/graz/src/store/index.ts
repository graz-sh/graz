import type { Key } from "@keplr-wallet/types";
import type { ISignClient, SignClientTypes } from "@walletconnect/types";
import type { Web3ModalConfig } from "@web3modal/standalone";
import { create } from "zustand";
import type { PersistOptions } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";
import { persist, subscribeWithSelector } from "zustand/middleware";

import type { Clients, SigningClients } from "../actions/clients";
import type { GrazChain } from "../chains";
import { WalletType } from "../types/wallet";

export interface WalletConnectStore {
  options: SignClientTypes.Options | null;
  web3Modal?: Pick<Web3ModalConfig, "themeVariables" | "themeMode" | "privacyPolicyUrl" | "termsOfServiceUrl"> | null;
}
export interface GrazInternalStore {
  chains: GrazChain[] | null;
  recentChains: string[] | null;
  defaultClient: Clients;
  defaultSigningClient: SigningClients;
  walletType: WalletType;
  walletConnect: WalletConnectStore | null;
  _notFoundFn: () => void;
  _reconnect: boolean;
  _reconnectConnector: WalletType | null;
  _onReconnectFailed: () => void;
}

export interface GrazAccountSession {
  account: Key | null;
  chainId: string;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
}
export interface GrazSessionStore {
  sessions: GrazAccountSession[] | null;
  wcSignClient?: ISignClient | null;
}

export type GrazSessionPersistedStore = Pick<GrazSessionStore, "sessions">;

export type GrazInternalPersistedStore = Pick<GrazInternalStore, "_reconnect" | "_reconnectConnector">;

export const grazInternalDefaultValues: GrazInternalStore = {
  chains: null,
  recentChains: null,
  defaultClient: "stargate",
  defaultSigningClient: "stargate",
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
  sessions: null,
  wcSignClient: null,
};

const sessionOptions: PersistOptions<GrazSessionStore, GrazSessionPersistedStore> = {
  name: "graz-session",
  version: 2,
  partialize: (x) => ({
    sessions: x.sessions,
  }),
  storage: createJSONStorage(() => sessionStorage),
};

const persistOptions: PersistOptions<GrazInternalStore, GrazInternalPersistedStore> = {
  name: "graz-internal",
  partialize: (x) => ({
    recentChains: x.recentChains,
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
