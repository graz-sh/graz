import type { ExecuteResult, InstantiateResult } from "@cosmjs/cosmwasm-stargate";
import type { DeliverTxResponse } from "@cosmjs/stargate";
import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  ExecuteContractArgs,
  ExecuteContractMutationArgs,
  InstantiateContractArgs,
  InstantiateContractMutationArgs,
  SendIbcTokensArgs,
  SendTokensArgs,
} from "../actions/methods";
import {
  executeContract,
  getQueryRaw,
  getQuerySmart,
  instantiateContract,
  sendIbcTokens,
  sendTokens,
} from "../actions/methods";
import type { MutationEventArgs } from "../types/hooks";
import { useAccount } from "./account";
import { useCosmWasmClient } from "./clients";

/**
 * graz mutation hook to send tokens. Note: if `senderAddress` undefined, it will use current connected account address.
 *
 * @example
 * ```ts
 * import { useSendTokens, useStargateSigningClient } from "graz";
 *
 * // basic example
 * const { data: signingClient } = useStargateSigningClient()
 * const { sendTokens } = useSendTokens();
 *
 * sendTokens({
 *    signingClient,
 *    recipientAddress: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430";
 *    amount: [coin];
 *    ...
 * })
 * ```
 *
 * @see {@link sendTokens}
 */
export const useSendTokens = ({
  onError,
  onLoading,
  onSuccess,
}: MutationEventArgs<SendTokensArgs, DeliverTxResponse> = {}) => {
  const { data: account } = useAccount();
  const accountAddress = account?.bech32Address;

  const mutation = useMutation(
    ["USE_SEND_TOKENS", onError, onLoading, onSuccess, accountAddress],
    (args: SendTokensArgs) => sendTokens({ senderAddress: accountAddress, ...args }),
    {
      onError: (err, data) => Promise.resolve(onError?.(err, data)),
      onMutate: onLoading,
      onSuccess: (txResponse) => Promise.resolve(onSuccess?.(txResponse)),
    },
  );

  return {
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    sendTokens: mutation.mutate,
    sendTokensAsync: mutation.mutateAsync,
    status: mutation.status,
  };
};
/**
 * graz mutation hook to send IBC tokens. Note: if `senderAddress` undefined, it will use current connected account address.
 *
 *
 * @example
 * ```ts
 * import { useSendIbcTokens, useStargateSigningClient } from "graz";
 *
 * // basic example
 * const { data: signingClient } = useStargateSigningClient()
 * const { sendIbcTokens } = useSendIbcTokens();
 *
 * sendIbcTokens({
 *    signingClient,
 *    recipientAddress: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
 *    transferAmount: coin,
 *    ...
 * })
 * ```
 */
export const useSendIbcTokens = ({
  onError,
  onLoading,
  onSuccess,
}: MutationEventArgs<SendIbcTokensArgs, DeliverTxResponse> = {}) => {
  const { data: account } = useAccount();
  const accountAddress = account?.bech32Address;

  const mutation = useMutation(
    ["USE_SEND_IBC_TOKENS", onError, onLoading, onSuccess, accountAddress],
    (args: SendIbcTokensArgs) => sendIbcTokens({ senderAddress: accountAddress, ...args }),
    {
      onError: (err, data) => Promise.resolve(onError?.(err, data)),
      onMutate: onLoading,
      onSuccess: (txResponse) => Promise.resolve(onSuccess?.(txResponse)),
    },
  );

  return {
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    sendIbcTokens: mutation.mutate,
    sendIbcTokensAsync: mutation.mutateAsync,
    status: mutation.status,
  };
};

export type UseInstantiateContractArgs<Message extends Record<string, unknown>> = {
  codeId: number;
} & MutationEventArgs<InstantiateContractMutationArgs<Message>, InstantiateResult>;

/**
 * graz mutation hook to instantiate a CosmWasm smart contract when supported.
 *
 * @example
 * ```ts
 * import { useInstantiateContract, useCosmwasmSigningClient } from "graz"
 *
 * const { data: signingClient } = useCosmwasmSigningClient()
 * const { instantiateContract: instantiateMyContract } = useInstantiateContract({
 *   codeId: 4,
 *   onSuccess: ({ contractAddress }) => console.log('Address:', contractAddress)
 * })
 *
 * const instantiateMessage = { foo: 'bar' };
 * instantiateMyContract({
 *  signingClient,
 *  msg: instatiateMessage,
 *  label: "test"
 * });
 * ```
 */
