import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { AppCurrency } from "@keplr-wallet/types";

import { getAllChains } from "../chains";
import { getKeplr } from "../keplr";
import type { WadestaChain } from "../store";
import { defaultValues, useWadestaStore } from "../store";

export interface BalanceProps {
  address?: string;
  currencies?: AppCurrency[];
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

/**
 *
 * @param address - if address isn't provided it will be using current logged in address
 *
 * @param currencies - if currencies isn't provided it will be using current active chain currencies
 */
export async function fetchBalance({ address, currencies }: BalanceProps) {
  const { client, account, activeChain } = useWadestaStore.getState();
  if (!client) throw new Error("client is not defined");
  if (!account) throw new Error("account is not defined");

  const activeChainCurrencies =
    currencies || getAllChains().find((item) => item.chainId === activeChain?.chainId)?.currencies;
  const selectedAddress = address || account.bech32Address;

  if (!activeChainCurrencies) throw new Error("can't find currencies");
  if (!selectedAddress) throw new Error("address is not defined");

  const coins = await Promise.all(
    activeChainCurrencies.map((item) => {
      return client.getBalance(selectedAddress, item.coinMinimalDenom);
    }),
  );

  useWadestaStore.setState({ balance: coins });

  return coins;
}
