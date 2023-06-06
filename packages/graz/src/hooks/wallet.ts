import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { checkWallet } from "../actions/wallet";
import { useGrazInternalStore } from "../store";
import type { WalletType } from "../types/wallet";

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

  const queryKey = ["USE_CHECK_WALLET", walletType] as const;
  const query = useQuery(queryKey, ({ queryKey: [, _type] }) => checkWallet(_type));

  return query;
};
