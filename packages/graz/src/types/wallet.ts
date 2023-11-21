import type { Keplr } from "@keplr-wallet/types";

export enum WalletType {
  KEPLR = "keplr",
  LEAP = "leap",
  VECTIS = "vectis",
  COSMOSTATION = "cosmostation",
  WALLETCONNECT = "walletconnect",
  // eslint-disable-next-line @typescript-eslint/naming-convention
  WC_KEPLR_MOBILE = "wc_keplr_mobile",
  // eslint-disable-next-line @typescript-eslint/naming-convention
  WC_LEAP_MOBILE = "wc_leap_mobile",
  // eslint-disable-next-line @typescript-eslint/naming-convention
  WC_COSMOSTATION_MOBILE = "wc_cosmostation_mobile",
  // eslint-disable-next-line @typescript-eslint/naming-convention
  METAMASK_SNAP_LEAP = "metamask_snap_leap",
  STATION = "station",
}

export const WALLET_TYPES = [
  WalletType.KEPLR,
  WalletType.LEAP,
  WalletType.VECTIS,
  WalletType.COSMOSTATION,
  WalletType.WALLETCONNECT,
  WalletType.WC_KEPLR_MOBILE,
  WalletType.WC_LEAP_MOBILE,
  WalletType.WC_COSMOSTATION_MOBILE,
  WalletType.METAMASK_SNAP_LEAP,
  WalletType.STATION,
];

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
> & {
  subscription?: (reconnect: () => void) => () => void;
  init?: () => Promise<unknown>;
};

export type SignDirectParams = Parameters<Wallet["signDirect"]>;
export type SignAminoParams = Parameters<Wallet["signAmino"]>;
