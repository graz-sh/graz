import type { SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import type { Coin } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import type { Key } from "@keplr-wallet/types";

import type { GrazChain } from "../chains";
import { defaultValues, useGrazStore } from "../store";
import type { Maybe } from "../types/core";
import { createClients, createSigningClients } from "./clients";
import { getKeplr } from "./keplr";

export type ConnectArgs = Maybe<GrazChain & { signerOpts?: SigningCosmWasmClientOptions }>;

export async function connect(args?: ConnectArgs): Promise<Key> {
  try {
    const keplr = getKeplr();

    const { defaultChain, recentChain } = useGrazStore.getState();
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

    await keplr.enable(chain.chainId);

    const offlineSigner = keplr.getOfflineSigner(chain.chainId);
    const offlineSignerAmino = keplr.getOfflineSignerOnlyAmino(chain.chainId);

    const gasPrice = chain.gas ? GasPrice.fromString(`${chain.gas.price}${chain.gas.denom}`) : undefined;

    const [account, clients, offlineSignerAuto, signingClients] = await Promise.all([
      keplr.getKey(chain.chainId),
      createClients(chain),
      keplr.getOfflineSignerAuto(chain.chainId),
      createSigningClients({
        ...chain,
        offlineSigner,
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
    _supported: x._supported,
  }));
  return Promise.resolve();
}

export async function getBalances(bech32Address: string): Promise<Coin[]> {
  const { activeChain, signingClients } = useGrazStore.getState();

  if (!activeChain || !signingClients) {
    throw new Error("No connected account detected");
  }

  const balances = await Promise.all(
    activeChain.currencies.map(async (item) => {
      return signingClients.cosmWasm.getBalance(bech32Address, item.coinMinimalDenom);
    }),
  );

  return balances;
}

export function reconnect(): void {
  const { activeChain } = useGrazStore.getState();
  if (activeChain) void connect(activeChain);
}
