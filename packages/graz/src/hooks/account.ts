import { fromBech32, toBech32 } from "@cosmjs/encoding";
import type { Coin } from "@cosmjs/proto-signing";
import type { Key } from "@keplr-wallet/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import type { ConnectArgs, ConnectResult, OfflineSigners, ReconnectArgs } from "../actions/account";
import { connect, disconnect, getOfflineSigners, reconnect } from "../actions/account";
import { checkWallet } from "../actions/wallet";
import { useGrazInternalStore, useGrazSessionStore } from "../store";
import type { ChainIdToRecord, MutationEventArgs, QueryConfig, UseMultiChainQueryResult } from "../types/hooks";
import type { WalletType } from "../types/wallet";
import { isEmpty } from "../utils/isEmpty";
import type { ChainId, MultiChainHookArgs } from "../utils/multi-chain";
import { createMultiChainAsyncFunction, createMultiChainFunction, useChainsFromArgs } from "../utils/multi-chain";
import { useStargateClient } from "./clients";
import { useCheckWallet } from "./wallet";

export interface UseAccountArgs {
  onConnect?: (args: ConnectResult & { isReconnect: boolean }) => void;
  onDisconnect?: () => void;
}

/**
 * Return type for useAccount hook with type inference based on chainId parameter.
 */
export interface UseAccountResult<TChainIds extends readonly string[] | undefined> {
  data?: TChainIds extends readonly string[]
    ? ChainIdToRecord<TChainIds, Key | undefined>
    : Record<string, Key | undefined>;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  isReconnecting: boolean;
  isLoading: boolean;
  reconnect: (args?: ReconnectArgs) => Promise<ConnectResult | undefined>;
  status: string;
  walletType?: WalletType;
}

/**
 * graz query hook to retrieve account data with optional arguments to invoke
 * given function on connect/disconnect.
 *
 * Note: All hooks now return multi-chain results by default (Record<chainId, T>).
 *
 * @example
 * ```tsx
 * import { useAccount } from "graz";
 *
 * // Single chain with precise type inference
 * const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
 * // Type: { data?: { "cosmoshub-4": Key } }
 * const account = accounts?.["cosmoshub-4"];
 * account?.bech32Address; // ✅ TypeScript knows this exists!
 *
 * // Multiple chains with precise type inference
 * const { data: accounts } = useAccount({
 *   chainId: ["cosmoshub-4", "osmosis-1"]
 * });
 * // Type: { data?: { "cosmoshub-4": Key, "osmosis-1": Key } }
 * const cosmosAccount = accounts?.["cosmoshub-4"]; // ✅ Autocomplete!
 * const osmosisAccount = accounts?.["osmosis-1"]; // ✅ Autocomplete!
 *
 * // All connected chains (generic Record type)
 * const { data: accounts } = useAccount();
 * // Type: { data?: Record<string, Key> }
 *
 * // With event callbacks
 * useAccount({
 *   chainId: ["cosmoshub-4"],
 *   onConnect: ({ accounts, isReconnect }) => { ... },
 *   onDisconnect: () => { ... },
 * });
 * ```
 */

// Overload: When chainId is provided with specific type
export function useAccount<const TChainIds extends readonly string[]>(
  args: UseAccountArgs & { chainId: TChainIds },
): UseAccountResult<TChainIds>;

// Overload: When chainId is not provided (returns all connected chains)
export function useAccount(args?: UseAccountArgs): UseAccountResult<undefined>;

