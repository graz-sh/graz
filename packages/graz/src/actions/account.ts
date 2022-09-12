import type { SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import type { Coin } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import type { Key } from "@keplr-wallet/types";

import type { GrazChain } from "../chains";
import { defaultValues, useGrazStore } from "../store";
import type { Maybe, WalletType } from "../types/core";
import { createClients, createSigningClients } from "./clients";
import { getWallet } from "./wallet";

export type ConnectArgs = Maybe<
  GrazChain & {
    signerOpts?: SigningCosmWasmClientOptions;
    walletType?: WalletType;
  }
>;

export async function connect(args?: ConnectArgs): Promise<Key> {
  try {
    const { defaultChain, recentChain, walletType } = useGrazStore.getState();

    const currentWalletType = args?.walletType || walletType;
    const wallet = getWallet(currentWalletType);

    const chain = args || recentChain || defaultChain;
    if (!chain) {
      throw new Error("No last known connected chain, connect action requires chain info");
    }

    useGrazStore.setState((x) => {
      const isReconnecting = x._reconnect;
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
      _reconnect: true,
    });

    return account;
  } catch (error) {
    if (useGrazStore.getState().account === null) {
      useGrazStore.setState({ status: "disconnected" });
    }
    throw error;
  }
}

export async function disconnect(clearRecentChain = false): Promise<void> {
  useGrazStore.setState((x) => ({
    ...defaultValues,
    recentChain: clearRecentChain ? null : x.recentChain,
  }));
  return Promise.resolve();
}

export async function getBalances(bech32Address: string): Promise<Coin[]> {
  const { activeChain, signingClients } = useGrazStore.getState();

  if (!activeChain || !signingClients) {
    throw new Error("No connected account detected");
  }

  const { defaultSigningClient } = useGrazStore.getState();
  const balances = await Promise.all(
    activeChain.currencies.map(async (item) => {
      return signingClients[defaultSigningClient].getBalance(bech32Address, item.coinMinimalDenom);
    }),
  );

  return balances;
}

export async function getStakedBalances(bech32Address: string): Promise<Coin | null> {
  const { clients } = useGrazStore.getState();
  if (!clients?.stargate) {
    throw new Error("Stargate client is not ready");
  }
  return clients.stargate.getBalanceStaked(bech32Address);
}

export function reconnect(): void {
  const { activeChain } = useGrazStore.getState();
  if (activeChain) void connect(activeChain);
}
