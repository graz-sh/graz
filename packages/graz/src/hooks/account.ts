import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import type { ConnectArgs, ConnectResult } from "../actions/account";
import { connect, disconnect, getOfflineSigners } from "../actions/account";
import type { GrazAccountSession } from "../store";
import { useGrazSessionStore } from "../store";
import type { ChainIdArgs, HookArgs } from "../types/data";
import type { MutationEventArgs } from "../types/hooks";
import { useCheckWallet } from "./wallet";

export interface UseAccountArgs {
  onConnect?: (args: GrazAccountSession & { isReconnect: boolean }) => void;
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
export const useAccount = <T extends ChainIdArgs>(args?: HookArgs<UseAccountArgs, T>) => {
  const sessions = useGrazSessionStore((x) => x.sessions);

  useEffect(() => {
    return useGrazSessionStore.subscribe(
      (x) => x.sessions,
      (stat, prevStat) => {
        stat?.forEach((i) => {
          if (prevStat?.find((y) => y.chainId === i.chainId)?.status !== "connected" && i.status === "connected") {
            args?.onConnect?.({
              account: i.account,
              chainId: i.chainId,
              status: i.status,
              isReconnect: prevStat?.find((j) => j.chainId === i.chainId)?.status === "reconnecting",
            });
          }
          if (i.status === "disconnected") {
            args?.onDisconnect?.();
          }
        });
      },
    );
  }, [args, args?.onConnect, args?.onDisconnect]);

  const singleChain = sessions?.find((i) => i.chainId === args?.chainId);

  const res = args?.chainId
    ? {
        data: singleChain,
        isConnected: Boolean(singleChain?.account),
        isConnecting: singleChain?.status === "connecting",
        isDisconnected: singleChain?.status === "disconnected",
        isReconnecting: singleChain?.status === "reconnecting",
        isLoading: singleChain?.status === "connecting" || status === "reconnecting",
        status: singleChain?.status,
      }
    : sessions?.map((i) => ({
        data: i,
        isConnected: Boolean(i.account),
        isConnecting: i.status === "connecting",
        isDisconnected: i.status === "disconnected",
        isReconnecting: i.status === "reconnecting",
        isLoading: i.status === "connecting" || status === "reconnecting",
        status: i.status,
      }));

  return res as T["chainId"] extends string
    ? {
        data: GrazAccountSession;
        isConnected: boolean;
        isConnecting: boolean;
        isDisconnected: boolean;
        isReconnecting: boolean;
        isLoading: boolean;
        status: GrazAccountSession["status"];
      }
    : {
        data: GrazAccountSession;
        isConnected: boolean;
        isConnecting: boolean;
        isDisconnected: boolean;
        isReconnecting: boolean;
        isLoading: boolean;
        status: GrazAccountSession["status"];
      }[];
};

export type UseConnectChainArgs = MutationEventArgs<ConnectArgs, ConnectResult>;

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
 *  chain:{
 *    rpc: "https://rpc.juno.strange.love",
 *    rest: "https://api.juno.strange.love",
 *    chainId: "juno-1",
 *    ...
 *   }
 * });
 * ```
 *
 * @see {@link connect}
 */
export const useConnect = ({ onError, onLoading, onSuccess }: UseConnectChainArgs = {}) => {
  const queryKey = ["USE_CONNECT", onError, onLoading, onSuccess];
  const mutation = useMutation(queryKey, connect, {
    onError: (err, args) => Promise.resolve(onError?.(err, args)),
    onMutate: onLoading,
    onSuccess: (connectResult) => Promise.resolve(onSuccess?.(connectResult)),
  });
  const { data: isSupported } = useCheckWallet();
  return {
    connect: (args?: ConnectArgs) => mutation.mutate(args),
    connectAsync: (args?: ConnectArgs) => mutation.mutateAsync(args),
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    isSupported: Boolean(isSupported),
    status: mutation.status,
  };
};

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
 *
 * // pass `true` on disconnect to clear recent connected chain
 * disconnect(true);
 * ```
 *
 * @see {@link disconnect}
 */
export const useDisconnect = ({ onError, onLoading, onSuccess }: MutationEventArgs = {}) => {
  const queryKey = ["USE_DISCONNECT", onError, onLoading, onSuccess];
  const mutation = useMutation(queryKey, disconnect, {
    onError: (err) => Promise.resolve(onError?.(err, undefined)),
    onMutate: onLoading,
    onSuccess: () => Promise.resolve(onSuccess?.(undefined)),
  });

  return {
    disconnect: (forget?: boolean) => mutation.mutate(forget),
    disconnectAsync: (forget?: boolean) => mutation.mutateAsync(forget),
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

/**
 * graz hook to retrieve offline signer objects (default, amino enabled, and auto).
 *
 * Note: signer objects is initialized after connecting an account.
 *
 * @example
 * ```ts
 * import { useOfflineSigners } from "graz";
 * const { signer, signerAmino, signerAuto } = useOfflineSigners();
 * ```
 */
export const useOfflineSigners = ({ chainId }: { chainId?: string }) => {
  useQuery(
    [
      "USE_OFFLINE_SIGNERS",
      {
        chainId,
      },
    ],
    async () => {
      const offlineSigners = getOfflineSigners();
      return {
        offlineSigner: offlineSigners.offlineSigner(chainId!),
        offlineSignerAmino: offlineSigners.offlineSignerAmino(chainId!),
        offlineSignerAuto: await offlineSigners.offlineSignerAuto(chainId!),
      };
    },
    { enabled: Boolean(chainId) },
  );
};

/**
 * graz query hook to retrieve list of staked balances from current account or given address.
 *
 * @param bech32Address - Optional bech32 account address, defaults to connected account address
 *
 * @example
 * ```ts
 * import { useBalanceStaked } from "graz";
 *
 * // basic example
 * const { data, isFetching, refetch, ... } = useBalanceStaked();
 *
 * // with custom bech32 address
 * useBalanceStaked("cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu");
 * ```
 */
// export const useBalanceStaked = (bech32Address?: string): UseQueryResult<Coin | null> => {
//   const { data: account } = useAccount();
//   const address = bech32Address || account?.bech32Address;

//   const queryKey = ["USE_BALANCE_STAKED", address] as const;
//   const query = useQuery(queryKey, ({ queryKey: [, _address] }) => getBalanceStaked(address), {
//     enabled: Boolean(address),
//   });

//   return query;
// };
