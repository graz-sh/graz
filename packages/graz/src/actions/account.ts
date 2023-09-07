import { fromBech32, toBech32 } from "@cosmjs/encoding";
import type { OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { Key, OfflineAminoSigner } from "@keplr-wallet/types";

import type { GrazChain } from "../chains";
import { RECONNECT_SESSION_KEY } from "../constant";
import { grazSessionDefaultValues, useGrazInternalStore, useGrazSessionStore } from "../store";
import type { Maybe } from "../types/core";
import type { WalletType } from "../types/wallet";
import { checkWallet, getWallet, isWalletConnect } from "./wallet";
import type { ChainId } from "../utils/multi-chain";

export type ConnectArgs = Maybe<{
  chainId: ChainId;
  walletType?: WalletType;
  autoReconnect?: boolean;
}>;

export interface ConnectResult {
  accounts: Record<string, Key>;
  walletType: WalletType;
  chains: GrazChain[];
}

export const connect = async (args?: ConnectArgs): Promise<ConnectResult> => {
  try {
    const { recentChainIds: recentChains, chains, walletType } = useGrazInternalStore.getState();

    const currentWalletType = args?.walletType || walletType;

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
    await wallet.enable(chainIds);
    if (!isWalletConnect(currentWalletType)) {
      const key = await wallet.getKey(chainIds[0]!);
      const resultAcccounts: Record<string, Key> = {};
      chainIds.forEach((chainId) => {
        resultAcccounts[chainId] = {
          ...key,
          bech32Address: toBech32(
            chains!.find((x) => x.chainId === chainId)!.bech32Config.bech32PrefixAccAddr,
            fromBech32(key.bech32Address).data,
          ),
        };
      });
      useGrazSessionStore.setState((prev) => ({
        accounts: { ...(prev.accounts || {}), ...resultAcccounts },
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
  if (chainId) {
    const _accounts = useGrazSessionStore.getState().accounts;
    chainId.forEach((x) => {
      delete _accounts?.[x];
    });

    useGrazSessionStore.setState((x) => ({
      activeChainIds: x.activeChainIds?.filter((item) => !chainId?.includes(item)),
      accounts: _accounts,
    }));
    useGrazInternalStore.setState((x) => ({
      recentChainIds: x.recentChainIds?.filter((item) => !chainId?.includes(item)),
    }));
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
