import type { SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import type { Key } from "@keplr-wallet/types";

import type { GrazChain } from "../chains";
import { RECONNECT_SESSION_KEY } from "../constant";
import { grazSessionDefaultValues, useGrazInternalStore, useGrazSessionStore } from "../store";
import type { Maybe } from "../types/core";
import type { WalletType } from "../types/wallet";
import { createClients, createSigningClients } from "./clients";
import { checkWallet, getWallet } from "./wallet";

export type ConnectArgs = Maybe<{
  chain?: GrazChain;
  signerOpts?: SigningCosmWasmClientOptions;
  walletType?: WalletType;
  autoReconnect?: boolean;
}>;

export interface ConnectResult {
  account: Key;
  walletType: WalletType;
  chain: GrazChain;
}

export const connect = async (args?: ConnectArgs): Promise<ConnectResult> => {
  try {
    const { defaultChain, recentChain, walletType } = useGrazInternalStore.getState();

    const currentWalletType = args?.walletType || walletType;

    const isWalletAvailable = checkWallet(currentWalletType);
    if (!isWalletAvailable) {
      throw new Error(`${currentWalletType} is not available`);
    }

    const wallet = getWallet(currentWalletType);

    const chain = args?.chain || recentChain || defaultChain;
    if (!chain) {
      throw new Error("No last known connected chain, connect action requires chain info");
    }

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

    const { account: _account, activeChain } = useGrazSessionStore.getState();
    await wallet.init?.();
    if (!_account || activeChain?.chainId !== chain.chainId) {
      await wallet.enable(chain.chainId);
      const account = await wallet.getKey(chain.chainId);
      useGrazSessionStore.setState({ account });
    }

    const offlineSigner = wallet.getOfflineSigner(chain.chainId);
    const offlineSignerAmino = wallet.getOfflineSignerOnlyAmino(chain.chainId);
    const offlineSignerAuto = await wallet.getOfflineSignerAuto(chain.chainId);
    const gasPrice = chain.gas ? GasPrice.fromString(`${chain.gas.price}${chain.gas.denom}`) : undefined;
    const [clients, signingClients] = await Promise.all([
      createClients(chain),
      createSigningClients({
        ...chain,
        offlineSignerAuto,
        cosmWasmSignerOptions: { gasPrice, ...(args?.signerOpts || {}) },
      }),
    ] as const);

    useGrazInternalStore.setState({
      recentChain: chain,
      walletType: currentWalletType,
      _reconnect: Boolean(args?.autoReconnect),
      _reconnectConnector: currentWalletType,
    });
    useGrazSessionStore.setState({
      activeChain: chain,
      clients,
      offlineSigner,
      offlineSignerAmino,
      offlineSignerAuto,
      signingClients,
      status: "connected",
    });
    typeof window !== "undefined" && window.sessionStorage.setItem(RECONNECT_SESSION_KEY, "Active");
    const { account } = useGrazSessionStore.getState();
    return { account: account!, walletType: currentWalletType, chain };
  } catch (error) {
    console.log("connect ", error);
    if (useGrazSessionStore.getState().account === null) {
      useGrazSessionStore.setState({ status: "disconnected" });
    }
    if (useGrazSessionStore.getState().account && useGrazSessionStore.getState().activeChain) {
      useGrazSessionStore.setState({ status: "connected" });
    }
    throw error;
  }
};

export const disconnect = async (clearRecentChain = false): Promise<void> => {
  typeof window !== "undefined" && window.sessionStorage.removeItem(RECONNECT_SESSION_KEY);
  useGrazSessionStore.setState(grazSessionDefaultValues);
  useGrazInternalStore.setState((x) => ({
    _reconnect: false,
    _reconnectConnector: null,
    recentChain: clearRecentChain ? null : x.recentChain,
  }));
  return Promise.resolve();
};

export type ReconnectArgs = Maybe<{ onError?: (error: unknown) => void }>;

export const reconnect = async (args?: ReconnectArgs) => {
  const { recentChain, _reconnectConnector, _reconnect } = useGrazInternalStore.getState();
  try {
    const isWalletReady = checkWallet(_reconnectConnector || undefined);
    if (recentChain && isWalletReady && _reconnectConnector) {
      const key = await connect({
        chain: recentChain,
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
