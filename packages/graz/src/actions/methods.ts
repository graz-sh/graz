import type { Coin } from "@cosmjs/proto-signing";
import type { DeliverTxResponse } from "@cosmjs/stargate";

import { useGrazStore } from "../store";
import type { SendIbcTokensProps, SendTokensProps } from "../types/methods";

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
/**
 *
 * @see https://cosmos.github.io/cosmjs/latest/stargate/classes/SigningStargateClient.html#sendTokens
 */
export async function sendTokens({
  senderAddress,
  recipientAddress,
  amount,
  fee,
  memo,
}: SendTokensProps): Promise<DeliverTxResponse> {
  const { signingClients, defaultSigningClient } = useGrazStore.getState();
  if (!signingClients?.stargate) {
    throw new Error("Stargate client is not ready");
  }
  if (!senderAddress) {
    throw new Error("senderAddress is not defined");
  }
  return signingClients[defaultSigningClient].sendTokens(senderAddress, recipientAddress, amount, fee, memo);
}

/**
 *
 * @see https://cosmos.github.io/cosmjs/latest/stargate/classes/SigningStargateClient.html#sendIbcTokens
 */
export async function sendIbcTokens({
  senderAddress,
  recipientAddress,
  transferAmount,
  sourcePort,
  sourceChannel,
  timeoutHeight,
  timeoutTimestamp,
  fee,
  memo,
}: SendIbcTokensProps) {
  const { signingClients } = useGrazStore.getState();
  if (!signingClients?.stargate) {
    throw new Error("Stargate client is not ready");
  }
  if (!senderAddress) {
    throw new Error("senderAddress is not defined");
  }
  return signingClients.stargate.sendIbcTokens(
    senderAddress,
    recipientAddress,
    transferAmount,
    sourcePort,
    sourceChannel,
    timeoutHeight,
    timeoutTimestamp,
    fee,
    memo,
  );
}
