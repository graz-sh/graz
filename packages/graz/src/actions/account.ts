import type { SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import type { Key } from "@keplr-wallet/types";

import type { GrazChain } from "../chains";
import { RECONNECT_SESSION_KEY } from "../constant";
import { defaultValues, useGrazStore } from "../store";
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

export const connect = async (args?: ConnectArgs): Promise<Key> => {
  try {
    const { defaultChain, recentChain, walletType } = useGrazStore.getState();

    const currentWalletType = args?.walletType || walletType;
    const wallet = getWallet(currentWalletType);

    const chain = args?.chain || recentChain || defaultChain;
    if (!chain) {
      throw new Error("No last known connected chain, connect action requires chain info");
    }

    useGrazStore.setState((x) => {
      const isReconnecting = x._reconnect || Boolean(x._reconnectConnector) || Boolean(chain);
      const isSwitchingChain = x.activeChain && x.activeChain.chainId !== chain.chainId;

      if (isSwitchingChain) return { status: "connecting" };
      if (isReconnecting) return { status: "reconnecting" };
      return { status: "connecting" };
    });

    await wallet.enable(chain.chainId);

    const offlineSigner = wallet.getOfflineSigner(chain.chainId);
    const offlineSignerAmino = wallet.getOfflineSignerOnlyAmino(chain.chainId);
    const offlineSignerAuto = await wallet.getOfflineSignerAuto(chain.chainId);

    const gasPrice = chain.gas ? GasPrice.fromString(`${chain.gas.price}${chain.gas.denom}`) : undefined;

    const [account, clients, signingClients] = await Promise.all([
      wallet.getKey(chain.chainId),
      createClients(chain),
      createSigningClients({
        ...chain,
        offlineSignerAuto,
        cosmWasmSignerOptions: { gasPrice, ...(args?.signerOpts || {}) },
      }),
    ] as const);

    useGrazStore.setState({
      account,
      activeChain: chain,
      clients,
      offlineSigner,
      offlineSignerAmino,
      offlineSignerAuto,
      recentChain: chain,
      signingClients,
      status: "connected",
      walletType: currentWalletType,
      _reconnect: Boolean(args?.autoReconnect),
      _reconnectConnector: currentWalletType,
    });
    typeof window !== "undefined" && window.sessionStorage.setItem(RECONNECT_SESSION_KEY, "Active");

    return account;
  } catch (error) {
    if (useGrazStore.getState().account === null) {
      useGrazStore.setState({ status: "disconnected" });
    }
    throw error;
  }
};

export const disconnect = async (clearRecentChain = false): Promise<void> => {
  typeof window !== "undefined" && window.sessionStorage.removeItem(RECONNECT_SESSION_KEY);

  useGrazStore.setState((x) => ({
    ...defaultValues,
    recentChain: clearRecentChain ? null : x.recentChain,
  }));
  return Promise.resolve();
};

export type ReconnectArgs = Maybe<{ onError?: (error: unknown) => void }>;

export const reconnect = async (args?: ReconnectArgs) => {
  const { recentChain, _reconnectConnector, _reconnect } = useGrazStore.getState();
  const isWalletReady = checkWallet(_reconnectConnector || undefined);
  try {
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
