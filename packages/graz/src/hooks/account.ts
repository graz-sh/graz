import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import type { ConnectArgs, ConnectResult, OfflineSigners } from "../actions/account";
import { connect, disconnect, getOfflineSigners } from "../actions/account";
import type { GrazAccountSession } from "../store";
import { useGrazSessionStore } from "../store";
import type { ChainIdArgs, HookResultDataWithChainId } from "../types/data";
import type { MutationEventArgs } from "../types/hooks";
import { useCheckWallet } from "./wallet";

type UseConnectOnConnect = GrazAccountSession & { isReconnect: boolean };

export interface UseAccountArgs {
  onConnect?: (args: UseConnectOnConnect) => void;
  onDisconnect?: () => void;
}

/**
 * graz query hook to retrieve account data
 *
 * @param chainId - if provided, it will only return the data of the given chainId
 * @param onConnect - callback function when the account is connected
 * @param onDisconnect - callback function when the account is disconnected
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
export const useAccount = <T extends ChainIdArgs>(args?: UseAccountArgs & T) => {
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

  const res = useMemo(() => {
    if (!sessions) return undefined;
    if (args?.chainId) {
      const singleChainRes = sessions.find((i) => i.chainId === args.chainId);
      return singleChainRes;
    }
    const multiChainRes: Record<string, GrazAccountSession> = {};
    sessions.forEach((i) => {
      multiChainRes[i.chainId] = i;
    });
    return multiChainRes;
  }, [args?.chainId, sessions]);

  return res as HookResultDataWithChainId<GrazAccountSession | undefined, T> | undefined;
};

export type UseConnectChainArgs = MutationEventArgs<ConnectArgs, ConnectResult>;

/**
 * graz mutation hook to execute wallet connection with optional arguments to
 * invoke given functions on error, loading, or success event.
 *
 * @param onError - callback function when the connection is failed
 * @param onLoading - callback function when the connection is loading
 * @param onSuccess - callback function when the connection is successful
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
 * @param onError - callback function when the disconnection is failed
 * @param onLoading - callback function when the disconnection is loading
 * @param onSuccess - callback function when the disconnection is successful
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
 * //disconnect all chains
 * disconnect();
 *
 * //disconnect specific chains
 * disconnect({ chainid: ["cosmoshub-4", "juno-1"] });
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
    disconnect: (args?: { chainid?: string[] }) =>
      mutation.mutate({
        chainId: args?.chainid,
      }),
    disconnectAsync: (args?: { chainid?: string[] }) => mutation.mutateAsync({ chainId: args?.chainid }),
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

/**
 * graz hook to retrieve offline signer objects (default, amino enabled, and auto).
 *
 * @param chainId - chain id arguments
 *
 * @returns if chainId is string it will return an object, otherwise it will return a record of objects
 *
 * @example
 * ```ts
 * import { useOfflineSigners } from "graz";
 *
 * // single chain
 * const { offlineSigner, offlineSignerAmino, offlineSignerAuto } = useOfflineSigners({ chainId: "cosmoshub-4" });
 *
 * // multi chain
 * const offlineSigners = useOfflineSigners();
 * offlineSigners["cosmoshub-4"].offlineSignerAuto;
 *
 * ```
 */
export const useOfflineSigners = <T extends ChainIdArgs>(args?: T) => {
  const accounts = useAccount();

  const query = useQuery(
    [
      "USE_OFFLINE_SIGNERS",
      {
        args,
        accounts,
      },
    ],
    async () => {
      if (!accounts) return undefined;
      const connectedChainIds = Object.keys(accounts)
        .map(([chainId]) => chainId)
        .filter(Boolean) as string[];

      if (args?.chainId) {
        const offlineSigners = await getOfflineSigners({
          chainId: args.chainId,
        });
        return offlineSigners;
      }
      const res: Record<string, OfflineSigners> = {};

      await Promise.all(
        connectedChainIds.map(async (_chainId) => {
          const signers = await getOfflineSigners({
            chainId: _chainId,
          });
          res[_chainId] = signers;
        }),
      );
      return res;
    },
    { enabled: Boolean(accounts), refetchOnMount: false, refetchOnWindowFocus: false },
  );
  return query as UseQueryResult<HookResultDataWithChainId<OfflineSigners, T> | undefined>;
};
