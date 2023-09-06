import type { Coin } from "@cosmjs/proto-signing";
import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import type { ConnectArgs, ConnectResult } from "../actions/account";
import { connect, disconnect, getOfflineSigners, reconnect } from "../actions/account";
import { checkWallet } from "../actions/wallet";
import { useGrazInternalStore, useGrazSessionStore } from "../store";
import type { MutationEventArgs } from "../types/hooks";
import { useStargateClient } from "./clients";
import { useCheckWallet } from "./wallet";

export interface UseAccountArgs {
  onConnect?: (args: ConnectResult & { isReconnect: boolean }) => void;
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
export const useAccount = ({ onConnect, onDisconnect }: UseAccountArgs = {}) => {
  const _account = useGrazSessionStore((x) => x.accounts);
  const status = useGrazSessionStore((x) => x.status);

  useEffect(() => {
    return useGrazSessionStore.subscribe(
      (x) => x.status,
      (stat, prevStat) => {
        if (stat === "connected") {
          const { accounts: account, activeChainIds: activeChain } = useGrazSessionStore.getState();
          const { walletType } = useGrazInternalStore.getState();
          onConnect?.({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            account: account!,

            chain: activeChain,
            walletType,
            isReconnect: prevStat === "reconnecting",
          });
        }
        if (stat === "disconnected") {
          onDisconnect?.();
        }
      },
    );
  }, [onConnect, onDisconnect]);

  return {
    data: _account,
    isConnected: Boolean(_account),
    isConnecting: status === "connecting",
    isDisconnected: status === "disconnected",
    isReconnecting: status === "reconnecting",
    isLoading: status === "connecting" || status === "reconnecting",
    reconnect,
    status,
  };
};

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
export const useBalances = (bech32Address?: string): UseQueryResult<Coin[]> => {
  const { data: account } = useAccount();
  const { data: client } = useStargateClient();
  const { activeChainIds: activeChain } = useGrazSessionStore.getState();
  const address = bech32Address || account?.bech32Address;

  const queryKey = useMemo(
    () => ["USE_ALL_BALANCES", client, activeChain, address] as const,
    [activeChain, address, client],
  );

  const query = useQuery(
    queryKey,
    async ({ queryKey: [, _client, _activeChain, _address] }) => {
      if (!_activeChain || !_client) {
        throw new Error("No connected account detected");
      }
      if (!_address) {
        throw new Error("address is not defined");
      }
      const balances = await _client.getAllBalances(_address);
      return balances as Coin[];
    },
    {
      enabled: Boolean(address) && Boolean(activeChain) && Boolean(client),
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  );

  return query;
};

/**
 * graz query hook to retrieve specific asset balance from current account or given address.
 *
 * @param denom - Asset denom to search
 * @param bech32Address - Optional bech32 account address, defaults to connected account address
 *
 * @example
 * ```ts
 * import { useBalance } from "graz";
 *
 * // basic example
 * const { data, isFetching, refetch, ... } = useBalance("atom");
 *
 * // with custom bech32 address
 * useBalance("atom", "cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu");
 * ```
 */
export const useBalance = (denom: string, bech32Address?: string): UseQueryResult<Coin | undefined> => {
  const { data: account } = useAccount();
  const address = bech32Address || account?.bech32Address;
  const { data: balances, refetch: _refetch } = useBalances(address);

  const queryKey = ["USE_BALANCE", balances, denom, bech32Address] as const;
  const query = useQuery(
    queryKey,
    ({ queryKey: [, _balances] }) => {
      return _balances?.find((x) => x.denom === denom);
    },
    {
      enabled: Boolean(balances),
    },
  );

  return {
    ...query,
    refetch: async () => {
      await _refetch();
      return query.refetch();
    },
  };
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
    disconnect: mutation.mutate,
    disconnectAsync: mutation.mutateAsync,
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
 * const { offlineSigner, offlineSignerAmino, offlineSignerAuto } = useOfflineSigners();
 * ```
 */
export const useOfflineSigners = () => {
  const chain = useGrazSessionStore((x) => x.activeChainIds);
  const wallet = useGrazInternalStore((x) => x.walletType);
  const queryKey = useMemo(() => ["USE_OFFLINE_SIGNERS", chain, wallet] as const, [chain, wallet]);

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, _chain, _wallet] }) => {
      if (!_chain) throw new Error("No chain found");
      const isWalletAvailable = checkWallet(_wallet);
      if (!isWalletAvailable) {
        throw new Error(`${_wallet} is not available`);
      }
      const offlineSigners = await getOfflineSigners({
        chainId: _chain.chainId,
        walletType: _wallet,
      });
      return offlineSigners;
    },
    enabled: Boolean(chain) && Boolean(wallet),
    refetchOnWindowFocus: false,
  });
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
export const useBalanceStaked = (bech32Address?: string): UseQueryResult<Coin | null> => {
  const { data: account } = useAccount();
  const { data: client } = useStargateClient();
  const { activeChainIds: activeChain } = useGrazSessionStore.getState();
  const address = bech32Address || account?.bech32Address;

  const queryKey = useMemo(
    () => ["USE_BALANCE_STAKED", client, activeChain, address] as const,
    [activeChain, address, client],
  );

  const query = useQuery(
    queryKey,
    async ({ queryKey: [, _client, _activeChain, _address] }) => {
      if (!_activeChain || !_client) {
        throw new Error("No connected account detected");
      }
      if (!_address) {
        throw new Error("address is not defined");
      }
      const balance = await _client.getBalanceStaked(_address);
      return balance;
    },
    {
      enabled: Boolean(address) && Boolean(activeChain) && Boolean(client),
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  );

  return query;
};
