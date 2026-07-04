import type { Wallet } from "../../../types/wallet";
import { WalletType } from "../../../types/wallet";
import { createMobileWCWallet } from "./mobile-factory";

export const getWCCosmostation = (): Wallet =>
  createMobileWCWallet(
    WalletType.WC_COSMOSTATION_MOBILE,
    {
      encoding: "hex",
      appUrl: { mobile: { ios: "cosmostation://", android: "cosmostation://" } },
      formatNativeUrl: (appUrl, wcUri) => {
        const plainAppUrl = appUrl.replace(/\//g, "").replace(/:/g, "");
        return wcUri ? `${plainAppUrl}://wc?${wcUri}` : `${plainAppUrl}://wc`;
      },
    },
    "Cosmostation",
  );
