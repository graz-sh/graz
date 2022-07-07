import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";

import type { GrazChain } from "../chains";
import { getKeplr } from "../keplr";
import { defaultValues, useGrazStore } from "../store";

export async function connect(chain: GrazChain) {
  try {
    const keplr = getKeplr();

    useGrazStore.setState((x) => {
      const isReconnecting = x._reconnect;
      const isSwitchingChain = x.activeChain && x.activeChain.chainId !== chain.chainId;

      if (isSwitchingChain) return { status: "connecting" };
      if (isReconnecting) return { status: "reconnecting" };
      return { status: "connecting" };
    });

    await keplr.enable(chain.chainId);

    const signer = keplr.getOfflineSigner(chain.chainId);
    const signerAmino = keplr.getOfflineSignerOnlyAmino(chain.chainId);

    const [account, signerAuto, client] = await Promise.all([
      await keplr.getKey(chain.chainId),
      await keplr.getOfflineSignerAuto(chain.chainId),
      await SigningCosmWasmClient.connectWithSigner(chain.rpc, signer, {
        gasPrice:
          chain.gasPrice && chain.gasDenom ? GasPrice.fromString(`${chain.gasPrice}${chain.gasDenom}`) : undefined,
      }),
    ] as const);

    useGrazStore.setState({
      account,
      activeChain: chain,
      client,
      signer,
      signerAuto,
      signerAmino,
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

export async function disconnect() {
  useGrazStore.setState((x) => ({
    ...defaultValues,
    _supported: x._supported,
  }));
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
