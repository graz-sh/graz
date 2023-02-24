import type { InstantiateOptions } from "@cosmjs/cosmwasm-stargate";
import type { Coin } from "@cosmjs/proto-signing";
import type { DeliverTxResponse, StdFee } from "@cosmjs/stargate";
import type { Height } from "cosmjs-types/ibc/core/client/v1/client";

import { useGrazStore } from "../store";

export const getBalances = async (bech32Address: string): Promise<Coin[]> => {
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
};

export const getBalanceStaked = async (bech32Address: string): Promise<Coin | null> => {
  const { clients } = useGrazStore.getState();
  if (!clients?.stargate) {
    throw new Error("Stargate client is not ready");
  }
  return clients.stargate.getBalanceStaked(bech32Address);
};

// https://cosmos.github.io/cosmjs/latest/stargate/classes/SigningStargateClient.html#sendTokens
export interface SendTokensArgs {
  senderAddress?: string;
  recipientAddress: string;
  amount: Coin[];
  fee: number | StdFee | "auto";
  memo?: string;
}

export const sendTokens = async ({
  senderAddress,
  recipientAddress,
  amount,
  fee,
  memo,
}: SendTokensArgs): Promise<DeliverTxResponse> => {
  const { signingClients, defaultSigningClient } = useGrazStore.getState();
  if (!signingClients) {
    throw new Error("No connected account detected");
  }
  if (!senderAddress) {
    throw new Error("senderAddress is not defined");
  }
  return signingClients[defaultSigningClient].sendTokens(senderAddress, recipientAddress, amount, fee, memo);
};

// https://cosmos.github.io/cosmjs/latest/stargate/classes/SigningStargateClient.html#sendIbcTokens
export interface SendIbcTokensArgs {
  senderAddress?: string;
  recipientAddress: string;
  transferAmount: Coin;
  sourcePort: string;
  sourceChannel: string;
  timeoutHeight?: Height;
  timeoutTimestamp?: number;
  fee: number | StdFee | "auto";
  memo?: string;
}

export const sendIbcTokens = async ({
  senderAddress,
  recipientAddress,
  transferAmount,
  sourcePort,
  sourceChannel,
  timeoutHeight,
  timeoutTimestamp,
  fee,
  memo,
}: SendIbcTokensArgs) => {
  const { signingClients } = useGrazStore.getState();
  if (!signingClients?.stargate) {
    throw new Error("Stargate signing client is not ready");
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
};

export interface InstantiateContractArgs<Message extends Record<string, unknown>> {
  msg: Message;
  label: string;
  fee: StdFee | "auto" | number;
  options?: InstantiateOptions;
  senderAddress: string;
  codeId: number;
}

export type InstantiateContractMutationArgs<Message extends Record<string, unknown>> = Omit<
  InstantiateContractArgs<Message>,
  "codeId" | "senderAddress" | "fee"
> & {
  fee?: StdFee | "auto" | number;
};

export const instantiateContract = async <Message extends Record<string, unknown>>({
  senderAddress,
  msg,
  fee,
  options,
  label,
  codeId,
}: InstantiateContractArgs<Message>) => {
  const { signingClients } = useGrazStore.getState();

  if (!signingClients?.cosmWasm) {
    throw new Error("CosmWasm signing client is not ready");
  }

  return signingClients.cosmWasm.instantiate(senderAddress, codeId, msg, label, fee, options);
};

export interface ExecuteContractArgs<Message extends Record<string, unknown>> {
  msg: Message;
  fee: StdFee | "auto" | number;
  senderAddress: string;
  contractAddress: string;
  funds: Coin[];
}

export type ExecuteContractMutationArgs<Message extends Record<string, unknown>> = Omit<
  ExecuteContractArgs<Message>,
  "contractAddress" | "senderAddress" | "fee"
> & {
  fee?: StdFee | "auto" | number;
};

export const executeContract = async <Message extends Record<string, unknown>>({
  senderAddress,
  msg,
  fee,
  contractAddress,
  funds,
}: ExecuteContractArgs<Message>) => {
  const { signingClients } = useGrazStore.getState();

  if (!signingClients?.cosmWasm) {
    throw new Error("CosmWasm signing client is not ready");
  }

  return signingClients.cosmWasm.execute(senderAddress, contractAddress, msg, fee, funds);
};

export const getQuerySmart = async <TData>(address: string, queryMsg: Record<string, unknown>): Promise<TData> => {
  const { signingClients } = useGrazStore.getState();

  if (!signingClients?.cosmWasm) {
    throw new Error("CosmWasm signing client is not ready");
  }

  const result = (await signingClients.cosmWasm.queryContractSmart(address, queryMsg)) as TData;
  return result;
};

export const getQueryRaw = (address: string, keyStr: string): Promise<Uint8Array | null> => {
  const { signingClients } = useGrazStore.getState();

  if (!signingClients?.cosmWasm) {
    throw new Error("CosmWasm signing client is not ready");
  }

  const key = new TextEncoder().encode(keyStr);
  return signingClients.cosmWasm.queryContractRaw(address, key);
};
