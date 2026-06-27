import { useGrazInternalStore } from "../../../store";
import type { Wallet } from "../../../types/wallet";
import { isMobile } from "../../../utils/os";
import { getWalletConnect } from ".";
import type { GetWalletConnectParams } from "./types";

export const createMobileWCWallet = (
  walletType: GetWalletConnectParams["walletType"],
  params: Omit<GetWalletConnectParams, "walletType">,
  walletName: string,
): Wallet => {
  if (!useGrazInternalStore.getState().walletConnect?.options?.projectId?.trim()) {
    throw new Error("walletConnect.options.projectId is not defined");
  }
  if (!isMobile()) throw new Error(`WalletConnect ${walletName} mobile is only supported in mobile`);
  return getWalletConnect({ ...params, walletType });
};
