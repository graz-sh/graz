import type { ExecuteResult, InstantiateResult } from "@cosmjs/cosmwasm-stargate";
import type { DeliverTxResponse } from "@cosmjs/stargate";
import type { QueryKey, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
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

/**
 * graz mutation hook to send tokens. Note: if `senderAddress` undefined, it will use current connected account address.
 *
 * @example
 * ```ts
 * import { useSendTokens } from "graz";
 *
 * // basic example
 * const { sendTokens } = useSendTokens();
 *
 * sendTokens({
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

  const queryKey = ["USE_SEND_TOKENS", onError, onLoading, onSuccess, accountAddress];
  const mutation = useMutation(
    queryKey,
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
 * import { useSendIbcTokens } from "graz";
 *
 * // basic example
 * const { sendIbcTokens } = useSendIbcTokens();
 *
 * sendIbcTokens({
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

  const queryKey = ["USE_SEND_IBC_TOKENS", onError, onLoading, onSuccess, accountAddress];
  const mutation = useMutation(
    queryKey,
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

export const useInstantiateContract = <Message extends Record<string, unknown>>({
  codeId,
  onError,
  onLoading,
  onSuccess,
}: UseInstantiateContractArgs<Message>) => {
  const { data: account } = useAccount();
  const accountAddress = account?.bech32Address;

  const mutationFn = (args: InstantiateContractMutationArgs<Message>) => {
    const contractArgs: InstantiateContractArgs<Message> = {
      ...args,
      fee: args.fee ?? "auto",
      senderAddress: accountAddress,
      codeId,
    };

    return instantiateContract(contractArgs);
  };

  const queryKey = ["USE_INSTANTIATE_CONTRACT", onError, onLoading, onSuccess, codeId];
  const mutation = useMutation(queryKey, mutationFn, {
    onError: (err, data) => Promise.resolve(onError?.(err, data)),
    onMutate: onLoading,
    onSuccess: (txResponse) => Promise.resolve(onSuccess?.(txResponse)),
  });

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

export const useExecuteContract = <Message extends Record<string, unknown>>({
  contractAddress,
  onError,
  onLoading,
  onSuccess,
}: UseExecuteContractArgs<Message>) => {
  const { data: account } = useAccount();
  const accountAddress = account?.bech32Address;

  const mutationFn = (args: ExecuteContractMutationArgs<Message>) => {
    const executeArgs: ExecuteContractArgs<Message> = {
      ...args,
      fee: args.fee ?? "auto",
      senderAddress: accountAddress,
      contractAddress,
    };

    return executeContract(executeArgs);
  };

  const queryKey = ["USE_EXECUTE_CONTRACT", onError, onLoading, onSuccess, contractAddress];
  const mutation = useMutation(queryKey, mutationFn, {
    onError: (err, data) => Promise.resolve(onError?.(err, data)),
    onMutate: onLoading,
    onSuccess: (txResponse) => Promise.resolve(onSuccess?.(txResponse)),
  });

  return {
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    executeContract: mutation.mutate,
    executeContractAsync: mutation.mutateAsync,
    status: mutation.status,
  };
};

export type QueryOptions<TQueryFnData, TError, TData, TQueryKey extends QueryKey> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  "queryKey" | "queryFn" | "initialData"
> & {
  initialData?: () => undefined;
};

export type QuerySmartKey = readonly ["USE_QUERY_SMART", string, Record<string, unknown>];

export const useQuerySmart = <TQueryFnData, TError, TData>(
  address: string,
  queryMsg: Record<string, unknown>,
  options?: QueryOptions<TQueryFnData, TError, TData, QuerySmartKey>,
): UseQueryResult<TData, TError> => {
  //TODO: error handling and options defaulting

  const queryKey: QuerySmartKey = ["USE_QUERY_SMART", address, queryMsg] as const;
  const query = useQuery(queryKey, ({ queryKey: [, _address] }) => getQuerySmart(address, queryMsg), options);

  return query;
};

export type QueryRawKey = readonly ["USE_QUERY_RAW", string, Uint8Array];

export const useQueryRaw = <TQueryFnData, TError, TData>(
  address: string,
  key: Uint8Array,
  options?: QueryOptions<TQueryFnData, TError, TData, QueryRawKey>,
): UseQueryResult<TData, TError> => {
  //TODO: error handling and options defaulting

  const queryKey: QueryRawKey = ["USE_QUERY_RAW", address, key] as const;
  const query = useQuery(queryKey, ({ queryKey: [, _address] }) => getQueryRaw(address, key), options);

  return query;
};
