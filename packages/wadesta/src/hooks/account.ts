import type { Key } from "@keplr-wallet/types";
import { useMutation, useQuery } from "react-query";
import shallow from "zustand/shallow";

import { connect, disconnect, getBalances, reconnect } from "../actions/account";
import type { WadestaChain } from "../chains";
import { useWadestaStore } from "../store";
import type { MutationEventArgs } from "../types/hooks";

export function useAccount() {
  const account = useWadestaStore((x) => x.account);
  const status = useWadestaStore((x) => x.status);

  return {
    data: account,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    isDisconnected: status === "disconnected",
    isReconnecting: status === "reconnecting",
    reconnect,
    status,
  };
}

export function useBalances(bech32Address?: string) {
  const account = useAccount();
  const address = bech32Address || account.data?.bech32Address;

  const queryKey = ["WADESTA_USE_BALANCES", address] as const;
  const query = useQuery(queryKey, ({ queryKey: [, _address] }) => getBalances(_address!), {
    enabled: Boolean(address),
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    status: query.status,
  };
}

export function useCosmWasmClient() {
  return useWadestaStore((x) => x.client);
}

export type UseConnectChainArgs = MutationEventArgs<WadestaChain, Key>;

export function useConnect({ onError, onLoading, onSuccess }: UseConnectChainArgs = {}) {
  const queryKey = ["WADESTA_USE_CONNECT", onError, onLoading, onSuccess];
  const mutation = useMutation(queryKey, connect, {
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

export function useDisconnect({ onError, onLoading, onSuccess }: MutationEventArgs = {}) {
  const queryKey = ["WADESTA_USE_DISCONNECT", onError, onLoading, onSuccess];
  const mutation = useMutation(queryKey, disconnect, {
    onError: (err) => Promise.resolve(onError?.(err, undefined)),
    onMutate: onLoading,
    onSuccess: () => Promise.resolve(onSuccess?.(undefined)),
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

export function useSigners() {
  return useWadestaStore(
    (x) => ({
      signer: x.signer,
      signerAmino: x.signerAmino,
      signerAuto: x.signerAuto,
    }),
    shallow,
  );
}
