import type { OfflineAminoSigner } from "@cosmjs/amino";
import type { DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing";
import type {
  ChainInfo,
  Keplr,
  KeplrIntereactionOptions,
  KeplrSignOptions,
  Key as KeplrKey,
} from "@keplr-wallet/types";

export enum WalletType {
  KEPLR = "keplr",
  LEAP = "leap",
  VECTIS = "vectis",
  COSMOSTATION = "cosmostation",
  WALLETCONNECT = "walletconnect",
   
  WC_KEPLR_MOBILE = "wc_keplr_mobile",
   
  WC_LEAP_MOBILE = "wc_leap_mobile",
   
  WC_COSMOSTATION_MOBILE = "wc_cosmostation_mobile",
   
  WC_CLOT_MOBILE = "wc_clot_mobile",
   
  METAMASK_SNAP_LEAP = "metamask_snap_leap",
   
  METAMASK_SNAP_COSMOS = "metamask_snap_cosmos",
  STATION = "station",
  XDEFI = "xdefi",
  COSMIFRAME = "cosmiframe",
  COMPASS = "compass",
  INITIA = "initia",
  OKX = "okx",
  PARA = "para",
  CACTUSCOSMOS = "cactuscosmos",
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
  WalletType.WC_CLOT_MOBILE,
  WalletType.METAMASK_SNAP_LEAP,
  WalletType.STATION,
  WalletType.XDEFI,
  WalletType.METAMASK_SNAP_COSMOS,
  WalletType.COSMIFRAME,
  WalletType.COMPASS,
  WalletType.INITIA,
  WalletType.OKX,
  WalletType.PARA,
  WalletType.CACTUSCOSMOS,
];

export type Wallet = Pick<Keplr, "enable" | "signAmino"> & {
  experimentalSuggestChain: (chainInfo: Omit<ChainInfo, "nodeProvider">) => Promise<void>;
  signArbitrary?: Keplr["signArbitrary"];
  signDirect: (...args: SignDirectParams) => Promise<DirectSignResponse>;
  getOfflineSigner: (chainId: string, signOptions?: KeplrSignOptions) => OfflineAminoSigner & OfflineDirectSigner;
  getOfflineSignerOnlyAmino: (chainId: string, signOptions?: KeplrSignOptions) => OfflineAminoSigner;
  getOfflineSignerAuto: (
    chainId: string,
    signOptions?: KeplrSignOptions,
  ) => Promise<OfflineAminoSigner | OfflineDirectSigner>;
  subscription?: (reconnect: () => void) => () => void;
  init?: () => Promise<unknown>;
  disable?: (chainIds?: string | undefined) => Promise<void>;
  setDefaultOptions?: (options: KeplrIntereactionOptions) => void;
  onAfterLoginSuccessful?: () => Promise<void>;
  getKey: (chainId: string) => Promise<Key>;
  getKeys?: (chainIds: string[]) => Promise<(Key | undefined)[]>;
  signEthereum?: Keplr["signEthereum"];
  experimentalSignEIP712CosmosTx_v0?: Keplr["experimentalSignEIP712CosmosTx_v0"];
};

export interface SignDoc {
  bodyBytes?: Uint8Array | null;
  authInfoBytes?: Uint8Array | null;
  chainId?: string | null;
  accountNumber: bigint | null;
}

export type SignDirectParams = [chainId: string, signer: string, signDoc: SignDoc, signOptions?: KeplrSignOptions];
export type SignAminoParams = Parameters<Wallet["signAmino"]>;

export type KnownKeys = Record<string, Key>;

export type Key = Omit<KeplrKey, "ethereumHexAddress">;