// Implementation
export function useAccount<const TChainIds extends readonly string[] | undefined>(
  args?: UseAccountArgs & { chainId?: TChainIds },
): UseAccountResult<TChainIds> {
  const walletType = useGrazInternalStore((x) => x.walletType);
  const activeChainIds = useGrazSessionStore((x) => x.activeChainIds);
  const activeChains = useChainsFromArgs({
    chainId: (args?.chainId ? args.chainId : activeChainIds || undefined) as string[] | undefined,
  });
  const _account = useGrazSessionStore((x) => x.accounts);
  const status = useGrazSessionStore((x) => x.status);

  useEffect(() => {
    return useGrazSessionStore.subscribe(
      (x) => x.status,
      (stat, prevStat) => {
        if (stat === "connected") {
          const { accounts, activeChainIds: _activeChainIds } = useGrazSessionStore.getState();
          const { chains } = useGrazInternalStore.getState();
          const { walletType: _walletType } = useGrazInternalStore.getState();
          if (!accounts || !_activeChainIds || !chains) {
            return args?.onDisconnect?.();
          }
          args?.onConnect?.({
            accounts,
            chains: _activeChainIds.map((id) => chains.find((x) => x.chainId === id)!),
            walletType: _walletType,
            isReconnect: prevStat === "reconnecting",
          });
        }
        if (stat === "disconnected") {
          args?.onDisconnect?.();
        }
      },
    );
  }, [args]);

  // Always return multi-chain format (Record<chainId, T>)
  const account = useMemo(() => {
    return _account
      ? createMultiChainFunction(activeChains, (chain) => {
          return _account[chain.chainId];
        })
      : undefined;
  }, [_account, activeChains]);

  return {
    data: account as UseAccountResult<TChainIds>["data"],
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    isDisconnected: status === "disconnected",
    isReconnecting: status === "reconnecting",
    isLoading: status === "connecting" || status === "reconnecting",
    walletType: status === "connected" ? walletType : undefined,
    reconnect,
    status,
  };
}

/**
 * graz query hook to retrieve list of balances from current account or given address.
 *
 * Note: Returns multi-chain results by default (Record<chainId, Coin[]>).
 *
 * @param bech32Address - Optional bech32 account address, defaults to connected account address
 *
 * @example
 * ```ts
 * import { useBalances } from "graz";
 *
 * // Single chain with precise type inference
 * const { data: balances } = useBalances({ chainId: ["cosmoshub-4"] });
 * // Type: { data?: { "cosmoshub-4": Coin[] } }
 * const cosmosBalances = balances?.["cosmoshub-4"];
 *
 * // Multiple chains with precise type inference
 * const { data: balances } = useBalances({
 *   chainId: ["cosmoshub-4", "osmosis-1"]
 * });
 * // Type: { data?: { "cosmoshub-4": Coin[], "osmosis-1": Coin[] } }
 * const cosmosBalances = balances?.["cosmoshub-4"]; // ✅ Autocomplete!
 *
 * // All connected chains
 * const { data: balances } = useBalances();
 * // Type: { data?: Record<string, Coin[]> }
 * ```
 */

// Overload: When chainId is provided with specific type
export function useBalances<const TChainIds extends readonly string[]>(
  args: { bech32Address?: string; chainId: TChainIds } & QueryConfig,
): UseMultiChainQueryResult<TChainIds, Coin[]>;

// Overload: When chainId is not provided
export function useBalances(
  args?: { bech32Address?: string } & QueryConfig,
): UseMultiChainQueryResult<undefined, Coin[]>;

// Implementation
export function useBalances<const TChainIds extends readonly string[] | undefined>(
  args?: { bech32Address?: string; chainId?: TChainIds } & QueryConfig,
): UseMultiChainQueryResult<TChainIds, Coin[]> {
  const chains = useChainsFromArgs({ chainId: args?.chainId as string[] | undefined });
  const { data: accounts } = useAccount();

  // Get address from provided arg or first available account
  const address = args?.bech32Address || (accounts && Object.values(accounts)[0]?.bech32Address);

  const { data: clients } = useStargateClient({
    chainId: chains.map((x) => x.chainId) as readonly string[],
    enabled: (args?.enabled === undefined ? true : args.enabled) && Boolean(address),
  });

  const queryKey = useMemo(
    () => ["USE_ALL_BALANCES", clients, chains, address, args?.chainId],
    [address, args?.chainId, chains, clients],
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!address) {
        throw new Error("address is not defined");
      }
      // Always use multi-chain function
      const res = await createMultiChainAsyncFunction(chains, async (_chain) => {
        const stargateClient = clients?.[_chain.chainId];
        if (!stargateClient) {
          throw new Error(`Client is not ready ${_chain.chainId}`);
        }
        if (!_chain.bech32Config?.bech32PrefixAccAddr) throw new Error(`Bech32Config is missing ${_chain.chainId}`);
        const balances = await stargateClient.getAllBalances(
          toBech32(_chain.bech32Config.bech32PrefixAccAddr, fromBech32(address).data),
        );
        return balances as Coin[];
      });
      return res;
    },
    enabled:
      Boolean(address) &&
      Boolean(chains) &&
      chains.length > 0 &&
      !isEmpty(clients) &&
      (args?.enabled === undefined ? true : args.enabled),
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}

