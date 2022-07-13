import type { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { Coin, OfflineDirectSigner, OfflineSigner } from "@cosmjs/proto-signing";
import type { Key } from "@keplr-wallet/types";
import type { State } from "zustand";
import create from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

import type { GrazChain } from "../chains";

export interface GrazStore extends State {
  account: Key | null;
  activeChain: GrazChain | null;
  balances: Coin[] | null;
  client: CosmWasmClient | null;
  defaultChain: GrazChain | null;
  lastChain: GrazChain | null;
  offlineSigner: (OfflineSigner & OfflineDirectSigner) | null;
  offlineSignerAmino: OfflineSigner | null;
  offlineSignerAuto: (OfflineSigner | OfflineDirectSigner) | null;
  signingClient: SigningCosmWasmClient | null;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
  _notFoundFn: () => void;
  _reconnect: boolean;
  _supported: boolean;
}

export const defaultValues: GrazStore = {
  account: null,
  activeChain: null,
  balances: null,
  client: null,
  defaultChain: null,
  lastChain: null,
  offlineSigner: null,
  offlineSignerAmino: null,
  offlineSignerAuto: null,
  signingClient: null,
  status: "disconnected",
  _notFoundFn: () => null,
  _reconnect: false,
  _supported: false,
};

export const useGrazStore = create(
  subscribeWithSelector(
    persist<GrazStore, [["zustand/subscribeWithSelector", never]]>(() => ({ ...defaultValues }), {
      name: "graz",
      partialize: (x) => ({
        activeChain: x.activeChain,
        lastChain: x.lastChain,
        _reconnect: x._reconnect,
      }),
      version: 1,
    }),
  ),
);
