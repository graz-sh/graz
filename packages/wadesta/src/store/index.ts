import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { Coin, OfflineDirectSigner, OfflineSigner } from "@cosmjs/proto-signing";
import type { ChainInfo, Key } from "@keplr-wallet/types";
import type { State } from "zustand";
import create from "zustand";

export type WadestaChain = Pick<ChainInfo, "chainId" | "rest" | "rpc">;

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

export const useWadestaStore = create<WadestaStore>(() => ({
  ...defaultValues,
}));
