import { useGrazInternalStore } from "../../../store";
import type { Wallet } from "../../../types/wallet";
import { WalletType } from "../../../types/wallet";
import { isMobile } from "../../../utils/os";
import { getWalletConnect } from ".";
import type { GetWalletConnectParams } from "./types";

export const getWCCosmostation = (): Wallet => {
  if (!useGrazInternalStore.getState().walletConnect?.options?.projectId?.trim()) {
    throw new Error("walletConnect.options.projectId is not defined");
  }

  if (!isMobile()) throw new Error("WalletConnect Cosmostation mobile is only supported in mobile");

  const params: GetWalletConnectParams = {
    encoding: "hex",
    appUrl: {
      mobile: {
        ios: "cosmostation://",
        android: "cosmostation://",
      },
    },
    walletType: WalletType.WC_COSMOSTATION_MOBILE,
    formatNativeUrl: (appUrl, wcUri, _os) => {
      const plainAppUrl = appUrl.replaceAll("/", "").replaceAll(":", "");
      return `${plainAppUrl}://wc?${wcUri}`;
    },
  };

  return getWalletConnect(params);
};
