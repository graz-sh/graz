import type { QueryClient, StakingExtension } from "@cosmjs/stargate";
import type { BondStatusString } from "@cosmjs/stargate/build/modules/staking/queries";
import type { AppCurrency, ChainInfo } from "@keplr-wallet/types";
import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { QueryValidatorsResponse } from "cosmjs-types/cosmos/staking/v1beta1/query";

import type { ConnectResult } from "../actions/account";
import type { SuggestChainAndConnectArgs } from "../actions/chains";
import { addChain, clearRecentChain, suggestChain, suggestChainAndConnect } from "../actions/chains";
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
  const activeChainIds = useGrazSessionStore((x) => x.activeChainIds);
  const chains = useGrazInternalStore((x) => x.chains);

  return activeChainIds
    ?.map((chainId) => {
      const chain = chains?.find((x) => x.chainId === chainId);
      if (!chain) return;
      return chain;
    })
    .filter(Boolean) as ChainInfo[] | undefined;
};

/**
 * graz hook to retrieve ChainInfo object from GrazProvider with given chainId
 *
 * @param chainId - chainId to search
 *
 * @example
 * ```ts
 * import { useChain } from "graz";
 * const chainInfo = useChainInfo({chainId: "cosmoshub-4"});
 * ```
 */
export const useChainInfo = ({ chainId }: { chainId?: string } = {}) => {
  return useGrazInternalStore((x) => x.chains)?.find((x) => x.chainId === chainId);
};

/**
 * graz hook to retrieve ChainInfo objects from GrazProvider with given chainId
 *
 * @param chainId - chainId array to filter. If not provided, returns all chains
 *
 * @example
 * ```ts
 * import { useChainInfos } from "graz";
 *
 * // Get specific chains
 * const chainInfos = useChainInfos({chainId: ["cosmoshub-4", "juno-1"]});
 *
 * // Get all chains
 * const allChains = useChainInfos();
 * ```
 */
export const useChainInfos = ({ chainId }: { chainId?: string[] } = {}) => {
  const chains = useGrazInternalStore((x) => x.chains);
  if (!chainId) return chains;
  return chains?.filter((x) => chainId.includes(x.chainId));
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
  const queryKey = ["USE_ACTIVE_CHAIN_CURRENCY", denom];
  const query = useQuery({
    queryKey,
    queryFn: ({ queryKey: [, _denom] }) =>
      chains?.find((c) => c.currencies.find((x) => x.coinMinimalDenom === _denom))?.currencies.find((x) => x),
  });
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
  const status = args.status ?? "BOND_STATUS_BONDED";
  const queryKey = ["USE_ACTIVE_CHAIN_VALIDATORS", args.queryClient, status];
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!args.queryClient) throw new Error("Query client is not defined");
      const res = await args.queryClient.staking.validators(status);
      return res;
    },
    enabled: typeof args.queryClient !== "undefined",
  });
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
  const recentChainIds = useGrazInternalStore((x) => x.recentChainIds);
  const chains = useGrazInternalStore((x) => x.chains);

  const data = recentChainIds
    ?.map((chainId) => {
      const chain = chains?.find((x) => x.chainId === chainId);
      if (!chain) return;
      return chain;
    })
    .filter(Boolean) as ChainInfo[] | undefined;
  return { data, clear: clearRecentChain };
};

export type UseAddChainArgs = MutationEventArgs<ChainInfo>;

/**
 * graz mutation hook to add chain to the internal store
 * without suggesting it to the wallet
 *
 * @example
 * ```ts
 * import { useAddChain } from "graz";
 * const { addChain, isLoading, isSuccess, ... } = useAddChain();
 *
 * addChain({
 *    chainInfo: {
 *      rpc: "https://rpc.cosmoshub.strange.love",
 *      rest: "https://api.cosmoshub.strange.love",
 *      chainId: "cosmoshub-4",
 *      chainName: "Cosmos Hub",
 *      stakeCurrency: {
 *        coinDenom: "ATOM",
 *        coinMinimalDenom: "uatom",
 *        coinDecimals: 6,
 *      },
 *      bip44: {
 *        coinType: 118,
 *      },
 *      bech32Config: {
 *        bech32PrefixAccAddr: "cosmos",
 *        bech32PrefixAccPub: "cosmospub",
 *        bech32PrefixValAddr: "cosmosvaloper",
 *        bech32PrefixValPub: "cosmosvaloperpub",
 *        bech32PrefixConsAddr: "cosmosvalcons",
 *        bech32PrefixConsPub: "cosmosvalconspub",
 *      },
 *      currencies: [
 *        {
 *          coinDenom: "ATOM",
 *          coinMinimalDenom: "uatom",
 *          coinDecimals: 6,
 *        },
 *      ],
 *      feeCurrencies: [
 *        {
 *          coinDenom: "ATOM",
 *          coinMinimalDenom: "uatom",
 *          coinDecimals: 6,
 *        },
 *      ],
 *    }
 * });
 * ```
 */
export const useAddChain = ({ onError, onLoading, onSuccess }: UseAddChainArgs = {}) => {
  const mutationKey = ["USE_ADD_CHAIN", onError, onLoading, onSuccess];
  const mutation = useMutation({
    mutationKey,
    mutationFn: addChain,
    onError: (err, args) => Promise.resolve(onError?.(err, args.chainInfo)),
    onMutate: (data) => onLoading?.(data.chainInfo),
    onSuccess: (chainInfo) => Promise.resolve(onSuccess?.(chainInfo)),
  });

  return {
    addChain: mutation.mutate,
    addChainAsync: mutation.mutateAsync,
    error: mutation.error,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
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
  const mutationKey = ["USE_SUGGEST_CHAIN", onError, onLoading, onSuccess];
  const mutation = useMutation({
    mutationKey,
    mutationFn: suggestChain,
    onError: (err, args) => Promise.resolve(onError?.(err, args.chainInfo)),
    onMutate: (data) => onLoading?.(data.chainInfo),
    onSuccess: (chainInfo) => Promise.resolve(onSuccess?.(chainInfo)),
  });

  return {
    error: mutation.error,
    isLoading: mutation.isPending,
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
  const mutationKey = ["USE_SUGGEST_CHAIN_AND_CONNECT", onError, onLoading, onSuccess];
  const mutation = useMutation({
    mutationKey,
    mutationFn: suggestChainAndConnect,
    onError: (err, args) => Promise.resolve(onError?.(err, args)),
    onMutate: (args) => onLoading?.(args),
    onSuccess: (res) => Promise.resolve(onSuccess?.(res)),
  });
  const { data: isSupported } = useCheckWallet();
  return {
    error: mutation.error,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isSupported: Boolean(isSupported),
    status: mutation.status,
    suggestAndConnect: mutation.mutate,
    suggestAndConnectAsync: mutation.mutateAsync,
  };
};
