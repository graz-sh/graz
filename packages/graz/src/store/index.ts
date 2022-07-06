import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
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
  client: SigningCosmWasmClient | null;
  signer: (OfflineSigner & OfflineDirectSigner) | null;
  signerAmino: OfflineSigner | null;
  signerAuto: (OfflineSigner | OfflineDirectSigner) | null;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";

  _reconnect?: boolean;
}

export const defaultValues: GrazStore = {
  account: null,
  activeChain: null,
  balances: null,
  client: null,
  signer: null,
  signerAmino: null,
  signerAuto: null,
  status: "disconnected",
};

export const useGrazStore = create(
  subscribeWithSelector(
    persist<GrazStore, [["zustand/subscribeWithSelector", never]]>(() => ({ ...defaultValues }), {
      name: "graz",
      partialize: (x) => ({
        activeChain: x.activeChain,
        _reconnect: x._reconnect,
      }),
      version: 1,
    }),
  ),
);
