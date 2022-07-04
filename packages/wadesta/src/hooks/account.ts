import { useMutation, useQuery } from "react-query";
import shallow from "zustand/shallow";

import { connect, disconnect, getBalances } from "../actions/account";
import type { WadestaChain } from "../chains";
import type { WadestaStore } from "../store";
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
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    status: query.status,
  };
}

export function useCosmWasmClient() {
  return useWadestaStore((x) => x.client);
}

export type UseConnectChainArgs = MutationEventArgs<WadestaChain, WadestaStore["account"]>;

export function useConnect({ onError, onLoading, onSuccess }: UseConnectChainArgs = {}) {
  const mutation = useMutation("WADESTA_USE_CONNECT", connect, {
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
  const mutation = useMutation("WADESTA_USE_DISCONNECT", disconnect, {
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
