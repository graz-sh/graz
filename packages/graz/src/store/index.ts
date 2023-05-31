import type { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { Coin, OfflineDirectSigner, OfflineSigner } from "@cosmjs/proto-signing";
import type { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import type { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import type { Key } from "@keplr-wallet/types";
import type { ISignClient, SignClientTypes } from "@walletconnect/types";
import type { Web3ModalConfig } from "@web3modal/standalone";
import { create } from "zustand";
import type { PersistOptions } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";
import { persist, subscribeWithSelector } from "zustand/middleware";

import type { GrazChain } from "../chains";
import { WalletType } from "../types/wallet";

export interface GrazInternalStore {
  defaultChain: GrazChain | null;
  defaultSigningClient: "cosmWasm" | "stargate";
  recentChain: GrazChain | null;
  walletType: WalletType;
  walletConnect: {
    options: SignClientTypes.Options | null;
    signClient?: ISignClient | null;
    web3Modal?: Pick<Web3ModalConfig, "themeVariables" | "themeMode" | "privacyPolicyUrl" | "termsOfServiceUrl"> | null;
  } | null;
  _notFoundFn: () => void;
  _reconnect: boolean;
  _reconnectConnector: WalletType | null;
  _onReconnectFailed: () => void;
}

export interface GrazSessionStore {
  account: Key | null;
  activeChain: GrazChain | null;
  balances: Coin[] | null;
  clients: {
    cosmWasm: CosmWasmClient;
    stargate: StargateClient;
    tendermint: Tendermint34Client;
  } | null;
  offlineSigner: (OfflineSigner & OfflineDirectSigner) | null;
  offlineSignerAmino: OfflineSigner | null;
  offlineSignerAuto: (OfflineSigner | OfflineDirectSigner) | null;
  signingClients: {
    cosmWasm: SigningCosmWasmClient;
    stargate: SigningStargateClient;
  } | null;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
}

export type GrazPersistedStore = Pick<GrazInternalStore, "recentChain" | "_reconnect" | "_reconnectConnector">;

export const grazInternalDefaultValues: GrazInternalStore = {
  recentChain: null,
  defaultChain: null,
  defaultSigningClient: "stargate",
  walletType: WalletType.KEPLR,
  walletConnect: {
    options: null,
    signClient: null,
    web3Modal: null,
  },
  _notFoundFn: () => null,
  _onReconnectFailed: () => null,
  _reconnect: false,
  _reconnectConnector: null,
};

export const grazSessionDefaultValues: GrazSessionStore = {
  account: null,
  activeChain: null,
  balances: null,
  clients: null,
  offlineSigner: null,
  offlineSignerAmino: null,
  offlineSignerAuto: null,
  signingClients: null,
  status: "disconnected",
};

const sessionOptions: PersistOptions<GrazSessionStore> = {
  name: "graz-session",
  version: 1,
  storage: createJSONStorage(() => sessionStorage),
};

const persistOptions: PersistOptions<GrazInternalStore, GrazPersistedStore> = {
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
