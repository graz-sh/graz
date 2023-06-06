import type { Keplr } from "@keplr-wallet/types";

export enum WalletType {
  KEPLR = "keplr",
  LEAP = "leap",
  COSMOSTATION = "cosmostation",
  WALLETCONNECT = "walletconnect",
  // eslint-disable-next-line @typescript-eslint/naming-convention
  WC_KEPLR_MOBILE = "wc_keplr_mobile",
  // eslint-disable-next-line @typescript-eslint/naming-convention
  WC_LEAP_MOBILE = "wc_leap_mobile",
  // eslint-disable-next-line @typescript-eslint/naming-convention
  WC_COSMOSTATION_MOBILE = "wc_cosmostation_mobile",
}

export const WALLET_TYPES = [
  WalletType.KEPLR,
  WalletType.LEAP,
  WalletType.COSMOSTATION,
  WalletType.WALLETCONNECT,
  WalletType.WC_KEPLR_MOBILE,
  WalletType.WC_LEAP_MOBILE,
  WalletType.WC_COSMOSTATION_MOBILE,
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
  subscription?: (reconnect: () => void) => void;
  init?: () => Promise<unknown>;
};
