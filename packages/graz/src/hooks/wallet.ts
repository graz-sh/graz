import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/shallow";

import { checkWallet } from "../actions/wallet";
import { useGrazInternalStore } from "../store";
import { WalletType } from "../types/wallet";
import { LogCategory } from "../types/logger";
import { getLogger } from "../utils/logger";

/**
 * graz hook to retrieve current active {@link WalletType}
 *
 * @example
 * ```ts
 * import { useActiveWalletType } from "graz";
 * const { walletType } = useActiveWalletType();
 * ```
 */
export const useActiveWalletType = () => {
  return useGrazInternalStore(
    useShallow((x) => ({
      walletType: x.walletType,
      isCosmostation: x.walletType === WalletType.COSMOSTATION,
      isCosmostationMobile: x.walletType === WalletType.WC_COSMOSTATION_MOBILE,
      isKeplr: x.walletType === WalletType.KEPLR,
      isKeplrMobile: x.walletType === WalletType.WC_KEPLR_MOBILE,
      isVectis: x.walletType === WalletType.VECTIS,
      isWalletConnect: x.walletType === WalletType.WALLETCONNECT,
      isStation: x.walletType === WalletType.STATION,
      isCosmiframe: x.walletType === WalletType.COSMIFRAME,
    })),
  );
};

/**
 * graz query hook to check whether given {@link WalletType} or default configured wallet is supported
 *
 * @example
 * ```ts
 * import { useCheckWallet } from "graz";
 *
 * const { data: isSupported } = useCheckWallet();
 * const { data: isKeplrSupported } = useCheckWallet("keplr");
 * ```
 */
export const useCheckWallet = (type?: WalletType): UseQueryResult<boolean> => {
  const walletType = useGrazInternalStore((x) => type || x.walletType);

  const queryKey = ["USE_CHECK_WALLET", walletType];
  const query = useQuery({
    queryKey,
    queryFn: () => {
      const logger = getLogger();
      logger.debug(LogCategory.WALLET, "Checking wallet availability", {
        hook: "useCheckWallet",
        walletType,
      });

      if (!walletType) {
        logger.debug(LogCategory.WALLET, "No wallet type provided", { hook: "useCheckWallet" });
        return false;
      }

      const isAvailable = checkWallet(walletType);
      logger.debug(LogCategory.WALLET, "Wallet check completed", {
        hook: "useCheckWallet",
        walletType,
        isAvailable,
      });

      return isAvailable;
    },
  });

  return query;
};
