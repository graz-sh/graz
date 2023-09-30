import { RECONNECT_SESSION_KEY } from "../../constant";
import { grazSessionDefaultValues, useGrazInternalStore, useGrazSessionStore } from "../../store";
import type { Wallet } from "../../types/wallet";
import { WALLET_TYPES, WalletType } from "../../types/wallet";
import { getCosmostation } from "./cosmostation";
import { getKeplr } from "./keplr";
import { getLeap } from "./leap";
import { getMetamaskSnapLeap } from "./metamask-snap/leap";
import { getVectis } from "./vectis";
import { getWalletConnect } from "./wallet-connect";
import { getWCCosmostation } from "./wallet-connect/cosmostation";
import { getWCKeplr } from "./wallet-connect/keplr";
import { getWCLeap } from "./wallet-connect/leap";

/**
 * Function to check whether given {@link WalletType} or default configured wallet exists.
 *
 * @example
 * ```ts
 * const isSupported = checkWallet();
 * const isKeplrSupported = checkWallet("keplr");
 * ```
 */
export const checkWallet = (type: WalletType = useGrazInternalStore.getState().walletType): boolean => {
  try {
    getWallet(type);
    return true;
  } catch (error) {
    return false;
  }
};

export const clearSession = () => {
  window.sessionStorage.removeItem(RECONNECT_SESSION_KEY);
  useGrazSessionStore.setState(grazSessionDefaultValues);
};

/**
 * Function to return wallet object based on given {@link WalletType} or from store and throws an error if it does not
 * exist on `window` or unknown wallet type.
 *
 * @example
 * ```ts
 * const wallet = getWallet();
 * const keplr = getWallet("keplr");
 * ```
 *
 * @see {@link getKeplr}
 */
export const getWallet = (type: WalletType = useGrazInternalStore.getState().walletType): Wallet => {
  switch (type) {
    case WalletType.KEPLR: {
      return getKeplr();
    }
    case WalletType.LEAP: {
      return getLeap();
    }
    case WalletType.COSMOSTATION: {
      return getCosmostation();
    }
    case WalletType.VECTIS: {
      return getVectis();
    }
    case WalletType.WALLETCONNECT: {
      return getWalletConnect();
    }
    case WalletType.WC_KEPLR_MOBILE: {
      return getWCKeplr();
    }
    case WalletType.WC_LEAP_MOBILE: {
      return getWCLeap();
    }
    case WalletType.WC_COSMOSTATION_MOBILE: {
      return getWCCosmostation();
    }
    case WalletType.METAMASK_SNAP_LEAP: {
      return getMetamaskSnapLeap();
    }
    default: {
      throw new Error("Unknown wallet type");
    }
  }
};

export const getAvailableWallets = (): Record<WalletType, boolean> => {
  return Object.fromEntries(WALLET_TYPES.map((type) => [type, checkWallet(type)])) as Record<WalletType, boolean>;
};

export const isWalletConnect = (type: WalletType): boolean => {
  return (
    type === WalletType.WALLETCONNECT ||
    type === WalletType.WC_KEPLR_MOBILE ||
    type === WalletType.WC_LEAP_MOBILE ||
    type === WalletType.WC_COSMOSTATION_MOBILE
  );
};
