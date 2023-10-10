import type { OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { OfflineAminoSigner } from "@keplr-wallet/types";

import type { GrazChain } from "../chains";
import { RECONNECT_SESSION_KEY } from "../constant";
import type { Account } from "../store";
import { grazSessionDefaultValues, useGrazInternalStore, useGrazSessionStore } from "../store";
import type { Maybe } from "../types/core";
import type { WalletType } from "../types/wallet";
import { checkWallet, getWallet, isWalletConnect } from "./wallet";

export type ConnectArgs = {
  chain: GrazChain;
  walletType?: WalletType;
  autoReconnect?: boolean;
};

export interface ConnectResult {
  accounts: Map<GrazChain, Account>;
  walletType: WalletType;
  chain: GrazChain;
}

export const connect = async (args: ConnectArgs): Promise<ConnectResult> => {
  try {
    const { walletType } = useGrazInternalStore.getState();

    const currentWalletType = args.walletType || walletType;

    const isWalletAvailable = checkWallet(currentWalletType);
    if (!isWalletAvailable) {
      throw new Error(`${currentWalletType} is not available`);
    }

    const wallet = getWallet(currentWalletType);

    const chain = args.chain;

    useGrazSessionStore.setState((x) => {
      const isReconnecting =
        useGrazInternalStore.getState()._reconnect ||
        Boolean(useGrazInternalStore.getState()._reconnectConnector) ||
        Boolean(chain);
      const isSwitchingChain = x.activeChain && x.activeChain.chainId !== chain.chainId;
      if (isSwitchingChain) return { status: "connecting" };
      if (isReconnecting) return { status: "reconnecting" };
      return { status: "connecting" };
    });

    const { accounts: _accounts } = useGrazSessionStore.getState();
    await wallet.init?.();
    await wallet.enable(chain.chainId);
    if (!isWalletConnect(currentWalletType)) {
      const key = await wallet.getKey(chain.chainId);
      const account = {
        chain,
        key,
      };
      const accountsCopy = _accounts;
      accountsCopy.set(chain, account);
      useGrazSessionStore.setState({ accounts: accountsCopy });
    }

    useGrazInternalStore.setState({
      walletType: currentWalletType,
      _reconnect: Boolean(args?.autoReconnect),
      _reconnectConnector: currentWalletType,
    });
    useGrazSessionStore.setState({
      status: "connected",
    });
    typeof window !== "undefined" && window.sessionStorage.setItem(RECONNECT_SESSION_KEY, "Active");
    const { accounts } = useGrazSessionStore.getState();
    return { accounts, walletType: currentWalletType, chain };
  } catch (error) {
    console.error("connect ", error);
    if (useGrazSessionStore.getState().accounts.size === 0) {
      useGrazSessionStore.setState({ status: "disconnected" });
    }
    if (useGrazSessionStore.getState().accounts.size > 0) {
      useGrazSessionStore.setState({ status: "connected" });
    }
    throw error;
  }
};

export const disconnect = async (): Promise<void> => {
  typeof window !== "undefined" && window.sessionStorage.removeItem(RECONNECT_SESSION_KEY);
  useGrazSessionStore.setState(grazSessionDefaultValues);
  useGrazInternalStore.setState(() => ({
    _reconnect: false,
    _reconnectConnector: null,
  }));
  return Promise.resolve();
};

export type ReconnectArgs = Maybe<{ onError?: (error: unknown) => void }>;

export const reconnect = async (args?: ReconnectArgs) => {
  const { defaultChain, _reconnectConnector, _reconnect } = useGrazInternalStore.getState();
  try {
    const isWalletReady = checkWallet(_reconnectConnector || undefined);
    if (defaultChain && isWalletReady && _reconnectConnector) {
      const key = await connect({
        chain: defaultChain,
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
