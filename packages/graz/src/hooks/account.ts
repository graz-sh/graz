import type { Key } from "@keplr-wallet/types";
import { useEffect } from "react";
import { useMutation, useQuery } from "react-query";
import shallow from "zustand/shallow";

import { connect, disconnect, getBalances, reconnect } from "../actions/account";
import type { GrazChain } from "../chains";
import { useGrazStore } from "../store";
import type { MutationEventArgs } from "../types/hooks";
import { useCheckKeplr } from "./keplr";

export interface UseAccountArgs {
  onConnect?: (args: { account: Key; isReconnect: boolean }) => void;
  onDisconnect?: () => void;
}

export function useAccount({ onConnect, onDisconnect }: UseAccountArgs = {}) {
  const account = useGrazStore((x) => x.account);
  const status = useGrazStore((x) => x.status);

  useEffect(() => {
    return useGrazStore.subscribe(
      (x) => x.status,
      (stat, prevStat) => {
        if (stat === "connected") {
          const current = useGrazStore.getState();
          onConnect?.({ account: current.account!, isReconnect: prevStat === "reconnecting" });
        }
        if (stat === "disconnected") {
          onDisconnect?.();
        }
      },
    );
  }, [onConnect, onDisconnect]);

  return {
    data: account,
    isConnected: Boolean(account),
    isConnecting: status === "connecting",
    isDisconnected: status === "disconnected",
    isReconnecting: status === "reconnecting",
    reconnect,
    status,
  };
}

export function useBalances(bech32Address?: string) {
  const { data: account } = useAccount();
  const address = bech32Address || account?.bech32Address;

  const queryKey = ["WADESTA_USE_BALANCES", address] as const;
  const query = useQuery(queryKey, ({ queryKey: [, _address] }) => getBalances(_address!), {
    enabled: Boolean(address),
  });

  return {
    data: query.data,
    error: query.error,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    status: query.status,
  };
}

export function useCosmWasmClient() {
  return useGrazStore((x) => x.client);
}

export type UseConnectChainArgs = MutationEventArgs<GrazChain, Key>;

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
    isSupported: useCheckKeplr(),
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
  return useGrazStore(
    (x) => ({
      signer: x.signer,
      signerAmino: x.signerAmino,
      signerAuto: x.signerAuto,
    }),
    shallow,
  );
}
