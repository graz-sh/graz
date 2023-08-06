import type { QueryClient, StakingExtension } from "@cosmjs/stargate";
import type { BondStatusString } from "@cosmjs/stargate/build/modules/staking/queries";
import type { ChainInfo } from "@keplr-wallet/types";
import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { QueryValidatorsResponse } from "cosmjs-types/cosmos/staking/v1beta1/query";

import type { ConnectResult } from "../actions/account";
import type { SuggestChainAndConnectArgs } from "../actions/chains";
import { clearRecentChain, suggestChain, suggestChainAndConnect } from "../actions/chains";
import { useGrazInternalStore } from "../store";
import type { MutationEventArgs } from "../types/hooks";
import type { WalletType } from "../types/wallet";
import { useCheckWallet } from "./wallet";

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
export const useActiveChainValidators = <T extends QueryClient & StakingExtension>(
  queryClient: T | undefined,
  status: BondStatusString = "BOND_STATUS_BONDED",
): UseQueryResult<QueryValidatorsResponse> => {
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
};

/**
 * graz hook to retrieve last connected chain ids
 *
 * @example
 * ```ts
 * import { useRecentChain, connect, mainnetChains } from "graz";
 * const { data: recentChain, clear } = useRecentChain();
 * try {
 *   connect({chainId: [mainnetChains.cosmos]});
 * } catch {
 *   connect({chainId: recentChain});
 * }
 * ```
 */
export const useRecentChains = () => {
  const recentChains = useGrazInternalStore((x) => x.recentChains);
  return { data: recentChains, clear: clearRecentChain };
};

export type UseSuggestChainArgs = MutationEventArgs<{
  chainInfo: ChainInfo;
  walletType?: WalletType;
}>;

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
    onError: (err, args) => Promise.resolve(onError?.(err, args)),
    onMutate: onLoading,
    onSuccess: (args) => Promise.resolve(onSuccess?.(args)),
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

/**
 * graz hook to retrieve chain data and usefull functions with given chainId
 * @param chainId - Chain ID string
 *
 * @example
 * ```ts
 * import { useChain } from "graz";
 * const { data: chain } = useChain("cosmoshub-4");
 * ```
 */
export const useChain = ({ chainId }: { chainId: string }) => {
  const chains = useGrazInternalStore((x) => x.chains);
  const chain = chains?.find((x) => x.chainId === chainId);
  if (!chain) return;

  const currencies = chain.currencies;

  const convertMinimalDenomToDenom = (searchMinimalDenom: string, value: string) => {
    const currency = chain.currencies.find((x) => x.coinMinimalDenom === searchMinimalDenom);
    if (!currency) return;
    return {
      denom: currency.coinDenom,
      value: String(Number(value) / Math.pow(10, currency.coinDecimals)),
    };
  };

  return {
    convertMinimalDenomToDenom,
    currencies,
    data: chain,
  };
};
