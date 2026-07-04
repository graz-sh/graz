import type { Wallet } from "../../../types/wallet";
import { WalletType } from "../../../types/wallet";
import { createMobileWCWallet } from "./mobile-factory";

export const getWCKeplr = (): Wallet =>
  createMobileWCWallet(
    WalletType.WC_KEPLR_MOBILE,
    {
      encoding: "base64",
      appUrl: { mobile: { ios: "keplrwallet://", android: "intent://" } },
      formatNativeUrl: (appUrl, wcUri, os) => {
        const plainAppUrl = appUrl.replace(/\//g, "").replace(/:/g, "");
        const encoded = wcUri && encodeURIComponent(wcUri);
        switch (os) {
          case "ios":
            return encoded
              ? `${plainAppUrl}://wcV2?${encoded}`
              : `${plainAppUrl}://wcV2`;
          case "android":
            return encoded
              ? `${plainAppUrl}://wcV2?${encoded}#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;`
              : `${plainAppUrl}://wcV2#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;`;
          default:
            return encoded ? `${plainAppUrl}://wc?uri=${encoded}` : `${plainAppUrl}://wc`;
        }
      },
    },
    "Keplr",
  );
