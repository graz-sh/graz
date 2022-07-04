import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

import type { WadestaChain } from "../chains";
import { getKeplr } from "../keplr";
import { defaultValues, useWadestaStore } from "../store";

export interface ConnectOptions {
  autoConnect?: boolean;
}

export async function connect(chain: WadestaChain, opts: ConnectOptions = {}) {
  const { autoConnect = true } = opts;
  try {
    const keplr = getKeplr();

    useWadestaStore.setState({ status: "connecting" });
    await keplr.enable(chain.chainId);

    const signer = keplr.getOfflineSigner(chain.chainId);
    const signerAmino = keplr.getOfflineSignerOnlyAmino(chain.chainId);

    const [account, signerAuto, client] = await Promise.all([
      await keplr.getKey(chain.chainId),
      await keplr.getOfflineSignerAuto(chain.chainId),
      await SigningCosmWasmClient.connectWithSigner(chain.rpc, signer),
    ] as const);

    useWadestaStore.setState({
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
    if (useWadestaStore.getState().account === null) {
      useWadestaStore.setState({ status: "disconnected" });
    }
    throw error;
  }
}

export async function disconnect() {
  useWadestaStore.setState({
    ...defaultValues,
  });
  return Promise.resolve();
}

export async function getBalances(bech32Address: string) {
  const { activeChain, client } = useWadestaStore.getState();

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
