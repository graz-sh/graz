import type { Coin } from "@cosmjs/proto-signing";
import type { Key } from "@keplr-wallet/types";
import { useMutation } from "react-query";

import type { BalanceProps } from "../actions/account";
import { connect, disconnect, fetchBalance } from "../actions/account";
import type { WadestaChain } from "../chains";
import { useWadestaStore } from "../store";
import type { EventableHooksArgs } from "../types/hooks";

export function useAccount() {
  return useWadestaStore((x) => x.account);
}

export type UseBalanceChainArgs = EventableHooksArgs<BalanceProps, Coin[]>;

export const USE_BALANCE_QUERY_KEY = "USE_BALANCE";

export function useBalance({ onError, onLoading, onSuccess }: UseBalanceChainArgs = {}) {
  const mutation = useMutation(USE_BALANCE_QUERY_KEY, fetchBalance, {
    onError: (err, item) => Promise.resolve(onError?.(err, item)),
    onMutate: onLoading,
    onSuccess: (item) => Promise.resolve(onSuccess?.(item)),
  });

  return {
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    balance: mutation.mutate,
    balanceAsync: mutation.mutateAsync,
  };
}

export type UseConnectChainArgs = EventableHooksArgs<WadestaChain, Key>;

export const USE_CONNECT_QUERY_KEY = "USE_CONNECT";

export function useConnect({ onError, onLoading, onSuccess }: UseConnectChainArgs = {}) {
  const mutation = useMutation(USE_CONNECT_QUERY_KEY, connect, {
    onError: (err, chain) => Promise.resolve(onError?.(err, chain)),
    onMutate: onLoading,
    onSuccess: (chain) => Promise.resolve(onSuccess?.(chain)),
  });

  return {
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    connect: mutation.mutate,
    connectAsync: mutation.mutateAsync,
    status: mutation.status,
  };
}

export const USE_DISCONNECT_QUERY_KEY = "USE_DISCONNECT";

export function useDisconnect({ onError, onLoading, onSuccess }: EventableHooksArgs = {}) {
  const mutation = useMutation(USE_DISCONNECT_QUERY_KEY, disconnect, {
    onError: (err) => Promise.resolve(onError?.(err)),
    onMutate: onLoading,
    onSuccess: () => Promise.resolve(onSuccess?.()),
  });

  return {
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    disconnect: mutation.mutate,
    disconnectAsync: mutation.mutateAsync,
    status: mutation.status,
  };
}
