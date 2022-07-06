import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

import type { GrazChain } from "../chains";
import { getKeplr } from "../keplr";
import { defaultValues, useGrazStore } from "../store";

export interface ConnectOptions {
  autoConnect?: boolean;
}

export async function connect(chain: GrazChain, opts: ConnectOptions = {}) {
  const { autoConnect = true } = opts;
  try {
    const keplr = getKeplr();

    useGrazStore.setState((x) => ({ status: x._reconnect ? "reconnecting" : "connecting" }));
    await keplr.enable(chain.chainId);

    const signer = keplr.getOfflineSigner(chain.chainId);
    const signerAmino = keplr.getOfflineSignerOnlyAmino(chain.chainId);

    const [account, signerAuto, client] = await Promise.all([
      await keplr.getKey(chain.chainId),
      await keplr.getOfflineSignerAuto(chain.chainId),
      await SigningCosmWasmClient.connectWithSigner(chain.rpc, signer),
    ] as const);

    useGrazStore.setState({
      account,
      activeChain: chain,
      client,
      signer,
      signerAuto,
      signerAmino,
      status: "connected",
      _reconnect: autoConnect,
    });

    return account;
  } catch (error) {
    if (useGrazStore.getState().account === null) {
      useGrazStore.setState({ status: "disconnected" });
    }
    throw error;
  }
}

export async function disconnect() {
  useGrazStore.setState({
    ...defaultValues,
  });
  return Promise.resolve();
}

export async function getBalances(bech32Address: string) {
  const { activeChain, client } = useGrazStore.getState();

  if (!activeChain || !client) {
    throw new Error("No connected account detected");
  }

  const balances = await Promise.all(
    activeChain.currencies.map(async (item) => {
      return client.getBalance(bech32Address, item.coinMinimalDenom);
    }),
  );

  return balances;
}

export function reconnect() {
  const { activeChain } = useGrazStore.getState();
  if (activeChain) void connect(activeChain);
}
