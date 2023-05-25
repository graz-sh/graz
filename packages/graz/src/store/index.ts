import type { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { Coin, OfflineDirectSigner, OfflineSigner } from "@cosmjs/proto-signing";
import type { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import type { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import type { Key } from "@keplr-wallet/types";
import type { ISignClient, SignClientTypes } from "@walletconnect/types";
import type { Web3ModalConfig } from "@web3modal/standalone";
import { create } from "zustand";
import type { PersistOptions } from "zustand/middleware";
import { persist, subscribeWithSelector } from "zustand/middleware";

import type { GrazChain } from "../chains";
import { WalletType } from "../types/wallet";

interface GrazInternalStore {
  activeChain: GrazChain | null;
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

interface GrazUserStore {
  account: Key | null;
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

export type GrazPersistedStore = Pick<
  GrazInternalStore,
  "activeChain" | "recentChain" | "_reconnect" | "_reconnectConnector"
>;

export type GrazStore = GrazInternalStore & GrazUserStore;

const grazInternal: GrazInternalStore = {
  activeChain: null,
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

const grazUser: GrazUserStore = {
  account: null,
  balances: null,
  clients: null,
  offlineSigner: null,
  offlineSignerAmino: null,
  offlineSignerAuto: null,
  signingClients: null,
  status: "disconnected",
};

export const defaultValues: GrazStore = {
  ...grazInternal,
  ...grazUser,
};

const persistOptions: PersistOptions<GrazStore, GrazPersistedStore> = {
  name: "graz",
  partialize: (x) => ({
    activeChain: x.activeChain,
    recentChain: x.recentChain,
    _reconnect: x._reconnect,
    _reconnectConnector: x._reconnectConnector,
  }),
  version: 2,
};

export const useGrazStore = create(subscribeWithSelector(persist(() => defaultValues, persistOptions)));
