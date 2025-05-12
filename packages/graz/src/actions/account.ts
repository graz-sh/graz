import type { OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { ChainInfo, OfflineAminoSigner } from "@keplr-wallet/types";

import { RECONNECT_SESSION_KEY } from "../constant";
import { grazSessionDefaultValues, useGrazInternalStore, useGrazSessionStore } from "../store";
import type { Maybe } from "../types/core";
import type { Key } from "../types/wallet";
import { WalletType } from "../types/wallet";
import type { ChainId } from "../utils/multi-chain";
import { checkWallet, getWallet, isCapsule, isLeapDappBrowser, isLeapSnaps, isWalletConnect } from "./wallet";

export type ConnectArgs = Maybe<{
  chainId: ChainId;
  walletType?: WalletType;
  autoReconnect?: boolean;
}>;

export interface ConnectResult {
  accounts: Record<string, Key>;
  walletType: WalletType;
  chains: ChainInfo[];
}

export const connect = async (args?: ConnectArgs): Promise<ConnectResult> => {
  try {
    const { recentChainIds: recentChains, chains, walletType } = useGrazInternalStore.getState();

    const currentWalletType = args?.walletType || walletType;

    if (isWalletConnect(currentWalletType)) {
      const walletConnectInstance = getWallet(WalletType.WALLETCONNECT);
      const { disable: walletConnectDisable } = walletConnectInstance;

      if (walletConnectDisable) {
        void walletConnectDisable();
      }
    }

    const isWalletAvailable = checkWallet(currentWalletType);
    if (!isWalletAvailable) {
      throw new Error(`${currentWalletType} is not available`);
    }

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

    const { accounts: _account } = useGrazSessionStore.getState();
    await wallet.init?.();
    if (
      isCapsule(currentWalletType) &&
      useGrazSessionStore.getState().capsuleClient &&
      Object.values(useGrazSessionStore.getState().accounts || []).length > 0
    ) {
      const connectedChains = chainIds.map((x) => chains!.find((y) => y.chainId === x)!);
      const _resAcc = useGrazSessionStore.getState().accounts;
      useGrazSessionStore.setState({ status: "connecting" });

      const resultAcccounts = Object.fromEntries(
        await Promise.all(
          chainIds.map(async (chainId): Promise<[string, Key]> => [chainId, await wallet.getKey(chainId)]),
        ),
      );
      useGrazSessionStore.setState((prev) => ({
        accounts: { ...(prev.accounts || {}), ...resultAcccounts },
      }));

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
      useGrazSessionStore.setState({
        status: "connected",
      });
      return { accounts: _resAcc!, walletType: currentWalletType, chains: connectedChains };
    }
    await wallet.enable(chainIds);
    if (isCapsule(currentWalletType)) {
      const connectedChains = chainIds.map((x) => chains!.find((y) => y.chainId === x)!);
      const _resAcc = useGrazSessionStore.getState().accounts;
      useGrazSessionStore.setState({ status: "connecting" });
      return { accounts: _resAcc!, walletType: currentWalletType, chains: connectedChains };
    }
    if (!isWalletConnect(currentWalletType)) {
      let resultAccounts: Record<string, Key> = {};
      if (isLeapSnaps(currentWalletType)) {
        const accounts: Record<string, Key> = {};
        for await (const chainId of chainIds) {
          accounts[chainId] = await wallet.getKey(chainId);
        }
        resultAccounts = accounts;
      } else if (isLeapDappBrowser() && wallet.getKeys) {
        const allAccounts = await wallet.getKeys(chainIds);
        chainIds.forEach((chainId, index) => {
          const account = allAccounts[index];
          if (account) {
            resultAccounts[chainId] = account;
          }
        });
      } else {
        resultAccounts = Object.fromEntries(
          await Promise.all(
            chainIds.map(async (chainId): Promise<[string, Key]> => [chainId, await wallet.getKey(chainId)]),
          ),
        );
      }
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
    return { accounts: _resAcc!, walletType: currentWalletType, chains: connectedChains };
  } catch (error) {
    console.error("connect ", error);
    if (useGrazSessionStore.getState().accounts === null) {
      useGrazSessionStore.setState({ status: "disconnected" });
    }
    if (useGrazSessionStore.getState().accounts && useGrazSessionStore.getState().activeChainIds) {
      useGrazSessionStore.setState({ status: "connected" });
    }
    throw error;
  }
};

export const disconnect = (args?: { chainId?: ChainId }) => {
  typeof window !== "undefined" && window.sessionStorage.removeItem(RECONNECT_SESSION_KEY);
  const chainId = typeof args?.chainId === "string" ? [args.chainId] : args?.chainId;

  if (isWalletConnect(useGrazInternalStore.getState().walletType)) {
    const walletConnectInstance = getWallet(WalletType.WALLETCONNECT);
    const { disable: walletConnectDisable } = walletConnectInstance;

    if (walletConnectDisable) {
      void walletConnectDisable();
    }
  }

  if (chainId) {
    const _accounts = useGrazSessionStore.getState().accounts;
    chainId.forEach((x) => {
      delete _accounts?.[x];
    });
    const isEmpty = Object.values(_accounts ? _accounts : {}).length === 0;
    if (isEmpty) {
      useGrazSessionStore.setState(grazSessionDefaultValues);
      useGrazInternalStore.setState({
        _reconnect: false,
        _reconnectConnector: null,
        recentChainIds: null,
      });
    } else {
      useGrazSessionStore.setState((x) => ({
        activeChainIds: x.activeChainIds?.filter((item) => !chainId.includes(item)),
        accounts: _accounts,
      }));
      useGrazInternalStore.setState((x) => ({
        recentChainIds: x.recentChainIds?.filter((item) => !chainId.includes(item)),
      }));
    }
  } else {
    useGrazSessionStore.setState(grazSessionDefaultValues);
    useGrazInternalStore.setState({
      _reconnect: false,
      _reconnectConnector: null,
      recentChainIds: null,
    });
  }

  return Promise.resolve();
};

export type ReconnectArgs = Maybe<{ onError?: (error: unknown) => void }>;

export const reconnect = async (args?: ReconnectArgs) => {
  const { recentChainIds: recentChains, _reconnectConnector, _reconnect } = useGrazInternalStore.getState();
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
      return key;
    }
  } catch (error) {
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
