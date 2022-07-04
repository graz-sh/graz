import { useMutation, useQuery } from "react-query";
import shallow from "zustand/shallow";

import { connect, disconnect, getBalances } from "../actions/account";
import type { WadestaChain } from "../chains";
import type { WadestaStore } from "../store";
import { useWadestaStore } from "../store";
import type { EventableHooksArgs } from "../types/hooks";

export function useAccount() {
  const account = useWadestaStore((x) => x.account);
  const status = useWadestaStore((x) => x.status);

  return {
    data: account,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    isDisconnected: status === "disconnected",
    isReconnecting: status === "reconnecting",
    status,
  };
}

export const USE_BALANCES_QUERY_KEY = "USE_BALANCES";

export function useBalances(bech32Address?: string) {
  const account = useAccount();
  const address = bech32Address || account.data?.bech32Address;

  const queryKey = [USE_BALANCES_QUERY_KEY, address] as const;
  const query = useQuery(queryKey, ({ queryKey: [, _address] }) => getBalances(_address!), {
    enabled: Boolean(address),
  });

  return {
    data: query.data,
    error: query.error,
    isLoading: query.isLoading,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    status: query.status,
  };
}

export function useCosmWasmClient() {
  return useWadestaStore((x) => x.client);
}

export type UseConnectChainArgs = EventableHooksArgs<WadestaChain, WadestaStore["account"]>;

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
