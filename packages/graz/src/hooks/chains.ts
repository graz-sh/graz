import type { QueryClient, StakingExtension } from "@cosmjs/stargate";
import type { BondStatusString } from "@cosmjs/stargate/build/modules/staking/queries";
import type { AppCurrency, ChainInfo, Key } from "@keplr-wallet/types";
import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { QueryValidatorsResponse } from "cosmjs-types/cosmos/staking/v1beta1/query";

import { clearRecentChain, getActiveChainCurrency, suggestChain, suggestChainAndConnect } from "../actions/chains";
import type { GrazChain } from "../chains";
import { useGrazStore } from "../store";
import type { MutationEventArgs } from "../types/hooks";
import { useCheckWallet } from "./wallet";

/**
 * graz hook to retrieve connected account's active chain
 *
 * @example
 * ```ts
 * import { useActiveChain } from "graz";
 * const { rpc, rest, chainId, currencies } = useActiveChain();
 * ```
 */
export function useActiveChain(): GrazChain | null {
  return useGrazStore((x) => x.activeChain);
}

/**
 * graz hook to retrieve specific connected account's currency
 *
 * @param denom - Currency denom to search
 *
 * @example
 * ```ts
 * import { useActiveChainCurrency } from "graz";
 * const { data: currency, ... } = useActiveChainCurrency("juno");
 * ```
 */
export function useActiveChainCurrency(denom: string): UseQueryResult<AppCurrency | undefined> {
  const queryKey = ["USE_ACTIVE_CHAIN_CURRENCY", denom] as const;
  const query = useQuery(queryKey, ({ queryKey: [, _denom] }) => getActiveChainCurrency(_denom));
  return query;
}

/**
 * graz hook to retrieve active chain validators with given query client and optional bond status
 *
 * @param queryClient - \@cosmjs/stargate query client object with {@link StakingExtension}
 * @param status - Validator bond status string (defaults to BOND_STATUS_BONDED)
 *
 * @example
 * ```ts
 * import { useActiveChainValidators, useQueryClient } from "graz";
 * import { setupStakingExtension } from "@cosmjs/stargate";
 *
 * const queryClient = useQueryClient(setupStakingExtension);
 * const { data: response, ... } = useActiveChainValidators(queryClient);
 * ```
 */
export function useActiveChainValidators<T extends QueryClient & StakingExtension>(
  queryClient: T | undefined,
  status: BondStatusString = "BOND_STATUS_BONDED",
): UseQueryResult<QueryValidatorsResponse> {
  const queryKey = ["USE_ACTIVE_CHAIN_VALIDATORS", queryClient, status] as const;
  const query = useQuery(
    queryKey,
    ({ queryKey: [, _queryClient, _status] }) => {
      return _queryClient!.staking.validators(_status);
    },
    {
      enabled: typeof queryClient !== "undefined",
    },
  );
  return query;
}

/**
 * graz hook to retrieve last connected chain info
 *
 * @example
 * ```ts
 * import { useRecentChain, connect, mainnetChains } from "graz";
 * const recentChain = useRecentChain();
 * try {
 *   connect();
 * } catch {
 *   connect(mainnetChains.cosmos);
 * }
 * ```
 *
 * @see {@link useActiveChain}
 */
export function useRecentChain() {
  const recentChain = useGrazStore((x) => x.recentChain);
  return { data: recentChain, clear: clearRecentChain };
}

export type UseSuggestChainArgs = MutationEventArgs<ChainInfo>;

/**
 * graz mutation hook to suggest chain to Keplr Wallet
 *
 * @example
 * ```ts
 * import { useSuggestChain } from "graz";
 * const { suggest, isLoading, isSuccess, ... } = useSuggestChain();
 *
 * suggest({
 *    rpc: "https://rpc.cosmoshub.strange.love",
 *    rest: "https://api.cosmoshub.strange.love",
 *    chainId: "cosmoshub-4",
 *    ...
 * });
 * ```
 */
export function useSuggestChain({ onError, onLoading, onSuccess }: UseSuggestChainArgs = {}) {
  const queryKey = ["USE_SUGGEST_CHAIN", onError, onLoading, onSuccess];
  const mutation = useMutation(queryKey, suggestChain, {
    onError: (err, chainInfo) => Promise.resolve(onError?.(err, chainInfo)),
    onMutate: onLoading,
    onSuccess: (chainInfo) => Promise.resolve(onSuccess?.(chainInfo)),
  });

  return {
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    suggest: mutation.mutate,
    suggestAsync: mutation.mutateAsync,
    status: mutation.status,
  };
}

export type UseSuggestChainAndConnectArgs = MutationEventArgs<ChainInfo, { chain: ChainInfo; account: Key }>;

/**
 * graz mutation hook to suggest chain to Keplr Wallet and connect account
 * afterwards
 *
 * @example
 * ```ts
 * import { useSuggestChainAndConnect } from "graz";
 *
 * // basic example
 * const { suggestAndConnect } = useSuggestChainAndConnect();
 *
 * // with event arguments
 * useSuggestChainAndConnect({
 *   onError: (err, chainInfo) => { ... },
 *   onLoading: () => { ... },
 *   onSuccess: ({ account, chain }) => { ... },
 * });
 *
 * // suggest and connect usage
 * suggestAndConnect({
 *    rpc: "https://rpc.cosmoshub.strange.love",
 *    rest: "https://api.cosmoshub.strange.love",
 *    chainId: "cosmoshub-4",
 *    ...
 * });
 * ```
 */
export function useSuggestChainAndConnect({ onError, onLoading, onSuccess }: UseSuggestChainAndConnectArgs = {}) {
  const queryKey = ["USE_SUGGEST_CHAIN_AND_CONNECT", onError, onLoading, onSuccess];
  const mutation = useMutation(queryKey, suggestChainAndConnect, {
    onError: (err, chainInfo) => Promise.resolve(onError?.(err, chainInfo)),
    onMutate: onLoading,
    onSuccess: (res) => Promise.resolve(onSuccess?.(res)),
  });
  const { data: isSupported } = useCheckWallet();
  return {
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    isSupported: Boolean(isSupported),
    status: mutation.status,
    suggestAndConnect: mutation.mutate,
    suggestAndConnectAsync: mutation.mutateAsync,
  };
}
