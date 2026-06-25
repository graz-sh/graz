import type { OfflineAminoSigner } from "@cosmjs/amino";
import type { OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { ChainInfo } from "@keplr-wallet/types";

import { LOG_FUNCTIONS, RECONNECT_SESSION_KEY } from "../constant";
import { grazSessionDefaultValues, useGrazInternalStore, useGrazSessionStore } from "../store";
import type { Maybe } from "../types/core";
import type { Key } from "../types/wallet";
import { WalletType } from "../types/wallet";
import { LogCategory } from "../types/logger";
import { getLogger } from "../utils/logger";
import { checkWallet, getWallet, isPara, isWalletConnect } from "./wallet";

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

export const connect = async (args?: ConnectArgs): Promise<ConnectResult> => {
  const logger = getLogger();
  logger.time("connect");
  logger.group("Connect Wallet");

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
      recentChainIds: [...(prev.recentChainIds || []), ...chainIds].filter((thing, i, arr) => {
        return arr.indexOf(thing) === i;
      }),
    }));
    useGrazSessionStore.setState((prev) => ({
      activeChainIds: [...(prev.activeChainIds || []), ...chainIds].filter((thing, i, arr) => {
        return arr.indexOf(thing) === i;
      }),
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

    const connectedChains = chainIds.map((x) => chains!.find((y) => y.chainId === x)!);
    const _resAcc = useGrazSessionStore.getState().accounts;

    logger.info(LogCategory.WALLET, "Connection successful", {
      function: LOG_FUNCTIONS.CONNECT,
      walletType: currentWalletType,
      chainCount: chainIds.length,
      chainIds,
      addresses: _resAcc ? Object.values(_resAcc).map((a) => a.bech32Address) : [],
    });

    logger.debug(LogCategory.STORE, "Session store updated", { function: LOG_FUNCTIONS.CONNECT, accountCount: Object.keys(_resAcc || {}).length });

    logger.timeEnd("connect");
    logger.groupEnd();

    return { accounts: _resAcc!, walletType: currentWalletType, chains: connectedChains };
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

export const disconnect = (args?: { chainId?: ActionChainId }) => {
  const logger = getLogger();
  const chainId = typeof args?.chainId === "string" ? [args.chainId] : args?.chainId;

  logger.info(LogCategory.WALLET, "Disconnecting", {
    function: LOG_FUNCTIONS.DISCONNECT,
    chainId: chainId || "all chains",
  });

  typeof window !== "undefined" && window.sessionStorage.removeItem(RECONNECT_SESSION_KEY);

  const disable = () => {
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
    const _accounts = useGrazSessionStore.getState().accounts;
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

  logger.info(LogCategory.WALLET, "Disconnected successfully", {
    function: LOG_FUNCTIONS.DISCONNECT,
    chainId: chainId || "all chains",
  });

  return Promise.resolve();
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
      if (isWC) return;
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
    void disconnect();
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
