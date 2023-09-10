import { fromBech32, toBech32 } from "@cosmjs/encoding";
import type { Coin } from "@cosmjs/proto-signing";
import type { Key } from "@keplr-wallet/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import type { ConnectArgs, ConnectResult, OfflineSigners, ReconnectArgs } from "../actions/account";
import { connect, disconnect, getOfflineSigners, reconnect } from "../actions/account";
import { checkWallet } from "../actions/wallet";
import { useGrazInternalStore, useGrazSessionStore } from "../store";
import type { MutationEventArgs, UseMultiChainQueryResult } from "../types/hooks";
import type { WalletType } from "../types/wallet";
import type { MultiChainHookArgs } from "../utils/multi-chain";
import { createMultiChainAsyncFunction, createMultiChainFunction, useChainsFromArgs } from "../utils/multi-chain";
import { useStargateClient } from "./clients";
import { useCheckWallet } from "./wallet";

export interface UseAccountArgs {
  onConnect?: (args: ConnectResult & { isReconnect: boolean }) => void;
  onDisconnect?: () => void;
}
export interface UseAccountResult<TMulti extends MultiChainHookArgs> {
  data?: TMulti["multiChain"] extends true ? Record<string, Key | undefined> : Key | undefined;
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
 * @example
 * ```tsx
 * import { useAccount } from "graz";
 *
 * // basic example
 * const { data:account, isConnecting, isConnected, ... } = useAccount();
 *
 * // multichain example
 * const { data: accounts, isConnecting, isConnected, ... } = useAccount({chainId: ["cosmoshub-4", "sommelier-3"] multiChain: true});
 *
 * // with event arguments
 * useAccount({
 *   onConnect: ({ account, isReconnect }) => { ... },
 *   onDisconnect: () => { ... },
 * });
 * ```
 */
export const useAccount = <TMulti extends MultiChainHookArgs>(
  args?: UseAccountArgs & TMulti,
): UseAccountResult<TMulti> => {
  const walletType = useGrazInternalStore((x) => x.walletType);
  const activeChainIds = useGrazSessionStore((x) => x.activeChainIds);
  const activeChains = useChainsFromArgs({
    chainId: args?.chainId ? args.chainId : activeChainIds || undefined,
    multiChain: args?.multiChain,
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

  const account = useMemo(() => {
    return _account
      ? createMultiChainFunction(Boolean(args?.multiChain), activeChains, (chain) => {
          return _account[chain.chainId];
        })
      : undefined;
  }, [_account, activeChains, args?.multiChain]);

  return {
    data: account as UseAccountResult<TMulti>["data"],
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    isDisconnected: status === "disconnected",
    isReconnecting: status === "reconnecting",
    isLoading: status === "connecting" || status === "reconnecting",
    walletType: status === "connected" ? walletType : undefined,
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
 * // multichain example
 * const { data:balances, isFetching, refetch, ... } = useBalances({chainId: ["cosmoshub-4", "sommelier-3"] multiChain: true});
 * const cosmoshubBalances = balances["cosmoshub-4"]
 *
 * // with custom bech32 address
 * useBalances("cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu");
 * ```
 */
export const useBalances = <TMulti extends MultiChainHookArgs>(
  args?: { bech32Address?: string } & TMulti,
): UseMultiChainQueryResult<TMulti, Coin[]> => {
  const chains = useChainsFromArgs({ chainId: args?.chainId, multiChain: args?.multiChain });
  const { data: account } = useAccount();

  const { data: clients } = useStargateClient({
    chainId: chains.map((x) => x.chainId),
    multiChain: true,
  });

  const address = args?.bech32Address || account?.bech32Address;

  const queryKey = useMemo(() => ["USE_ALL_BALANCES", clients, chains, address] as const, [address, chains, clients]);

  return useQuery(
    queryKey,
    async ({ queryKey: [, _clients, _chains, _address] }) => {
      if (!_address) {
        throw new Error("address is not defined");
      }
      const res = await createMultiChainAsyncFunction(Boolean(args?.multiChain), _chains, async (_chain) => {
        const stargateClient = _clients?.[_chain.chainId];
        if (!stargateClient) {
          throw new Error("Client is not ready");
        }
        const balances = await stargateClient.getAllBalances(
          toBech32(_chain.bech32Config.bech32PrefixAccAddr, fromBech32(_address).data),
        );
        return balances as Coin[];
      });
      return res;
    },
    {
      enabled: Boolean(address) && Boolean(chains) && chains.length > 0 && Boolean(clients),
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  );
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
 * const { data, isFetching, refetch, ... } = useBalance({denom: "atom"});
 *
 * // with custom bech32 address
 * useBalance("atom", "cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu");
 * ```
 */
export const useBalance = <TMulti extends MultiChainHookArgs>(
  args: {
    denom: string;
    bech32Address?: string;
  } & TMulti,
): UseMultiChainQueryResult<TMulti, Coin | undefined> => {
  const chains = useChainsFromArgs({ chainId: args.chainId, multiChain: args.multiChain });
  const { data: account } = useAccount();

  const { data: balances, refetch: _refetch } = useBalances({
    chainId: chains.map((x) => x.chainId),
    multiChain: true,
  });

  const address = args.bech32Address || account?.bech32Address;

  const queryKey = ["USE_BALANCE", balances, args.denom, chains, address] as const;
  const query = useQuery(
    queryKey,
    ({ queryKey: [, _balances, _denom] }) => {
      const res = createMultiChainFunction(Boolean(args.multiChain), chains, (chain) => {
        return _balances?.[chain.chainId]?.find((x) => x.denom === _denom);
      });
      return res;
    },
    {
      enabled: Boolean(balances),
    },
  );

  return {
    ...query,
    refetch: async (options) => {
      await _refetch();
      return query.refetch(options);
    },
  } as UseMultiChainQueryResult<TMulti, Coin | undefined>;
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
    disconnect: (args?: { chainId?: string }) => mutation.mutate(args),
    disconnectAsync: (args?: { chainId?: string }) => mutation.mutateAsync(args),
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
 *
 * // basic example
 * import { useOfflineSigners } from "graz";
 * const { offlineSigner, offlineSignerAmino, offlineSignerAuto } = useOfflineSigners();
 *
 * // multichain example
 * const offlineSigners = useOfflineSigners({chainId: ["cosmoshub-4", "sommelier-3"] multiChain: true});
 * const cosmoshubOfflineSigners = offlineSigners["cosmoshub-4"]
 *
 * ```
 */
export const useOfflineSigners = <TMulti extends MultiChainHookArgs>(
  args?: TMulti,
): UseMultiChainQueryResult<TMulti, OfflineSigners> => {
  const chains = useChainsFromArgs({ chainId: args?.chainId, multiChain: args?.multiChain });
  const wallet = useGrazInternalStore((x) => x.walletType);
  const queryKey = useMemo(() => ["USE_OFFLINE_SIGNERS", chains, wallet] as const, [chains, wallet]);

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, _chains, _wallet] }) => {
      if (_chains.length < 1) throw new Error("No chain found");
      const isWalletAvailable = checkWallet(_wallet);
      if (!isWalletAvailable) {
        throw new Error(`${_wallet} is not available`);
      }
      const res = await createMultiChainAsyncFunction(Boolean(args?.multiChain), _chains, async (_chain) => {
        const offlineSigners = await getOfflineSigners({
          chainId: _chain.chainId,
          walletType: _wallet,
        });
        return offlineSigners;
      });
      return res;
    },
    enabled: Boolean(chains) && chains.length > 0 && Boolean(wallet),
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
 * // multichain example
 * const { data:balanceStaked, isFetching, refetch, ... } = useBalanceStaked({chainId: ["cosmoshub-4", "sommelier-3"] multiChain: true});
 * const cosmoshubBalanceStaked = balances["cosmoshub-4"]
 *
 * // with custom bech32 address
 * useBalanceStaked({ bech32Address: "cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu"});
 * ```
 */
export const useBalanceStaked = <TMulti extends MultiChainHookArgs>(
  args?: { bech32Address?: string } & TMulti,
): UseMultiChainQueryResult<TMulti, Coin> => {
  const chains = useChainsFromArgs({ chainId: args?.chainId, multiChain: args?.multiChain });
  const { data: account } = useAccount();
  const { data: client } = useStargateClient({
    chainId: chains.map((x) => x.chainId),
    multiChain: true,
  });
  const address = args?.bech32Address || account?.bech32Address;

  const queryKey = useMemo(() => ["USE_BALANCE_STAKED", client, chains, address] as const, [chains, address, client]);

  return useQuery(
    queryKey,
    async ({ queryKey: [, _client, _chains, _address] }) => {
      if (!_address) {
        throw new Error("address is not defined");
      }
      const res = await createMultiChainAsyncFunction(Boolean(args?.multiChain), _chains, async (_chain) => {
        if (!_client) throw new Error("Client is not ready");
        const balance = await _client[_chain.chainId]?.getBalanceStaked(
          toBech32(_chain.bech32Config.bech32PrefixAccAddr, fromBech32(_address).data),
        );
        return balance;
      });
      return res;
    },
    {
      enabled: Boolean(address) && Boolean(chains) && chains.length > 0 && Boolean(client),
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  );
};
