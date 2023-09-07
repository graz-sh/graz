import type { QueryClient, StakingExtension } from "@cosmjs/stargate";
import type { BondStatusString } from "@cosmjs/stargate/build/modules/staking/queries";
import type { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { QueryValidatorsResponse } from "cosmjs-types/cosmos/staking/v1beta1/query";

import type { ConnectResult } from "../actions/account";
import type { SuggestChainAndConnectArgs } from "../actions/chains";
import { clearRecentChain, suggestChain, suggestChainAndConnect } from "../actions/chains";
import { useGrazInternalStore, useGrazSessionStore } from "../store";
import type { MutationEventArgs } from "../types/hooks";
import { useCheckWallet } from "./wallet";

/**
 * graz hook to retrieve connected account's active chainIds
 *
 * @example
 * ```ts
 * import { useActiveChainIds } from "graz";
 * const activeChainIds = useActiveChainIds();
 * ```
 */
export const useActiveChainIds = (): string[] | null => {
  return useGrazSessionStore((x) => x.activeChainIds);
};

/**
 * graz hook to retrieve connected account's active chains
 *
 * @example
 * ```ts
 * import { useActiveChains } from "graz";
 * const activeChains = useActiveChains();
 * const { rpc, rest, chainId, currencies } = activeChains[0];
 * ```
 */
export const useActiveChains = (): ChainInfo[] | undefined => {
  return useGrazSessionStore((x) => x.activeChainIds)
    ?.map((chainId) => {
      const chain = useGrazInternalStore.getState().chains?.find((x) => x.chainId === chainId);
      if (!chain) return;
      return chain;
    })
    .filter(Boolean) as ChainInfo[] | undefined;
};

/**
 * graz hook to retrieve specific connected chains currency
 *
 * @param denom - Currency denom to search
 *
 * @example
 * ```ts
 * import { useActiveChainCurrency } from "graz";
 * const { data: currency, ... } = useActiveChainCurrency({denom: "juno"});
 * ```
 */
export const useActiveChainCurrency = ({ denom }: { denom: string }): UseQueryResult<AppCurrency | undefined> => {
  const chains = useActiveChains();
  const queryKey = ["USE_ACTIVE_CHAIN_CURRENCY", denom] as const;
  const query = useQuery(
    queryKey,
    ({ queryKey: [, _denom] }) =>
      chains?.find((c) => c.currencies.find((x) => x.coinMinimalDenom === _denom))?.currencies.find((x) => x),
  );
  return query;
};

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
export const useQueryClientValidators = <T extends QueryClient & StakingExtension>(args: {
  queryClient: T | undefined;
  status?: BondStatusString;
}): UseQueryResult<QueryValidatorsResponse> => {
  const status = args?.status ?? "BOND_STATUS_BONDED";
  const queryKey = ["USE_ACTIVE_CHAIN_VALIDATORS", args.queryClient, status] as const;
  const query = useQuery(
    queryKey,
    async ({ queryKey: [, _queryClient, _status] }) => {
      if (!_queryClient) throw new Error("Query client is not defined");
      const res = await _queryClient.staking.validators(_status);
      return res;
    },
    {
      enabled: typeof args.queryClient !== "undefined",
    },
  );
  return query;
};

/**
 * graz hook to retrieve last connected chainIds
 *
 * @example
 * ```ts
 * import { useRecentChainIds, connect, mainnetChains } from "graz";
 * const { data: recentChainIds, clear } = useRecentChainIds();
 * try {
 *   connect(mainnetChains.cosmos);
 * } catch {
 *   connect(recentChainIds);
 * }
 * ```
 *
 * @see {@link useActiveChainIds}
 */
export const useRecentChainIds = () => {
  const recentChain = useGrazInternalStore((x) => x.recentChainIds);
  return { data: recentChain, clear: clearRecentChain };
};

/**
 * graz hook to retrieve last connected chains
 *
 * @example
 * ```ts
 * import { useRecentChains, connect, mainnetChains } from "graz";
 *
 * const recentChains = useRecentChains();
 * const { rpc, rest, chainId, currencies } = activeChains[0];
 * ```
 *
 * @see {@link useActiveChains}
 */
export const useRecentChains = () => {
  const data = useGrazInternalStore((x) => x.recentChainIds)
    ?.map((chainId) => {
      const chain = useGrazInternalStore.getState().chains?.find((x) => x.chainId === chainId);
      if (!chain) return;
      return chain;
    })
    .filter(Boolean) as ChainInfo[] | undefined;
  return { data, clear: clearRecentChain };
};

export type UseSuggestChainArgs = MutationEventArgs<ChainInfo>;

/**
 * graz mutation hook to suggest chain to a Wallet
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
export const useSuggestChain = ({ onError, onLoading, onSuccess }: UseSuggestChainArgs = {}) => {
  const queryKey = ["USE_SUGGEST_CHAIN", onError, onLoading, onSuccess];
  const mutation = useMutation(queryKey, suggestChain, {
    onError: (err, args) => Promise.resolve(onError?.(err, args.chainInfo)),
    onMutate: (data) => onLoading?.(data.chainInfo),
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
};

export type UseSuggestChainAndConnectArgs = MutationEventArgs<SuggestChainAndConnectArgs, ConnectResult>;

/**
 * graz mutation hook to suggest chain to a Wallet and connect account
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
 *   chainInfo: {
 *     rpc: "https://rpc.cosmoshub.strange.love",
 *     rest: "https://api.cosmoshub.strange.love",
 *     chainId: "cosmoshub-4",
 *     ...
 *   },
 *   ...
 * });
 * ```
 */
export const useSuggestChainAndConnect = ({ onError, onLoading, onSuccess }: UseSuggestChainAndConnectArgs = {}) => {
  const queryKey = ["USE_SUGGEST_CHAIN_AND_CONNECT", onError, onLoading, onSuccess];
  const mutation = useMutation(queryKey, suggestChainAndConnect, {
    onError: (err, args) => Promise.resolve(onError?.(err, args)),
    onMutate: (args) => onLoading?.(args),
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
};
