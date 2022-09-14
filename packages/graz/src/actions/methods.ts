import type { Coin } from "@cosmjs/proto-signing";
import type { DeliverTxResponse, StdFee } from "@cosmjs/stargate";
import type { Height } from "cosmjs-types/ibc/core/client/v1/client";

import { useGrazStore } from "../store";

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

export interface SendTokensProps {
  senderAddress: string | undefined;
  recipientAddress: string;
  amount: Coin[];
  fee: number | StdFee | "auto";
  memo?: string;
}

// https://cosmos.github.io/cosmjs/latest/stargate/classes/SigningStargateClient.html#sendTokens
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

export interface SendIbcTokensProps {
  senderAddress: string | undefined;
  recipientAddress: string;
  transferAmount: Coin;
  sourcePort: string;
  sourceChannel: string;
  timeoutHeight: Height | undefined;
  timeoutTimestamp: number | undefined;
  fee: number | StdFee | "auto";
  memo: string;
}

// https://cosmos.github.io/cosmjs/latest/stargate/classes/SigningStargateClient.html#sendIbcTokens
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
