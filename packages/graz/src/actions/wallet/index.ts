import { isInIframe } from "@dao-dao/cosmiframe";

import { RECONNECT_SESSION_KEY } from "../../constant";
import { grazSessionDefaultValues, useGrazInternalStore, useGrazSessionStore } from "../../store";
import type { Wallet } from "../../types/wallet";
import { WALLET_TYPES, WalletType } from "../../types/wallet";
import { LogCategory } from "../../types/logger";
import { isMobile } from "../../utils/os";
import { getLogger } from "../../utils/logger";
import { getCactusCosmos } from "./cactus";
import { getCompass } from "./compass";
import { getCosmiframe } from "./cosmiframe";
import { getMetamaskSnapCosmos } from "./cosmos-metamask-snap";
import { getCosmostation } from "./cosmostation";
import { getInitia } from "./initia";
import { getKeplr } from "./keplr";
import { selectMetamaskProvider } from "./metamask";
import { getOkx } from "./okx";
import { getPara } from "./para";
import { getStation } from "./station";
import { getVectis } from "./vectis";
import { getWalletConnect } from "./wallet-connect";
import { getWCClot } from "./wallet-connect/clot";
import { getWCCosmostation } from "./wallet-connect/cosmostation";
import { getWCKeplr } from "./wallet-connect/keplr";
import { getXDefi } from "./xdefi";

const walletPresence: Record<WalletType, () => boolean> = {
  [WalletType.KEPLR]: () => typeof window.keplr !== "undefined",
  [WalletType.COSMOSTATION]: () => typeof window.cosmostation?.providers.keplr !== "undefined",
  [WalletType.VECTIS]: () => typeof window.vectis !== "undefined",
  [WalletType.WALLETCONNECT]: () =>
    Boolean(useGrazInternalStore.getState().walletConnect?.options?.projectId?.trim()),
  [WalletType.WC_KEPLR_MOBILE]: () => {
    const pid = useGrazInternalStore.getState().walletConnect?.options?.projectId;
    return isMobile() && Boolean(pid?.trim());
  },
  [WalletType.WC_COSMOSTATION_MOBILE]: () => {
    const pid = useGrazInternalStore.getState().walletConnect?.options?.projectId;
    return isMobile() && Boolean(pid?.trim());
  },
  [WalletType.WC_CLOT_MOBILE]: () => {
    const pid = useGrazInternalStore.getState().walletConnect?.options?.projectId;
    return isMobile() && Boolean(pid?.trim());
  },
  [WalletType.METAMASK_SNAP_COSMOS]: () => Boolean(selectMetamaskProvider()),
  [WalletType.STATION]: () => typeof window.station?.keplr !== "undefined",
  [WalletType.XDEFI]: () => typeof window.xfi?.keplr !== "undefined",
  [WalletType.COSMIFRAME]: () => {
    const state = useGrazInternalStore.getState();
    return Boolean(
      state.iframeOptions && isInIframe() && state.iframeOptions.allowedIframeParentOrigins.length > 0,
    );
  },
  [WalletType.COMPASS]: () => typeof window.compass !== "undefined",
  [WalletType.INITIA]: () => typeof window.initia !== "undefined",
  [WalletType.OKX]: () => typeof window.okxwallet?.keplr !== "undefined",
  [WalletType.PARA]: () => Boolean(useGrazInternalStore.getState().paraConfig?.paraWeb),
  [WalletType.CACTUSCOSMOS]: () => typeof window.cactuslink_cosmos !== "undefined",
};

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
  return walletPresence[type]?.() ?? false;
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
  const logger = getLogger();
  logger.debug(LogCategory.WALLET, "Getting wallet adapter", { function: "getWallet", walletType: type });

  const wallet = (() => {
    switch (type) {
      case WalletType.KEPLR: {
        return getKeplr();
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
      case WalletType.WC_COSMOSTATION_MOBILE: {
        return getWCCosmostation();
      }
      case WalletType.WC_CLOT_MOBILE: {
        return getWCClot();
      }
      case WalletType.METAMASK_SNAP_COSMOS: {
        return getMetamaskSnapCosmos();
      }
      case WalletType.STATION: {
        return getStation();
      }
      case WalletType.XDEFI: {
        return getXDefi();
      }
      case WalletType.COSMIFRAME: {
        return getCosmiframe();
      }
      case WalletType.COMPASS: {
        return getCompass();
      }
      case WalletType.INITIA: {
        return getInitia();
      }
      case WalletType.OKX: {
        return getOkx();
      }
      case WalletType.PARA: {
        return getPara();
      }
      case WalletType.CACTUSCOSMOS: {
        return getCactusCosmos();
      }

      default: {
        logger.warn(LogCategory.WALLET, "Unknown wallet type", { function: "getWallet", walletType: type });
        throw new Error("Unknown wallet type");
      }
    }
  })();
  const options = useGrazInternalStore.getState().walletDefaultOptions;
  if (options) {
    wallet.setDefaultOptions?.(options);
  }

  return wallet;
};

export const getAvailableWallets = (): Record<WalletType, boolean> => {
  return Object.fromEntries(WALLET_TYPES.map((type) => [type, checkWallet(type)])) as Record<WalletType, boolean>;
};

export const isWalletConnect = (type: WalletType): boolean => {
  return (
    type === WalletType.WALLETCONNECT ||
    type === WalletType.WC_KEPLR_MOBILE ||
    type === WalletType.WC_COSMOSTATION_MOBILE ||
    type === WalletType.WC_CLOT_MOBILE
  );
};

export const isPara = (type: WalletType) => {
  return type === WalletType.PARA;
};
