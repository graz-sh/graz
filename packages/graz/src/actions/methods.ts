import type { InstantiateOptions } from "@cosmjs/cosmwasm-stargate";
import type { Coin, EncodeObject } from "@cosmjs/proto-signing";
import type { DeliverTxResponse, StdFee } from "@cosmjs/stargate";
import type { Height } from "cosmjs-types/ibc/core/client/v1/client";

import { useGrazInternalStore, useGrazSessionStore } from "../store";

export const getBalances = async (bech32Address: string): Promise<Coin[]> => {
  const { activeChain, signingClients } = useGrazSessionStore.getState();

  if (!activeChain || !signingClients) {
    throw new Error("No connected account detected");
  }

  const { defaultSigningClient } = useGrazInternalStore.getState();
  const balances = await Promise.all(
    activeChain.currencies.map(async (item) => {
      const isCw20 = item.coinMinimalDenom.startsWith("cw20:");
      return signingClients[defaultSigningClient].getBalance(
        bech32Address,
        isCw20 ? item.coinMinimalDenom.replace("cw20:", "") : item.coinMinimalDenom,
      );
    }),
  );

  return balances;
};

export const getBalanceStaked = async (bech32Address: string): Promise<Coin | null> => {
  const { clients } = useGrazSessionStore.getState();
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
  const { defaultSigningClient } = useGrazInternalStore.getState();
  const { signingClients } = useGrazSessionStore.getState();
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
  const { signingClients } = useGrazSessionStore.getState();
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

// https://cosmos.github.io/cosmjs/latest/stargate/classes/SigningStargateClient.html#signAndBroadcast
export interface SignAndBroadcastArgs {
  signerAddress?: string;
  messages: readonly EncodeObject[];
  fee: number | StdFee | "auto";
  memo?: string;
}

export const SignAndBroadcast = async ({ signerAddress, messages, fee, memo }: SignAndBroadcastArgs) => {
  const { signingClients, defaultSigningClient } = useGrazStore.getState();
  if (!signingClients) {
    throw new Error("No connected account detected");
  }
  if (!signerAddress) {
    throw new Error("signerAddress is not defined");
  }
  return signingClients[defaultSigningClient].signAndBroadcast(signerAddress, messages, fee, memo);
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
  const { signingClients } = useGrazSessionStore.getState();

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
  memo: string;
}

export type ExecuteContractMutationArgs<Message extends Record<string, unknown>> = Omit<
  ExecuteContractArgs<Message>,
  "contractAddress" | "senderAddress" | "fee" | "funds" | "memo"
> & {
  fee?: StdFee | "auto" | number;
  funds?: Coin[];
  memo?: string;
};

export const executeContract = async <Message extends Record<string, unknown>>({
  senderAddress,
  msg,
  fee,
  contractAddress,
  funds,
  memo,
}: ExecuteContractArgs<Message>) => {
  const { signingClients } = useGrazSessionStore.getState();

  if (!signingClients?.cosmWasm) {
    throw new Error("CosmWasm signing client is not ready");
  }

  return signingClients.cosmWasm.execute(senderAddress, contractAddress, msg, fee, memo, funds);
};

export const getQuerySmart = async <TData>(address: string, queryMsg: Record<string, unknown>): Promise<TData> => {
  const { clients } = useGrazSessionStore.getState();

  if (!clients?.cosmWasm) {
    throw new Error("CosmWasm client is not ready");
  }

  const result = (await clients.cosmWasm.queryContractSmart(address, queryMsg)) as TData;
  return result;
};

export const getQueryRaw = (address: string, keyStr: string): Promise<Uint8Array | null> => {
  const { clients } = useGrazSessionStore.getState();

  if (!clients?.cosmWasm) {
    throw new Error("CosmWasm client is not ready");
  }

  const key = new TextEncoder().encode(keyStr);
  return clients.cosmWasm.queryContractRaw(address, key);
};
