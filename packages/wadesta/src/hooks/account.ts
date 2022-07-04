import type { Key } from "@keplr-wallet/types";
import { useMutation } from "react-query";
import shallow from "zustand/shallow";

import { connect, disconnect } from "../actions/account";
import type { WadestaChain } from "../chains";
import { useWadestaStore } from "../store";
import type { EventableHooksArgs } from "../types/hooks";

export function useAccount() {
  return useWadestaStore((x) => x.account);
}

export function useBalances() {
  return useWadestaStore((x) => x.balances);
}

export function useCosmWasmClient() {
  return useWadestaStore((x) => x.client);
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
