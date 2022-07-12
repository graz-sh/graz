import type { Key } from "@keplr-wallet/types";
import { useEffect } from "react";
import { useMutation, useQuery } from "react-query";
import shallow from "zustand/shallow";

import type { ConnectArgs } from "../actions/account";
import { connect, disconnect, getBalances, reconnect } from "../actions/account";
import { useGrazStore } from "../store";
import type { MutationEventArgs } from "../types/hooks";
import { useCheckKeplr } from "./keplr";

export interface UseAccountArgs {
  onConnect?: (args: { account: Key; isReconnect: boolean }) => void;
  onDisconnect?: () => void;
}

/**
 * graz query hook to retrieve account data with optional arguments to invoke
 * given function on connect/disconnect.
 *
 * @example
 * ```tsx
 * import { useAccount } from "graz";
 *
 * // basic example
 * const { data, isConnecting, isConnected, ... } = useAccount();
 *
 * // with event arguments
 * useAccount({
 *   onConnect: ({ account, isReconnect }) => { ... },
 *   onDisconnect: () => { ... },
 * });
 * ```
 */
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

/**
 * graz query hook to retrieve list of balances from current account or given address.
 *
 * @param bech32Address - Optional bech32 account address, defaults to connected account address
 *
 * @example
 * ```ts
 * import { useBalances } from "graz";
 *
 * // basic example
 * const { data, isFetching, refetch, ... } = useBalances();
 *
 * // with custom bech32 address
 * useBalances("cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu");
 * ```
 */
export function useBalances(bech32Address?: string) {
  const { data: account } = useAccount();
  const address = bech32Address || account?.bech32Address;

  const queryKey = ["USE_BALANCES", address] as const;
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

export type UseConnectChainArgs = MutationEventArgs<ConnectArgs, Key>;

/**
 * graz mutation hook to execute wallet connection with optional arguments to
 * invoke given functions on error, loading, or success event.
 *
 * @example
 * ```ts
 * import { useConnect, mainnetChains } from "graz";
 *
 * // basic example
 * const { connect, isLoading, isSuccess, ... } = useConnect();
 *
 * // with event arguments
 * useConnect({
 *   onError: (err, chain) => { ... },
 *   onLoading: (chain) => { ... },
 *   onSuccess: (account) => { ... },
 * });
 *
 * // use graz provided chain information
 * connect(mainnetChains.cosmos);
 *
 * // use custom chain information
 * connect({
 *   rpc: "https://rpc.juno.strange.love",
 *   rest: "https://api.juno.strange.love",
 *   chainId: "juno-1",
 *   ...
 * });
 * ```
 *
 * @see {@link connect}
 */
export function useConnect({ onError, onLoading, onSuccess }: UseConnectChainArgs = {}) {
  const queryKey = ["USE_CONNECT", onError, onLoading, onSuccess];
  const mutation = useMutation(queryKey, connect, {
    onError: (err, args) => Promise.resolve(onError?.(err, args)),
    onMutate: onLoading,
    onSuccess: (account) => Promise.resolve(onSuccess?.(account)),
  });

  return {
    connect: (args?: ConnectArgs) => mutation.mutate(args),
    connectAsync: (args?: ConnectArgs) => mutation.mutateAsync(args),
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    isSupported: useCheckKeplr(),
    status: mutation.status,
  };
}

/**
 * graz mutation hook to execute wallet disconnection with optional arguments to
 * invoke given functions on error, loading, or success event.
 *
 * @example
 * ```ts
 * import { useDisconnect } from "graz";
 *
 * // basic eaxmple
 * const { disconnect, isLoading, isSuccess, ... } = useDisconnect();
 *
 * // with event arguments
 * useDisconnect({
 *   onError: (err) => { ... },
 *   onLoading: () => { ... },
 *   onSuccess: () => { ... },
 * });
 * ```
 *
 * @see {@link disconnect}
 */
export function useDisconnect({ onError, onLoading, onSuccess }: MutationEventArgs = {}) {
  const queryKey = ["USE_DISCONNECT", onError, onLoading, onSuccess];
  const mutation = useMutation(queryKey, disconnect, {
    onError: (err) => Promise.resolve(onError?.(err, undefined)),
    onMutate: onLoading,
    onSuccess: () => Promise.resolve(onSuccess?.(undefined)),
  });

  return {
    disconnect: () => mutation.mutate(undefined),
    disconnectAsync: () => mutation.mutateAsync(undefined),
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
}

/**
 * graz hook to retrieve offline signer objects (default, amino enabled, and auto).
 *
 * Note: signer objects is initialized after connecting an account.
 *
 * @example
 * ```ts
 * import { useSigners } from "graz";
 * const { signer, signerAmino, signerAuto } = useSigners();
 * ```
 */
export function useSigners() {
  return useGrazStore(
    (x) => ({
      signer: x.offlineSigner,
      signerAmino: x.offlineSignerAmino,
      signerAuto: x.offlineSignerAuto,
    }),
    shallow,
  );
}
