import type { Coin } from "@cosmjs/proto-signing";
import type { StargateClient } from "@cosmjs/stargate";
import type { Key } from "@keplr-wallet/types";
import { useMutation, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import type { ConnectArgs, ConnectResult, OfflineSigners, ReconnectArgs } from "../actions/account";
import { connect, disconnect, getOfflineSigners, reconnect } from "../actions/account";
import { checkWallet } from "../actions/wallet";
import { useGrazInternalStore, useGrazSessionStore } from "../store";
import type { ChainIdToRecord, MutationEventArgs, QueryConfig, UseMultiChainQueryResult } from "../types/hooks";
import type { WalletType } from "../types/wallet";
import { LogCategory } from "../types/logger";
import { getLogger } from "../utils/logger";
import type { ChainId } from "../utils/multi-chain";
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

type UseBalancesArgs = {
  bech32Address: string | undefined;
  chainId: string | undefined;
} & QueryConfig;

type UseBalanceArgs = UseBalancesArgs & {
  denom: string | undefined;
};

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
 * graz query hook to retrieve list of balances for a specific chain and address.
 *
 * @param chainId - Chain ID to query balances from
 * @param bech32Address - Required bech32 account address
 *
 * @example
 * ```ts
 * import { useBalances } from "graz";
 *
 * const { data: balances } = useBalances({
 *   chainId: "cosmoshub-4",
 *   bech32Address: "cosmos1..."
 * });
 * // Type: { data?: Coin[] }
 * ```
 */
export const useBalances = (
  args: UseBalancesArgs,
): UseQueryResult<Coin[], unknown> => {
  const chains = useGrazInternalStore((x) => x.chains);
  const chain = args.chainId ? chains?.find((x) => x.chainId === args.chainId) : undefined;
  const queryEnabled =
    Boolean(args.chainId) &&
    Boolean(args.bech32Address) &&
    (args.enabled === undefined ? true : args.enabled);

  const { data: clients } = useStargateClient({
    chainId: args.chainId ? [args.chainId] : [],
    enabled: queryEnabled,
  });

  const client = args.chainId ? (clients as Record<string, StargateClient> | undefined)?.[args.chainId] : undefined;

  const queryKey = useMemo(
    () => ["USE_ALL_BALANCES", client, args.chainId, args.bech32Address],
    [args.bech32Address, args.chainId, client],
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!args.chainId || !args.bech32Address) {
        throw new Error("chainId or bech32Address undefined");
      }
      if (!client) {
        throw new Error(`Client is not ready for ${args.chainId}`);
      }
      if (!chain?.bech32Config?.bech32PrefixAccAddr) {
        throw new Error(`Bech32Config is missing for ${args.chainId}`);
      }
      const balances = await client.getAllBalances(args.bech32Address);
      return balances as Coin[];
    },
    enabled: Boolean(client) && Boolean(chain) && queryEnabled,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
};

/**
 * graz query hook to retrieve specific asset balance for a specific chain and address.
 *
 * @param chainId - Chain ID to query balance from
 * @param bech32Address - Required bech32 account address
 * @param denom - Asset denom to search
 *
 * @example
 * ```ts
 * import { useBalance } from "graz";
 *
 * const { data: balance } = useBalance({
 *   chainId: "cosmoshub-4",
 *   bech32Address: "cosmos1...",
 *   denom: "uatom"
 * });
 * // Type: { data?: Coin | undefined }
 * ```
 */