/**
 * graz query hook to retrieve specific asset balance from current account or given address.
 *
 * Note: Returns multi-chain results by default (Record<chainId, Coin | undefined>).
 *
 * @param denom - Asset denom to search
 * @param bech32Address - Optional bech32 account address, defaults to connected account address
 *
 * @example
 * ```ts
 * import { useBalance } from "graz";
 *
 * // Single chain with precise type inference
 * const { data: balances } = useBalance({
 *   chainId: ["cosmoshub-4"],
 *   denom: "uatom"
 * });
 * // Type: { data?: { "cosmoshub-4": Coin | undefined } }
 * const balance = balances?.["cosmoshub-4"];
 *
 * // Multiple chains with precise type inference
 * const { data: balances } = useBalance({
 *   chainId: ["cosmoshub-4", "osmosis-1"],
 *   denom: "uatom"
 * });
 * // Type: { data?: { "cosmoshub-4": Coin | undefined, "osmosis-1": Coin | undefined } }
 * const cosmosBalance = balances?.["cosmoshub-4"]; // ✅ Autocomplete!
 *
 * // With custom bech32 address
 * useBalance({
 *   chainId: ["cosmoshub-4"],
 *   denom: "uatom",
 *   bech32Address: "cosmos1..."
 * });
 * ```
 */

// Overload: When chainId is provided with specific type
export function useBalance<const TChainIds extends readonly string[]>(
  args: {
    denom?: string;
    bech32Address?: string;
    chainId: TChainIds;
  } & QueryConfig,
): UseMultiChainQueryResult<TChainIds, Coin | undefined>;

// Overload: When chainId is required but not const
export function useBalance(
  args: {
    denom?: string;
    bech32Address?: string;
    chainId: ChainId;
  } & QueryConfig,
): UseMultiChainQueryResult<undefined, Coin | undefined>;

