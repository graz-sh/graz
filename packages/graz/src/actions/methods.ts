import type { CosmWasmClient, InstantiateOptions, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { Coin } from "@cosmjs/proto-signing";
import type { DeliverTxResponse, SigningStargateClient, StdFee } from "@cosmjs/stargate";
import type { Height } from "cosmjs-types/ibc/core/client/v1/client";

// https://cosmos.github.io/cosmjs/latest/stargate/classes/SigningStargateClient.html#sendTokens
export interface SendTokensArgs {
  signingClient?: SigningStargateClient | SigningCosmWasmClient;
  senderAddress?: string;
  recipientAddress: string;
  amount: Coin[];
  fee: number | StdFee | "auto";
  memo?: string;
}

export const sendTokens = async ({
  signingClient,
  senderAddress,
  recipientAddress,
  amount,
  fee,
  memo,
}: SendTokensArgs): Promise<DeliverTxResponse> => {
  if (!signingClient) {
    throw new Error("No connected account detected");
  }
  if (!senderAddress) {
    throw new Error("senderAddress is not defined");
  }
  return signingClient.sendTokens(senderAddress, recipientAddress, amount, fee, memo);
};

// https://cosmos.github.io/cosmjs/latest/stargate/classes/SigningStargateClient.html#sendIbcTokens
export interface SendIbcTokensArgs {
  signingClient?: SigningStargateClient;
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
  signingClient,
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
  if (!signingClient) {
    throw new Error("Stargate signing client is not ready");
  }
  if (!senderAddress) {
    throw new Error("senderAddress is not defined");
  }
  return signingClient.sendIbcTokens(
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
  signingClient?: SigningCosmWasmClient;
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
  signingClient,
  senderAddress,
  msg,
  fee,
  options,
  label,
  codeId,
}: InstantiateContractArgs<Message>) => {
  if (!signingClient) {
    throw new Error("CosmWasm signing client is not ready");
  }

  return signingClient.instantiate(senderAddress, codeId, msg, label, fee, options);
};

export interface ExecuteContractArgs<Message extends Record<string, unknown>> {
  signingClient?: SigningCosmWasmClient;
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
  signingClient,
  senderAddress,
  msg,
  fee,
  contractAddress,
  funds,
  memo,
}: ExecuteContractArgs<Message>) => {
  if (!signingClient) {
    throw new Error("CosmWasm signing client is not ready");
  }

  return signingClient.execute(senderAddress, contractAddress, msg, fee, memo, funds);
};

export const getQuerySmart = async <TData>(
  address: string,
  queryMsg: Record<string, unknown>,
  client?: CosmWasmClient,
): Promise<TData> => {
  if (!client) {
    throw new Error("CosmWasm client is not ready");
  }

  const result = (await client.queryContractSmart(address, queryMsg)) as TData;
  return result;
};

export const getQueryRaw = (address: string, keyStr: string, client?: CosmWasmClient): Promise<Uint8Array | null> => {
  if (!client) {
    throw new Error("CosmWasm client is not ready");
  }

  const key = new TextEncoder().encode(keyStr);
  return client.queryContractRaw(address, key);
};
