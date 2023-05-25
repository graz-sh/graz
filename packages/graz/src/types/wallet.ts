import type { Keplr } from "@keplr-wallet/types";

export enum WalletType {
  KEPLR = "keplr",
  LEAP = "leap",
  COSMOSTATION = "cosmostation",
  WALLETCONNECT = "walletconnect",
}

export const WALLET_TYPES = [WalletType.KEPLR, WalletType.LEAP, WalletType.COSMOSTATION, WalletType.WALLETCONNECT];

export type Wallet = Pick<
  Keplr,
  | "enable"
  | "getKey"
  | "getOfflineSigner"
  | "getOfflineSignerAuto"
  | "getOfflineSignerOnlyAmino"
  | "experimentalSuggestChain"
  | "signDirect"
  | "signAmino"
>;