// Implementation
export function useBalance<const TChainIds extends readonly string[] | undefined>(
  args: {
    denom?: string;
    bech32Address?: string;
    chainId: ChainId;
  } & QueryConfig,
): UseMultiChainQueryResult<TChainIds, Coin | undefined> {
  const chains = useChainsFromArgs({ chainId: args.chainId });
  const { data: accounts } = useAccount({
    chainId: args.chainId,
  });

  // Get address from provided arg or first available account
  const address = args.bech32Address || (accounts && Object.values(accounts)[0]?.bech32Address);

  const { data: balances, refetch: _refetch } = useBalances({
    chainId: chains.map((x) => x.chainId) as readonly string[],
    bech32Address: address,
    enabled: Boolean(address) && (args.enabled === undefined ? true : args.enabled),
  });

  const queryKey = ["USE_BALANCE", args.denom, balances, chains, address, args.chainId];

  const query = useQuery({
    queryKey,
    queryFn: ({ queryKey: [, _denom, _balances] }) => {
      // _balances is now Record<chainId, Coin[]>
      // Transform to Record<chainId, Coin | undefined>
      if (!_balances) return undefined;

      return Object.fromEntries(
        Object.entries(_balances).map(([chainId, coins]) => [chainId, coins?.find((x: Coin) => x.denom === _denom)]),
      );
    },
    enabled:
      Boolean(args.denom) &&
      Boolean(balances) &&
      !isEmpty(balances) &&
      (args.enabled === undefined ? true : args.enabled),
  });

  return {
    ...query,
    refetch: async (options) => {
      await _refetch();
      return query.refetch(options);
    },
  } as UseMultiChainQueryResult<TChainIds, Coin | undefined>;
}

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
  const mutationKey = ["USE_CONNECT", onError, onLoading, onSuccess];
  const mutation = useMutation({
    mutationKey,
    mutationFn: connect,
    onError: (err, args) => onError?.(err, args),
    onMutate: onLoading,
    onSuccess: (connectResult) => Promise.resolve(onSuccess?.(connectResult)),
  });
  const { data: isSupported } = useCheckWallet();
  return {
    connect: (args?: ConnectArgs) => mutation.mutate(args),
    connectAsync: (args?: ConnectArgs) => mutation.mutateAsync(args),
    error: mutation.error,
    isLoading: mutation.isPending,
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
  const mutationKey = ["USE_DISCONNECT", onError, onLoading, onSuccess];
  const mutation = useMutation({
    mutationKey,
    mutationFn: disconnect,
    onError: (err) => Promise.resolve(onError?.(err, undefined)),
    onMutate: onLoading,
    onSuccess: () => Promise.resolve(onSuccess?.(undefined)),
  });

  return {
    disconnect: (args?: { chainId?: ChainId }) => mutation.mutate(args),
    disconnectAsync: (args?: { chainId?: ChainId }) => mutation.mutateAsync(args),
    error: mutation.error,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    status: mutation.status,
  };
};

/**
 * graz hook to retrieve offline signer objects (default, amino enabled, and auto).
 *
 * Note: Returns multi-chain results by default (Record<chainId, OfflineSigners>).
 * Signer objects are initialized after connecting an account.
 *
 * @example
 * ```ts
 * import { useOfflineSigners } from "graz";
 *
 * // Single chain with precise type inference
 * const { data: signers } = useOfflineSigners({ chainId: ["cosmoshub-4"] });
 * // Type: { data?: { "cosmoshub-4": OfflineSigners } }
 * const { offlineSigner, offlineSignerAmino, offlineSignerAuto } = signers?.["cosmoshub-4"] || {};
 *
 * // Multiple chains with precise type inference
 * const { data: signers } = useOfflineSigners({
 *   chainId: ["cosmoshub-4", "osmosis-1"]
 * });
 * // Type: { data?: { "cosmoshub-4": OfflineSigners, "osmosis-1": OfflineSigners } }
 * const cosmosSigners = signers?.["cosmoshub-4"]; // ✅ Autocomplete!
 *
 * // All connected chains
 * const { data: signers } = useOfflineSigners();
 * // Type: { data?: Record<string, OfflineSigners> }
 * ```
 */

// Overload: When chainId is provided with specific type
export function useOfflineSigners<const TChainIds extends readonly string[]>(args: {
  chainId: TChainIds;
}): UseMultiChainQueryResult<TChainIds, OfflineSigners>;

// Overload: When chainId is not provided
export function useOfflineSigners(args?: {}): UseMultiChainQueryResult<undefined, OfflineSigners>;

// Implementation
export function useOfflineSigners<const TChainIds extends readonly string[] | undefined>(args?: {
  chainId?: TChainIds;
}): UseMultiChainQueryResult<TChainIds, OfflineSigners> {
  const chains = useChainsFromArgs({ chainId: args?.chainId as string[] | undefined });
  const wallet = useGrazInternalStore((x) => x.walletType);

  const isConnected =
    useGrazSessionStore.getState().status === "connected" &&
    useGrazSessionStore.getState().accounts &&
    useGrazInternalStore.getState()._reconnectConnector === wallet;

  const queryKey = useMemo(() => ["USE_OFFLINE_SIGNERS", chains, wallet], [chains, wallet]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!chains || chains.length < 1) throw new Error("No chain found");
      if (!wallet) throw new Error("Wallet is not defined");
      const isWalletAvailable = checkWallet(wallet);
      if (!isWalletAvailable) {
        throw new Error(`${wallet} is not available`);
      }
      // Always use multi-chain function
      const res = await createMultiChainAsyncFunction(chains, async (_chain) => {
        const offlineSigners = await getOfflineSigners({
          chainId: _chain.chainId,
          walletType: wallet,
        });
        return offlineSigners;
      });
      return res;
    },
    enabled: Boolean(chains) && chains.length > 0 && Boolean(wallet) && Boolean(isConnected),
    refetchOnWindowFocus: false,
  });
}

