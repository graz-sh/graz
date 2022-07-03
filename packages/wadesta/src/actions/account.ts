import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { AppCurrency } from "@keplr-wallet/types";

import { getKeplr } from "../keplr";
import type { WadestaChain } from "../store";
import { defaultValues, useWadestaStore } from "../store";

export interface BalanceProps {
  address: string;
  currencies: AppCurrency[];
}

export async function connect(chain: WadestaChain) {
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
      _reconnect: true,
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

export async function fetchBalance({ currencies }: BalanceProps) {
  const { client, account } = useWadestaStore.getState();
  if (!client) throw new Error("client is not defined");
  if (!account) throw new Error("account is not defined");

  const coins = await Promise.all(
    currencies.map(async (item) => {
      return client.getBalance(account.bech32Address, item.coinMinimalDenom);
    }),
  );

  return coins;
}
