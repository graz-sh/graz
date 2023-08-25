import type { StdSignature } from "@cosmjs/amino";

import type { WalletType } from "../../../types/wallet";

export interface WalletConnectSignDirectSigned {
  chainId: string;
  accountNumber: string;
  authInfoBytes: string;
  bodyBytes: string;
}

export interface WalletConnectSignDirectResponse {
  signature: StdSignature;
  signed: WalletConnectSignDirectSigned;
}

export interface GetWalletConnectParams {
  encoding: BufferEncoding;
  walletType: WalletType.WC_KEPLR_MOBILE | WalletType.WC_LEAP_MOBILE;
  appUrl: {
    mobile: {
      ios: string;
      android: string;
    };
  };
  formatNativeUrl: (appUrl: string, wcUri: string, os?: "android" | "ios") => string;
}