/**
 * graz query hook to retrieve staked balances from current account or given address.
 *
 * Note: Returns multi-chain results by default (Record<chainId, Coin>).
 *
 * @param bech32Address - Optional bech32 account address, defaults to connected account address
 *
 * @example
 * ```ts
 * import { useBalanceStaked } from "graz";
 *
 * // Single chain with precise type inference
 * const { data: stakedBalances } = useBalanceStaked({ chainId: ["cosmoshub-4"] });
 * // Type: { data?: { "cosmoshub-4": Coin } }
 * const stakedBalance = stakedBalances?.["cosmoshub-4"];
 *
 * // Multiple chains with precise type inference
 * const { data: stakedBalances } = useBalanceStaked({
 *   chainId: ["cosmoshub-4", "osmosis-1"]
 * });
 * // Type: { data?: { "cosmoshub-4": Coin, "osmosis-1": Coin } }
 * const cosmosStaked = stakedBalances?.["cosmoshub-4"]; // ✅ Autocomplete!
 *
 * // With custom bech32 address
 * useBalanceStaked({
 *   chainId: ["cosmoshub-4"],
 *   bech32Address: "cosmos1..."
 * });
 *
 * // All connected chains
 * const { data: stakedBalances } = useBalanceStaked();
 * // Type: { data?: Record<string, Coin> }
 * ```
 */

// Overload: When chainId is provided with specific type
export function useBalanceStaked<const TChainIds extends readonly string[]>(
  args: { bech32Address?: string; chainId: TChainIds } & QueryConfig,
): UseMultiChainQueryResult<TChainIds, Coin>;

// Overload: When chainId is not provided
export function useBalanceStaked(
  args?: { bech32Address?: string } & QueryConfig,
): UseMultiChainQueryResult<undefined, Coin>;

// Implementation
export function useBalanceStaked<const TChainIds extends readonly string[] | undefined>(
  args?: { bech32Address?: string; chainId?: TChainIds } & QueryConfig,
): UseMultiChainQueryResult<TChainIds, Coin> {
  const chains = useChainsFromArgs({ chainId: args?.chainId as string[] | undefined });
  const { data: accounts } = useAccount();
  const { data: clients } = useStargateClient({
    chainId: chains.map((x) => x.chainId) as readonly string[],
  });

  // Get address from provided arg or first available account
  const address = args?.bech32Address || (accounts && Object.values(accounts)[0]?.bech32Address);

  const queryKey = useMemo(() => ["USE_BALANCE_STAKED", clients, chains, address], [chains, address, clients]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!address) {
        throw new Error("address is not defined");
      }
      // Always use multi-chain function
      const res = await createMultiChainAsyncFunction(chains, async (_chain) => {
        if (!clients) throw new Error("Client is not ready");
        if (!_chain.bech32Config?.bech32PrefixAccAddr) throw new Error(`Bech32Config is missing ${_chain.chainId}`);
        const balance = await clients[_chain.chainId]?.getBalanceStaked(
          toBech32(_chain.bech32Config.bech32PrefixAccAddr, fromBech32(address).data),
        );
        return balance;
      });
      return res;
    },
    enabled:
      Boolean(address) &&
      Boolean(chains) &&
      chains.length > 0 &&
      Boolean(clients) &&
      (args?.enabled === undefined ? true : args.enabled),
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}
