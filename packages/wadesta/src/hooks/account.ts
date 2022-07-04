import type { Coin } from "@cosmjs/proto-signing";
import type { Key } from "@keplr-wallet/types";
import { useMutation } from "react-query";

import type { BalanceProps } from "../actions/account";
import { connect, disconnect, fetchBalance } from "../actions/account";
import type { WadestaChain } from "../store";
import { useWadestaStore } from "../store";
import type { EventableHooksArgs } from "../types/hooks";

export function useAccount() {
  return useWadestaStore((x) => ({
    account: x.account,
    activeChain: x.activeChain,
    signer: x.signer,
    signerAmino: x.signerAmino,
    signerAuto: x.signerAuto,
  }));
}

export type UseBalanceChainArgs = EventableHooksArgs<BalanceProps, Coin[]> & BalanceProps;

export const USE_BALANCE_QUERY_KEY = "USE_BALANCE";

export function useBalance({ onError, onLoading, onSuccess }: UseBalanceChainArgs = {}) {
  const balance = useWadestaStore((x) => x.balance);
  const mutation = useMutation(USE_BALANCE_QUERY_KEY, fetchBalance, {
    onError: (err, item) => Promise.resolve(onError?.(err, item)),
    onMutate: onLoading,
    onSuccess: (item) => Promise.resolve(onSuccess?.(item)),
  });

  return {
    data: balance,
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    fetchBalance: mutation.mutate,
    fetchBalanceAsync: mutation.mutateAsync,
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
