import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { Coin, OfflineDirectSigner, OfflineSigner } from "@cosmjs/proto-signing";
import type { Key } from "@keplr-wallet/types";
import type { State } from "zustand";
import create from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import type { WadestaChain } from "../chains";

export interface WadestaStore extends State {
  account: Key | null;
  activeChain: WadestaChain | null;
  balance: Coin[] | null;
  client: SigningCosmWasmClient | null;
  signer: (OfflineSigner & OfflineDirectSigner) | null;
  signerAmino: OfflineSigner | null;
  signerAuto: (OfflineSigner | OfflineDirectSigner) | null;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";

  _reconnect?: boolean;
}

export const defaultValues: WadestaStore = {
  account: null,
  activeChain: null,
  balance: null,
  client: null,
  signer: null,
  signerAmino: null,
  signerAuto: null,
  status: "disconnected",
};

export const useWadestaStore = create(
  subscribeWithSelector<WadestaStore>(() => ({
    ...defaultValues,
  })),
);
