import type { ChainInfo } from "@keplr-wallet/types";
import { useMutation } from "react-query";

import { suggestChain } from "../actions/chains";
import { useWadestaStore } from "../store";
import type { MutationEventArgs } from "../types/hooks";

export function useActiveChain() {
  return useWadestaStore((x) => x.activeChain);
}

export type UseSuggestChainArgs = MutationEventArgs<ChainInfo>;

export function useSuggestChain({ onError, onLoading, onSuccess }: UseSuggestChainArgs = {}) {
  const mutation = useMutation("WADESTA_USE_SUGGEST_CHAIN", suggestChain, {
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
