import type { OfflineAminoSigner } from "@cosmjs/amino";
import type { OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { ChainInfo } from "@keplr-wallet/types";

import { LOG_FUNCTIONS, RECONNECT_SESSION_KEY } from "../constant";
import { grazSessionDefaultValues, useGrazInternalStore, useGrazSessionStore } from "../store";
import type { Maybe } from "../types/core";
import type { DisconnectReason } from "../types/events";
import type { Key } from "../types/wallet";
import { WalletType } from "../types/wallet";
import { LogCategory } from "../types/logger";
import { getLogger } from "../utils/logger";
import { checkWallet, getWallet, isPara, isWalletConnect } from "./wallet";
import { resolveSession } from "./wallet/wallet-connect/approved-session";
import { emitWalletEvent } from "./events";

/**
 * Chain ID type for actions - supports both string and string[] for backward compatibility.
 * Actions normalize this internally to string[].
 */
export type ActionChainId = string | string[];

export type ConnectArgs = Maybe<{
  chainId: ActionChainId;
  walletType?: WalletType;
  autoReconnect?: boolean;
}>;

export interface ConnectResult {
  accounts: Record<string, Key>;
  walletType: WalletType;
  chains: ChainInfo[];
}

const haveSameChainIds = (first: readonly string[], second: readonly string[]) => {
  return first.length === second.length && first.every((chainId) => second.includes(chainId));
};

const getWalletConnectResolvedChainIds = (
  walletType: WalletType,
  requestedChainIds: string[],
  chains: ChainInfo[],
) => {
  const signClient = useGrazSessionStore.getState().wcSignClients.get(walletType);
  if (!signClient) throw new Error("walletConnect.signClient is not defined");

  const resolved = resolveSession(signClient.session.getAll().at(-1));
  if (!resolved) throw new Error("No approved WalletConnect accounts");

  const configuredChainIds = chains.map((chain) => chain.chainId);
  const approvedChainIds = new Set(resolved.scope.chainIds);
  const requested = requestedChainIds.filter(
    (chainId) => approvedChainIds.has(chainId) && configuredChainIds.includes(chainId),
  );
  const additional = configuredChainIds.filter(
    (chainId) => approvedChainIds.has(chainId) && !requested.includes(chainId),
  );
  const resolvedChainIds = [...requested, ...additional];
  if (resolvedChainIds.length === 0) throw new Error("No approved WalletConnect accounts for configured chains");

  return resolvedChainIds;
};

const reconcileChainIds = (current: string[] | null, requested: string[], resolved: string[]) =>
  [...(current || []).filter((chainId) => !requested.includes(chainId)), ...resolved].filter(
    (chainId, index, chainIds) => chainIds.indexOf(chainId) === index,
  );

const getConnectedChains = (chainIds: string[], chains: ChainInfo[]) =>
  chainIds.map((chainId) => {
    const chain = chains.find((candidate) => candidate.chainId === chainId);
    if (!chain) throw new Error(`Chain ${chainId} is not provided in GrazProvider`);
    return chain;
  });

const emitConnectedSessionChanges = ({
  previousAccounts,
  previousActiveChainIds,
  walletType,
}: {
  previousAccounts: Record<string, Key> | null;
  previousActiveChainIds: string[];
  walletType: WalletType;
}) => {
  const currentSession = useGrazSessionStore.getState();
  const accounts = currentSession.accounts;
  const activeChainIds = [...(currentSession.activeChainIds || [])];

  if (!haveSameChainIds(previousActiveChainIds, activeChainIds)) {
    emitWalletEvent({
      payload: {
        activeChainIds,
        previousActiveChainIds,
        walletType,
      },
      type: "activeChainsChange",
    });
  }

  if (!previousAccounts || !accounts) return;
  const changedChainIds = previousActiveChainIds.filter((chainId) => {
    const previousAccount = previousAccounts[chainId];
    const account = accounts[chainId];
    return account !== undefined && previousAccount?.bech32Address !== account.bech32Address;
  });
  if (changedChainIds.length === 0) return;

  emitWalletEvent({
    payload: {
      accounts: { ...accounts },
      changedChainIds,
      previousAccounts,
      walletType,
    },
    type: "accountChange",
  });
};

export const connect = async (args?: ConnectArgs): Promise<ConnectResult> => {
  const logger = getLogger();
  logger.time("connect");
  logger.group("Connect Wallet");
  const previousSession = useGrazSessionStore.getState();
  const previousAccounts = previousSession.accounts ? { ...previousSession.accounts } : null;
  const previousActiveChainIds = [...(previousSession.activeChainIds || [])];
  const wasConnected = previousSession.status === "connected";

  try {
    const { recentChainIds: recentChains, chains, walletType } = useGrazInternalStore.getState();

    const currentWalletType = args?.walletType || walletType;

    logger.debug(LogCategory.WALLET, "Starting connection", {
      function: "connect",
      walletType: currentWalletType,
      chainId: args?.chainId,
      timestamp: Date.now(),
    });

    if (isWalletConnect(currentWalletType)) {
      const walletConnectInstance = getWallet(WalletType.WALLETCONNECT);
      const { disable: walletConnectDisable } = walletConnectInstance;

      if (walletConnectDisable) {
        void walletConnectDisable();
      }
    }

    const isWalletAvailable = checkWallet(currentWalletType);
    if (!isWalletAvailable) {
      logger.warn(LogCategory.WALLET, "Wallet not available", { function: LOG_FUNCTIONS.CONNECT, walletType: currentWalletType });
      throw new Error(`${currentWalletType} is not available`);
    }

    logger.debug(LogCategory.WALLET, "Wallet adapter retrieved", { function: LOG_FUNCTIONS.CONNECT, walletType: currentWalletType });
    const wallet = getWallet(currentWalletType);
    const chainIds = typeof args?.chainId === "string" ? [args.chainId] : args?.chainId || recentChains;
    if (!chainIds) {
      throw new Error("No last known connected chain, connect action requires chain ids");
    }
    const providerChainIds = chains?.map((x) => x.chainId);

    chainIds.forEach((chainId) => {
      if (!providerChainIds?.includes(chainId)) {
        throw new Error(`Chain ${chainId} is not provided in GrazProvider`);
      }
    });

    useGrazSessionStore.setState((x) => {
      const isReconnecting =
        useGrazInternalStore.getState()._reconnect ||
        Boolean(useGrazInternalStore.getState()._reconnectConnector) ||
        Boolean(chainIds);

      const isSwitchingChain = x.activeChainIds && chainIds.filter((y) => !x.activeChainIds?.includes(y)).length > 0;
      if (isSwitchingChain) return { status: "connecting" };
      if (isReconnecting) return { status: "reconnecting" };
      return { status: "connecting" };
    });

    logger.debug(LogCategory.WALLET, "Initializing wallet", { function: LOG_FUNCTIONS.CONNECT });
    await wallet.init?.();

    logger.debug(LogCategory.WALLET, "Enabling chains", { function: LOG_FUNCTIONS.CONNECT, chainIds, chainCount: chainIds.length });
    await wallet.enable(chainIds);
    const resolvedChainIds = isWalletConnect(currentWalletType)
      ? getWalletConnectResolvedChainIds(currentWalletType, chainIds, chains || [])
      : chainIds;

    logger.debug(LogCategory.WALLET, "Fetching accounts", { function: LOG_FUNCTIONS.CONNECT });

    if (!isWalletConnect(currentWalletType)) {
      const resultAccounts: Record<string, Key> = Object.fromEntries(
        await Promise.all(
          chainIds.map(async (chainId): Promise<[string, Key]> => [chainId, await wallet.getKey(chainId)]),
        ),
      );
      useGrazSessionStore.setState((prev) => ({
        accounts: { ...(prev.accounts || {}), ...resultAccounts },
      }));
    }

    useGrazInternalStore.setState((prev) => ({
      recentChainIds: isWalletConnect(currentWalletType)
        ? reconcileChainIds(prev.recentChainIds, chainIds, resolvedChainIds)
        : [...(prev.recentChainIds || []), ...chainIds].filter((thing, i, arr) => arr.indexOf(thing) === i),
    }));
    useGrazSessionStore.setState((prev) => ({
      activeChainIds: isWalletConnect(currentWalletType)
        ? reconcileChainIds(prev.activeChainIds, chainIds, resolvedChainIds)
        : [...(prev.activeChainIds || []), ...chainIds].filter((thing, i, arr) => arr.indexOf(thing) === i),
    }));

    useGrazInternalStore.setState({
      walletType: currentWalletType,
      _reconnect: Boolean(args?.autoReconnect),
      _reconnectConnector: currentWalletType,
    });
    useGrazSessionStore.setState({
      status: "connected",
    });
    typeof window !== "undefined" && window.sessionStorage.setItem(RECONNECT_SESSION_KEY, "Active");

    const connectedChains = getConnectedChains(resolvedChainIds, chains || []);
    const resultAccounts = useGrazSessionStore.getState().accounts;
    if (!resultAccounts) throw new Error("No accounts");

    if (wasConnected) {
      emitConnectedSessionChanges({
        previousAccounts,
        previousActiveChainIds,
        walletType: currentWalletType,
      });
    }

    logger.info(LogCategory.WALLET, "Connection successful", {
      function: LOG_FUNCTIONS.CONNECT,
      walletType: currentWalletType,
      chainCount: resolvedChainIds.length,
      chainIds: resolvedChainIds,
      addresses: Object.values(resultAccounts).map((account) => account.bech32Address),
    });

    logger.debug(LogCategory.STORE, "Session store updated", {
      function: LOG_FUNCTIONS.CONNECT,
      accountCount: Object.keys(resultAccounts).length,
    });

    logger.timeEnd("connect");
    logger.groupEnd();

    return { accounts: resultAccounts, walletType: currentWalletType, chains: connectedChains };
  } catch (error) {
    logger.error(LogCategory.WALLET, "Connection failed", {
      function: LOG_FUNCTIONS.CONNECT,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      walletType: args?.walletType,
      chainId: args?.chainId,
    });

    if (useGrazSessionStore.getState().accounts === null) {
      useGrazSessionStore.setState({ status: "disconnected" });
    }
    if (useGrazSessionStore.getState().accounts && useGrazSessionStore.getState().activeChainIds) {
      useGrazSessionStore.setState({ status: "connected" });
    }

    logger.timeEnd("connect");
    logger.groupEnd();

    throw error;
  }
};

const disconnectSession = (
  args: { chainId?: ActionChainId } | undefined,
  reason: DisconnectReason,
  disableWallet: boolean,
) => {
  const logger = getLogger();
  const chainId = typeof args?.chainId === "string" ? [args.chainId] : args?.chainId;
  const previousSession = useGrazSessionStore.getState();
  const previousActiveChainIds = [...(previousSession.activeChainIds || [])];
  const previousAccounts = previousSession.accounts ? { ...previousSession.accounts } : null;
  const walletType = useGrazInternalStore.getState().walletType;

  logger.info(LogCategory.WALLET, "Disconnecting", {
    function: LOG_FUNCTIONS.DISCONNECT,
    chainId: chainId || "all chains",
  });

  typeof window !== "undefined" && window.sessionStorage.removeItem(RECONNECT_SESSION_KEY);

  const disable = () => {
    if (!disableWallet) return;
    if (isWalletConnect(useGrazInternalStore.getState().walletType)) {
      const walletConnectInstance = getWallet(WalletType.WALLETCONNECT);
      const { disable: walletConnectDisable } = walletConnectInstance;

      if (walletConnectDisable) {
        void walletConnectDisable();
      }
    }

    if (isPara(useGrazInternalStore.getState().walletType)) {
      const paraInstance = getWallet(WalletType.PARA);
      const { disable: paraDisable } = paraInstance;

      if (paraDisable) {
        void paraDisable();
      }
    }
  };
  if (chainId) {
    const _accounts = previousAccounts ? { ...previousAccounts } : null;
    chainId.forEach((x) => {
      delete _accounts?.[x];
    });
    const isEmpty = Object.values(_accounts ? _accounts : {}).length === 0;
    if (isEmpty) {
      disable();
      useGrazSessionStore.setState(grazSessionDefaultValues);
      useGrazInternalStore.setState({
        _reconnect: false,
        _reconnectConnector: null,
        recentChainIds: null,
      });
      logger.debug(LogCategory.STORE, "Session cleared - all chains disconnected", { function: LOG_FUNCTIONS.DISCONNECT });
    } else {
      useGrazSessionStore.setState((x) => ({
        activeChainIds: x.activeChainIds?.filter((item) => !chainId.includes(item)),
        accounts: _accounts,
      }));
      useGrazInternalStore.setState((x) => ({
        recentChainIds: x.recentChainIds?.filter((item) => !chainId.includes(item)),
      }));
      logger.debug(LogCategory.STORE, "Partial disconnect - some chains remain connected", { function: LOG_FUNCTIONS.DISCONNECT });
    }
  } else {
    disable();
    useGrazSessionStore.setState(grazSessionDefaultValues);
    useGrazInternalStore.setState({
      _reconnect: false,
      _reconnectConnector: null,
      recentChainIds: null,
    });
    logger.debug(LogCategory.STORE, "Session cleared - disconnected from all chains", { function: LOG_FUNCTIONS.DISCONNECT });
  }

  const activeChainIds = [...(useGrazSessionStore.getState().activeChainIds || [])];
  if (previousActiveChainIds.length > 0) {
    if (activeChainIds.length === 0) {
      emitWalletEvent({
        payload: {
          chainIds: previousActiveChainIds,
          reason,
          walletType,
        },
        type: "disconnect",
      });
    } else if (!haveSameChainIds(previousActiveChainIds, activeChainIds)) {
      emitWalletEvent({
        payload: {
          activeChainIds,
          previousActiveChainIds,
          walletType,
        },
        type: "activeChainsChange",
      });
    }
  }

  logger.info(LogCategory.WALLET, "Disconnected successfully", {
    function: LOG_FUNCTIONS.DISCONNECT,
    chainId: chainId || "all chains",
  });

  return Promise.resolve();
};

export const disconnect = (args?: { chainId?: ActionChainId }) => {
  return disconnectSession(args, "user", true);
};

export const disconnectWithReason = (
  reason: Exclude<DisconnectReason, "user">,
  options: { disableWallet?: boolean } = {},
) => {
  return disconnectSession(undefined, reason, options.disableWallet ?? false);
};

export type ReconnectArgs = Maybe<{ onError?: (error: unknown) => void }>;

export const reconnect = async (args?: ReconnectArgs) => {
  const logger = getLogger();
  const { recentChainIds: recentChains, _reconnectConnector, _reconnect } = useGrazInternalStore.getState();

  logger.debug(LogCategory.WALLET, "Attempting reconnection", {
    function: LOG_FUNCTIONS.RECONNECT,
    recentChains,
    walletType: _reconnectConnector,
  });

  try {
    const isWalletReady = checkWallet(_reconnectConnector || undefined);
    if (recentChains && isWalletReady && _reconnectConnector) {
      const isWC = isWalletConnect(_reconnectConnector);
      if (isWC) {
        const previousSession = useGrazSessionStore.getState();
        const previousAccounts = previousSession.accounts ? { ...previousSession.accounts } : null;
        const previousActiveChainIds = [...(previousSession.activeChainIds || [])];
        const wallet = getWallet(_reconnectConnector);
        await wallet.init?.();
        await wallet.enable(recentChains);
        const { chains } = useGrazInternalStore.getState();
        const resolvedChainIds = getWalletConnectResolvedChainIds(_reconnectConnector, recentChains, chains || []);
        useGrazInternalStore.setState({
          _reconnect,
          _reconnectConnector,
          recentChainIds: resolvedChainIds,
          walletType: _reconnectConnector,
        });
        useGrazSessionStore.setState({
          activeChainIds: resolvedChainIds,
          status: "connected",
        });
        typeof window !== "undefined" && window.sessionStorage.setItem(RECONNECT_SESSION_KEY, "Active");
        emitConnectedSessionChanges({
          previousAccounts,
          previousActiveChainIds,
          walletType: _reconnectConnector,
        });
        const { accounts } = useGrazSessionStore.getState();
        const connectedChains = getConnectedChains(resolvedChainIds, chains || []);
        return {
          accounts: accounts || {},
          chains: connectedChains,
          walletType: _reconnectConnector,
        };
      }
      const key = await connect({
        chainId: recentChains,
        walletType: _reconnectConnector,
        autoReconnect: _reconnect,
      });
      logger.info(LogCategory.WALLET, "Reconnection successful", { function: LOG_FUNCTIONS.RECONNECT });
      return key;
    } else {
      logger.warn(LogCategory.WALLET, "Reconnection skipped", {
        function: LOG_FUNCTIONS.RECONNECT,
        hasRecentChains: Boolean(recentChains),
        isWalletReady,
        hasConnector: Boolean(_reconnectConnector),
      });
    }
  } catch (error) {
    logger.warn(LogCategory.WALLET, "Reconnection failed", {
      function: LOG_FUNCTIONS.RECONNECT,
      error: error instanceof Error ? error.message : String(error),
    });
    args?.onError?.(error);
    void disconnectSession(undefined, "reconnect-failed", true);
  }
};

export interface OfflineSigners {
  offlineSigner: OfflineAminoSigner & OfflineDirectSigner;
  offlineSignerAmino: OfflineAminoSigner;
  offlineSignerAuto: OfflineAminoSigner | OfflineDirectSigner;
}

export const getOfflineSigners = async (args?: {
  walletType?: WalletType;
  chainId: string;
}): Promise<OfflineSigners> => {
  if (!args?.chainId) throw new Error("chainId is required");

  const { walletType } = useGrazInternalStore.getState();

  const currentWalletType = args.walletType || walletType;
  const isWalletAvailable = checkWallet(currentWalletType);
  if (!isWalletAvailable) {
    throw new Error(`${currentWalletType} is not available`);
  }

  const wallet = getWallet(currentWalletType);

  const offlineSigner = wallet.getOfflineSigner(args.chainId);
  const offlineSignerAmino = wallet.getOfflineSignerOnlyAmino(args.chainId);
  const offlineSignerAuto = await wallet.getOfflineSignerAuto(args.chainId);

  return { offlineSigner, offlineSignerAmino, offlineSignerAuto };
};