export const useInstantiateContract = <Message extends Record<string, unknown>>({
  codeId,
  onError,
  onLoading,
  onSuccess,
}: UseInstantiateContractArgs<Message>) => {
  const { data: account } = useAccount();
  const accountAddress = account?.bech32Address;

  const mutationFn = (args: InstantiateContractMutationArgs<Message>) => {
    if (!accountAddress) throw new Error("senderAddress is undefined");
    const contractArgs: InstantiateContractArgs<Message> = {
      ...args,
      fee: args.fee ?? "auto",
      senderAddress: accountAddress,
      codeId,
    };

    return instantiateContract(contractArgs);
  };

  const mutation = useMutation(
    ["USE_INSTANTIATE_CONTRACT", onError, onLoading, onSuccess, codeId, accountAddress],
    mutationFn,
    {
      onError: (err, data) => Promise.resolve(onError?.(err, data)),
      onMutate: onLoading,
      onSuccess: (instantiateResult) => Promise.resolve(onSuccess?.(instantiateResult)),
    },
  );

  return {
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    instantiateContract: mutation.mutate,
    instantiateContractAsync: mutation.mutateAsync,
    status: mutation.status,
  };
};

export type UseExecuteContractArgs<Message extends Record<string, unknown>> = {
  contractAddress: string;
} & MutationEventArgs<ExecuteContractMutationArgs<Message>, ExecuteResult>;

/**
 * graz mutation hook for executing transactions against a CosmWasm smart
 * contract.
 *
 * @example
 * ```ts
 * import { useExecuteContract, useCosmWasmSigningClient } from "graz"
 *
 * interface GreetMessage {
 *   name: string;
 * }
 *
 * interface GreetResponse {
 *   message: string;
 * }
 *
 * const contractAddress = "cosmosfoobarbaz";
 *
 * const { data: signingClient } = useCosmWasmSigningClient()
 * const { executeContract } = useExecuteContract<ExecuteMessage>({ contractAddress });
 *
 * executeContract({
 *  signingClient,
 *  msg: {
 *    foo: "bar"
 *  }}, {
 *    onSuccess: (data: GreetResponse) => console.log('Got message:', data.message);
 *  });
 * ```
 */
export const useExecuteContract = <Message extends Record<string, unknown>>({
  contractAddress,
  onError,
  onLoading,
  onSuccess,
}: UseExecuteContractArgs<Message>) => {
  const { data: account } = useAccount();
  const accountAddress = account?.bech32Address;

  const mutationFn = (args: ExecuteContractMutationArgs<Message>) => {
    if (!accountAddress) throw new Error("senderAddress is undefined");
    const executeArgs: ExecuteContractArgs<Message> = {
      ...args,
      fee: args.fee ?? "auto",
      senderAddress: accountAddress,
      contractAddress,
      memo: args.memo ?? "",
      funds: args.funds ?? [],
    };

    return executeContract(executeArgs);
  };

  const mutation = useMutation(
    ["USE_EXECUTE_CONTRACT", onError, onLoading, onSuccess, contractAddress, accountAddress],
    mutationFn,
    {
      onError: (err, data) => Promise.resolve(onError?.(err, data)),
      onMutate: onLoading,
      onSuccess: (executeResult) => Promise.resolve(onSuccess?.(executeResult)),
    },
  );

  return {
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    executeContract: mutation.mutate,
    executeContractAsync: mutation.mutateAsync,
    status: mutation.status,
  };
};

/**
 * graz query hook for dispatching a "smart" query to a CosmWasm smart
 * contract.
 *
 * @param address - The address of the contract to query
 * @param queryMsg - The query message to send to the contract
 * @returns A query result with the result returned by the smart contract.
 */
export const useQuerySmart = <TData, TError>(args?: {
  address?: string;
  queryMsg?: Record<string, unknown>;
}): UseQueryResult<TData, TError> => {
  const { data: client } = useCosmWasmClient();
  const query: UseQueryResult<TData, TError> = useQuery(
    ["USE_QUERY_SMART", args?.address, args?.queryMsg, client],
    ({ queryKey: [, _address] }) => {
      if (!args?.address || !args.queryMsg) throw new Error("address or queryMsg undefined");
      return getQuerySmart(args.address, args.queryMsg, client);
    },
    {
      enabled: Boolean(args?.address) && Boolean(args?.queryMsg) && Boolean(client),
    },
  );

  return query;
};

/**
 * graz query hook for dispatching a "raw" query to a CosmWasm smart contract.
 *
 * @param address - The address of the contract to query
 * @param key - The key to lookup in the contract storage
 * @returns A query result with raw byte array stored at the key queried.
 */
export const useQueryRaw = <TError>(args?: {
  address?: string;
  key?: string;
}): UseQueryResult<Uint8Array | null, TError> => {
  const { data: client } = useCosmWasmClient();
  const queryKey = ["USE_QUERY_RAW", args?.key, args?.address, client] as const;
  const query: UseQueryResult<Uint8Array | null, TError> = useQuery(
    queryKey,
    ({ queryKey: [, _address] }) => {
      if (!args?.address || !args.key) throw new Error("address or key undefined");
      return getQueryRaw(args.address, args.key, client);
    },
    {
      enabled: Boolean(args?.address) && Boolean(args?.key) && Boolean(client),
    },
  );

  return query;
};
