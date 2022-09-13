import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { checkWallet } from "../actions/wallet";
import { useGrazStore } from "../store";
import type { WalletType } from "../types/core";

/**
 * graz hook which returns boolean whether Keplr Wallet is supported
 *
 * @example
 * ```ts
 * import { useCheckKeplr } from "graz";
 *
 * const { data: isSupported } = useCheckKeplr();
 * ```
 *
 * @deprecated prefer using {@link useCheckWallet}
 */
export function useCheckKeplr(): UseQueryResult<boolean> {
  return useCheckWallet("keplr");
}

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
export function useCheckWallet(type?: WalletType): UseQueryResult<boolean> {
  const walletType = useGrazStore((x) => type || x.walletType);

  const queryKey = ["USE_CHECK_WALLET", walletType] as const;
  const query = useQuery(queryKey, ({ queryKey: [, _type] }) => checkWallet(_type));

  return query;
}