export const useBalance = (
  args: UseBalanceArgs,
): UseQueryResult<Coin | undefined, unknown> => {
  const chains = useGrazInternalStore((x) => x.chains);
  const chain = args.chainId ? chains?.find((x) => x.chainId === args.chainId) : undefined;
  const queryEnabled =
    Boolean(args.chainId) &&
    Boolean(args.bech32Address) &&
    Boolean(args.denom) &&
    (args.enabled === undefined ? true : args.enabled);

  const { data: clients } = useStargateClient({
    chainId: args.chainId ? [args.chainId] : [],
    enabled: queryEnabled,
  });

  const client = args.chainId ? (clients as Record<string, StargateClient> | undefined)?.[args.chainId] : undefined;

  const queryKey = useMemo(
    () => ["USE_BALANCE", client, args.chainId, args.bech32Address, args.denom],
    [args.bech32Address, args.chainId, args.denom, client],
  );

  return useQuery<Coin | null, unknown, Coin | undefined>({
    queryKey,
    queryFn: async () => {
      if (!args.chainId || !args.bech32Address || !args.denom) {
        throw new Error("chainId, bech32Address, or denom undefined");
      }
      if (!client) {
        throw new Error(`Client is not ready for ${args.chainId}`);
      }
      if (!chain?.bech32Config?.bech32PrefixAccAddr) {
        throw new Error(`Bech32Config is missing for ${args.chainId}`);
      }
      const balance = await client.getBalance(args.bech32Address, args.denom);
      return balance.amount === "0" ? null : balance;
    },
    select: (balance) => balance ?? undefined,
    enabled: Boolean(client) && Boolean(chain) && queryEnabled,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
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
  const logger = getLogger();
  const mutationKey = ["USE_CONNECT"];
  const mutation = useMutation({
    mutationKey,
    mutationFn: connect,
    onError: (err, args) => {
      logger.error(LogCategory.WALLET, "useConnect mutation failed", {
        error: err instanceof Error ? err.message : String(err),
        chainId: args?.chainId,
      });
      onError?.(err, args);
    },
    onMutate: onLoading,
    onSuccess: (connectResult) => {
      logger.info(LogCategory.WALLET, "useConnect mutation successful", {
        hook: "useConnect",
        walletType: connectResult.walletType,
        chainCount: connectResult.chains.length,
      });
      onSuccess?.(connectResult);
    },
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
  const logger = getLogger();
  const mutationKey = ["USE_DISCONNECT"];
  const mutation = useMutation({
    mutationKey,
    mutationFn: disconnect,
    onError: (err) => {
      logger.error(LogCategory.WALLET, "useDisconnect mutation failed", {
        hook: "useDisconnect",
        error: err instanceof Error ? err.message : String(err),
      });
      onError?.(err, undefined);
    },
    onMutate: onLoading,
    onSuccess: () => {
      logger.info(LogCategory.WALLET, "useDisconnect mutation successful", { hook: "useDisconnect" });
      onSuccess?.(undefined);
    },
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
export function useOfflineSigners(args?: Record<string, never>): UseMultiChainQueryResult<undefined, OfflineSigners>;

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
      const res = await createMultiChainAsyncFunction(
        chains,
        async (_chain) => {
          const offlineSigners = await getOfflineSigners({
            chainId: _chain.chainId,
            walletType: wallet,
          });
          return offlineSigners;
        },
        "useOfflineSigners",
      );
      return res;
    },
    enabled: Boolean(chains) && chains.length > 0 && Boolean(wallet) && Boolean(isConnected),
    refetchOnWindowFocus: false,
  }) as UseMultiChainQueryResult<TChainIds, OfflineSigners>;
}

/**
 * graz query hook to retrieve staked balance for a specific chain and address.
 *
 * @param chainId - Chain ID to query staked balance from
 * @param bech32Address - Required bech32 account address
 *
 * @example
 * ```ts
 * import { useBalanceStaked, useAccount } from "graz";
 *
 * const { data: accounts } = useAccount();
 * const account = accounts?.["cosmoshub-4"];
 *
 * const { data: stakedBalance } = useBalanceStaked({
 *   chainId: "cosmoshub-4",
 *   bech32Address: account?.bech32Address || "",
 *   enabled: Boolean(account?.bech32Address),
 * });
 * // Type: { data?: Coin }
 * ```
 */
export const useBalanceStaked = (
  args: UseBalancesArgs,
): UseQueryResult<Coin | null, unknown> => {
  const chains = useGrazInternalStore((x) => x.chains);
  const chain = args.chainId ? chains?.find((x) => x.chainId === args.chainId) : undefined;
  const queryEnabled =
    Boolean(args.chainId) &&
    Boolean(args.bech32Address) &&
    (args.enabled === undefined ? true : args.enabled);

  const { data: clients } = useStargateClient({
    chainId: args.chainId ? [args.chainId] : [],
    enabled: queryEnabled,
  });

  const client = args.chainId ? (clients as Record<string, StargateClient> | undefined)?.[args.chainId] : undefined;

  const queryKey = useMemo(
    () => ["USE_BALANCE_STAKED", client, args.chainId, args.bech32Address],
    [args.bech32Address, args.chainId, client],
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!args.chainId || !args.bech32Address) {
        throw new Error("chainId or bech32Address undefined");
      }
      if (!client) {
        throw new Error(`Client is not ready for ${args.chainId}`);
      }
      if (!chain?.bech32Config?.bech32PrefixAccAddr) {
        throw new Error(`Bech32Config is missing for ${args.chainId}`);
      }
      const balance = await client.getBalanceStaked(args.bech32Address);
      return balance;
    },
    enabled: Boolean(client) && Boolean(chain) && queryEnabled,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
};
