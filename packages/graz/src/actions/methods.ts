import { type InstantiateOptions } from "@cosmjs/cosmwasm-stargate";
import type { Coin } from "@cosmjs/proto-signing";
import type { DeliverTxResponse, StdFee } from "@cosmjs/stargate";
import type { AppCurrency } from "@keplr-wallet/types";
import type { Height } from "cosmjs-types/ibc/core/client/v1/client";

import type { ConnectClient, ConnectSigningClient, SigningClients } from "./clients";

export const getBalances = async <T extends "cosmWasm" | "stargate">({
  bech32Address,
  client,
  currencies,
}: {
  currencies: AppCurrency[];
  bech32Address: string;
  client: ConnectClient<T>;
}): Promise<Coin[]> => {
  const balances = await Promise.all(
    currencies
      .filter((i) => !i.coinMinimalDenom.startsWith("cw20:"))
      .map(async (item) => {
        return client.getBalance(bech32Address, item.coinMinimalDenom);
      }),
  );

  return balances;
};

export const getBalanceStaked = async ({
  bech32Address,
  client,
}: {
  bech32Address: string;
  client: ConnectClient<"stargate">;
}): Promise<Coin | null> => {
  return client.getBalanceStaked(bech32Address);
};

// https://cosmos.github.io/cosmjs/latest/stargate/classes/SigningStargateClient.html#sendTokens
export interface SendTokensArgs<T> {
  signingClient: ConnectSigningClient<T>;
  senderAddress: string;
  recipientAddress: string;
  amount: Coin[];
  fee: number | StdFee | "auto";
  memo?: string;
}

export const sendTokens = async <T extends SigningClients>({
  senderAddress,
  recipientAddress,
  amount,
  fee,
  memo,
  signingClient,
}: SendTokensArgs<T>): Promise<DeliverTxResponse> => {
  return signingClient.sendTokens(senderAddress, recipientAddress, amount, fee, memo);
};

// https://cosmos.github.io/cosmjs/latest/stargate/classes/SigningStargateClient.html#sendIbcTokens
export interface SendIbcTokensArgs {
  signingClient: ConnectSigningClient<"stargate">;
  senderAddress: string;
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
  signingClient: ConnectSigningClient<"cosmWasm">;
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
  return signingClient.instantiate(senderAddress, codeId, msg, label, fee, options);
};

export interface ExecuteContractArgs<Message extends Record<string, unknown>> {
  signingClient: ConnectSigningClient<"cosmWasm">;
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
  return signingClient.execute(senderAddress, contractAddress, msg, fee, memo, funds);
};

export const getQuerySmart = async <TData>({
  client,
  address,
  queryMsg,
}: {
  client: ConnectClient<"cosmWasm">;
  address: string;
  queryMsg: Record<string, unknown>;
}): Promise<TData> => {
  const result = (await client.queryContractSmart(address, queryMsg)) as TData;
  return result;
};

export const getQueryRaw = ({
  client,
  address,
  keyStr,
}: {
  client: ConnectClient<"cosmWasm">;
  address: string;
  keyStr: string;
}): Promise<Uint8Array | null> => {
  const key = new TextEncoder().encode(keyStr);
  return client.queryContractRaw(address, key);
};
