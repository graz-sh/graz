import type { Wallet } from "../../../types/wallet";
import { WalletType } from "../../../types/wallet";
import { createMobileWCWallet } from "./mobile-factory";

export const getWCClot = (): Wallet =>
  createMobileWCWallet(
    WalletType.WC_CLOT_MOBILE,
    {
      encoding: "base64",
      appUrl: { mobile: { ios: "clot://", android: "clot://" } },
      formatNativeUrl: (appUrl, wcUri, os) => {
        const plainAppUrl = appUrl.replace(/\//g, "").replace(/:/g, "");
        const encoded = wcUri && encodeURIComponent(wcUri);
        if (os === "ios") return encoded ? `${plainAppUrl}://wcV2?${encoded}` : `${plainAppUrl}://wcV2`;
        return encoded ? `${plainAppUrl}://wc?uri=${encoded}` : `${plainAppUrl}://wc`;
      },
    },
    "Clot",
  );
