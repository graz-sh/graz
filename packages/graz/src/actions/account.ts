import type { OfflineAminoSigner, OfflineDirectSigner } from "@keplr-wallet/types";

import { RECONNECT_SESSION_KEY } from "../constant";
import type { GrazAccountSession } from "../store";
import { grazSessionDefaultValues, useGrazInternalStore, useGrazSessionStore } from "../store";
import type { Maybe } from "../types/core";
import type { WalletType } from "../types/wallet";
import { mergeSessions } from "../utils/mergeSessions";
import { checkWallet, getWallet } from "./wallet";

export type ConnectArgs = Maybe<{
  chainId: string[];
  walletType?: WalletType;
  autoReconnect?: boolean;
}>;

export interface ConnectResult {
  walletType: WalletType;
  sessions: GrazAccountSession[];
}

export const connect = async (args?: ConnectArgs): Promise<ConnectResult> => {
  try {
    const { recentChains, walletType } = useGrazInternalStore.getState();
    if (args?.walletType && args.walletType !== walletType) {
      await disconnect();
    }
    const currentWalletType = args?.walletType || walletType;

    const isWalletAvailable = checkWallet(currentWalletType);
    if (!isWalletAvailable) {
      throw new Error(`${currentWalletType} is not available`);
    }

    const wallet = getWallet(currentWalletType);

    const chainId = args?.chainId || recentChains;
    if (!chainId) {
      throw new Error("No last known connected chain, connect action requires chain id");
    }

    await wallet.init?.();
    await wallet.enable(chainId);
    const { sessions: _sessions } = useGrazSessionStore.getState();
    const sessions = await Promise.all(
      chainId.map(async (i) => {
        const account = await wallet.getKey(i);
        return { account, chainId: i, status: "connected" } as GrazAccountSession;
      }),
    );
    useGrazSessionStore.setState((prev) => ({ sessions: mergeSessions({ prev: prev.sessions, next: sessions }) }));

    useGrazInternalStore.setState({
      recentChains: useGrazSessionStore.getState().sessions?.map((session) => session.chainId),
      walletType: currentWalletType,
      _reconnect: Boolean(args?.autoReconnect),
      _reconnectConnector: currentWalletType,
    });
    typeof window !== "undefined" && window.sessionStorage.setItem(RECONNECT_SESSION_KEY, "Active");

    return { walletType: currentWalletType, sessions };
  } catch (error) {
    console.error("connect ", error);
    useGrazSessionStore.setState((prev) => ({
      sessions: prev.sessions?.map((item) =>
        item.account
          ? { ...item, status: "connected" }
          : {
              ...item,
              status: "disconnected",
            },
      ),
    }));

    throw error;
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

export const disconnect = async (args?: { chainId?: string[] }): Promise<void> => {
  typeof window !== "undefined" && window.sessionStorage.removeItem(RECONNECT_SESSION_KEY);
  if (args?.chainId) {
    useGrazSessionStore.setState((x) => ({
      sessions: x.sessions?.filter((item) => !args.chainId?.includes(item.chainId)),
    }));
    useGrazInternalStore.setState((x) => ({
      _reconnect: false,
      _reconnectConnector: null,
      recentChains: x.recentChains?.filter((item) => !args.chainId?.includes(item)),
    }));
  } else {
    useGrazSessionStore.setState(grazSessionDefaultValues);
    useGrazInternalStore.setState({
      _reconnect: false,
      _reconnectConnector: null,
      recentChains: null,
    });
  }

  return Promise.resolve();
};

export type ReconnectArgs = Maybe<{ onError?: (error: unknown) => void }>;

export const reconnect = async (args?: ReconnectArgs) => {
  const { recentChains, _reconnectConnector, _reconnect } = useGrazInternalStore.getState();
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
