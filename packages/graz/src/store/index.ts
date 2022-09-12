import type { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { Coin, OfflineDirectSigner, OfflineSigner } from "@cosmjs/proto-signing";
import type { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import type { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import type { Key } from "@keplr-wallet/types";
import create from "zustand";
import type { PersistOptions } from "zustand/middleware";
import { persist, subscribeWithSelector } from "zustand/middleware";

import type { GrazChain } from "../chains";
import type { WalletType } from "../types/core";

export interface GrazStore {
  account: Key | null;
  activeChain: GrazChain | null;
  balances: Coin[] | null;
  clients: {
    cosmWasm: CosmWasmClient;
    stargate: StargateClient;
    tendermint: Tendermint34Client;
  } | null;
  defaultChain: GrazChain | null;
  defaultSigningClient: "cosmWasm" | "stargate";
  offlineSigner: (OfflineSigner & OfflineDirectSigner) | null;
  offlineSignerAmino: OfflineSigner | null;
  offlineSignerAuto: (OfflineSigner | OfflineDirectSigner) | null;
  recentChain: GrazChain | null;
  signingClients: {
    cosmWasm: SigningCosmWasmClient;
    stargate: SigningStargateClient;
  } | null;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
  walletType: WalletType;
  _notFoundFn: () => void;
  _reconnect: boolean;
}

export type GrazPersistedStore = Pick<GrazStore, "activeChain" | "recentChain" | "_reconnect">;

export const defaultValues: GrazStore = {
  account: null,
  activeChain: null,
  balances: null,
  clients: null,
  defaultChain: null,
  defaultSigningClient: "stargate",
  offlineSigner: null,
  offlineSignerAmino: null,
  offlineSignerAuto: null,
  recentChain: null,
  signingClients: null,
  status: "disconnected",
  walletType: "keplr",
  _notFoundFn: () => null,
  _reconnect: false,
};

const persistOptions: PersistOptions<GrazStore, GrazPersistedStore> = {
  name: "graz",
  partialize: (x) => ({
    activeChain: x.activeChain,
    recentChain: x.recentChain,
    _reconnect: x._reconnect,
  }),
  version: 1,
};

export const useGrazStore = create(subscribeWithSelector(persist(() => defaultValues, persistOptions)));
