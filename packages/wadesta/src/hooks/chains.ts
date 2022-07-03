import type { ChainInfo } from "@keplr-wallet/types";
import { useMutation } from "react-query";

import { suggestChain } from "../actions/chains";
import type { EventableHooksArgs } from "../types/hooks";

export type UseSuggestChainArgs = EventableHooksArgs<ChainInfo>;

export const USE_SUGGEST_CHAIN_QUERY_KEY = "USE_SUGGEST_CHAIN";

export function useSuggestChain({ onError, onLoading, onSuccess }: UseSuggestChainArgs = {}) {
  const mutation = useMutation(USE_SUGGEST_CHAIN_QUERY_KEY, suggestChain, {
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
