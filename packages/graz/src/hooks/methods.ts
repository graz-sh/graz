import type { ExecuteResult, InstantiateResult } from "@cosmjs/cosmwasm-stargate";
import type { StdSignature } from "@cosmjs/amino";
import type { DeliverTxResponse } from "@cosmjs/stargate";
import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  ExecuteContractMutationArgs,
  InstantiateContractMutationArgs,
  SendIbcTokensArgs,
  SignArbitraryArgs,
  SignAndBroadcastArgs,
  SendTokensArgs,
  VerifyArbitraryArgs,
} from "../actions/methods";
import {
  executeContract,
  getQueryRaw,
  getQuerySmart,
  instantiateContract,
  sendIbcTokens,
  signArbitrary,
  signAndBroadcast,
  sendTokens,
  verifyArbitrary,
} from "../actions/methods";
import type { MutationEventArgs } from "../types/hooks";
import { LogCategory } from "../types/logger";
import { getLogger } from "../utils/logger";
import { useCosmWasmClient } from "./clients";

/**
 * graz mutation hook to sign arbitrary data using the active wallet.
 *
 * @see {@link signArbitrary}
 */
export const useSignArbitrary = ({
  onError,
  onLoading,
  onSuccess,
}: MutationEventArgs<SignArbitraryArgs, StdSignature> = {}) => {
  const { mutate, mutateAsync, ...mutation } = useMutation({
    mutationKey: ["USE_SIGN_ARBITRARY", onError, onLoading, onSuccess],
    mutationFn: signArbitrary,
    onError: (err, data) => Promise.resolve(onError?.(err, data)),
    onMutate: onLoading,
    onSuccess: (signature) => Promise.resolve(onSuccess?.(signature)),
  });

  return {
    ...mutation,
    signArbitrary: mutate,
    signArbitraryAsync: mutateAsync,
  };
};

/**
 * graz mutation hook to verify arbitrary data using the active wallet.
 *
 * @see {@link verifyArbitrary}
 */
export const useVerifyArbitrary = ({
  onError,
  onLoading,
  onSuccess,
}: MutationEventArgs<VerifyArbitraryArgs, boolean> = {}) => {
  const { mutate, mutateAsync, ...mutation } = useMutation({
    mutationKey: ["USE_VERIFY_ARBITRARY", onError, onLoading, onSuccess],
    mutationFn: verifyArbitrary,
    onError: (err, data) => Promise.resolve(onError?.(err, data)),
    onMutate: onLoading,
    onSuccess: (verified) => Promise.resolve(onSuccess?.(verified)),
  });

  return {
    ...mutation,
    verifyArbitrary: mutate,
    verifyArbitraryAsync: mutateAsync,
  };
};

/**
 * graz mutation hook to sign and broadcast arbitrary encoded messages.
 *
 * @see {@link signAndBroadcast}
 */
export const useSignAndBroadcast = ({
  onError,
  onLoading,
  onSuccess,
}: MutationEventArgs<SignAndBroadcastArgs, DeliverTxResponse> = {}) => {
  const logger = getLogger();
  const { mutate, mutateAsync, ...mutation } = useMutation({
    mutationKey: ["USE_SIGN_AND_BROADCAST"],
    mutationFn: signAndBroadcast,
    onError: (err, data) => {
      logger.error(LogCategory.TRANSACTION, "useSignAndBroadcast mutation failed", {
        hook: "useSignAndBroadcast",
        error: err instanceof Error ? err.message : String(err),
        messageCount: data?.messages?.length ?? 0,
      });
      return Promise.resolve(onError?.(err, data));
    },
    onMutate: onLoading,
    onSuccess: (txResponse) => {
      logger.info(LogCategory.TRANSACTION, "useSignAndBroadcast mutation successful", {
        hook: "useSignAndBroadcast",
        txHash: txResponse.transactionHash,
      });
      return Promise.resolve(onSuccess?.(txResponse));
    },
  });

  return {
    ...mutation,
    signAndBroadcast: mutate,
    signAndBroadcastAsync: mutateAsync,
  };
};

/**
 * graz mutation hook to send tokens.
 *
 * @example
 * ```ts
 * import { useSendTokens, useStargateSigningClient, useAccount } from "graz";
 *
 * // Get the account and signing client
 * const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
 * const { data: signingClients } = useStargateSigningClient({ chainId: ["cosmoshub-4"] });
 *
 * const account = accounts?.["cosmoshub-4"];
 * const signingClient = signingClients?.["cosmoshub-4"];
 *
 * const { sendTokens } = useSendTokens();
 *
 * sendTokens({
 *    signingClient,
 *    senderAddress: account.bech32Address,
 *    recipientAddress: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
 *    amount: [coin],
 *    fee: "auto"
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
  const logger = getLogger();
  const { mutate, mutateAsync, ...mutation } = useMutation({
    mutationKey: ["USE_SEND_TOKENS", onError, onLoading, onSuccess],
    mutationFn: sendTokens,
    onError: (err, data) => {
      logger.error(LogCategory.TRANSACTION, "useSendTokens mutation failed", {
        hook: "useSendTokens",
        error: err instanceof Error ? err.message : String(err),
        recipientAddress: data.recipientAddress,
      });
      return Promise.resolve(onError?.(err, data));
    },
    onMutate: onLoading,
    onSuccess: (txResponse) => {
      logger.info(LogCategory.TRANSACTION, "useSendTokens mutation successful", {
        hook: "useSendTokens",
        txHash: txResponse.transactionHash,
      });
      return Promise.resolve(onSuccess?.(txResponse));
    },
  });

  return {
    ...mutation,
    sendTokens: mutate,
    sendTokensAsync: mutateAsync,
  };
};
/**
 * graz mutation hook to send IBC tokens.
 *
 * @example
 * ```ts
 * import { useSendIbcTokens, useStargateSigningClient, useAccount } from "graz";
 *
 * // Get the account and signing client
 * const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
 * const { data: signingClients } = useStargateSigningClient({ chainId: ["cosmoshub-4"] });
 *
 * const account = accounts?.["cosmoshub-4"];
 * const signingClient = signingClients?.["cosmoshub-4"];
 *
 * const { sendIbcTokens } = useSendIbcTokens();
 *
 * sendIbcTokens({
 *    signingClient,
 *    senderAddress: account.bech32Address,
 *    recipientAddress: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
 *    transferAmount: coin,
 *    fee: "auto"
 * })
 * ```
 */
export const useSendIbcTokens = ({
  onError,
  onLoading,
  onSuccess,
}: MutationEventArgs<SendIbcTokensArgs, DeliverTxResponse> = {}) => {
  const logger = getLogger();
  const { mutate, mutateAsync, ...mutation } = useMutation({
    mutationKey: ["USE_SEND_IBC_TOKENS", onError, onLoading, onSuccess],
    mutationFn: sendIbcTokens,
    onError: (err, data) => {
      logger.error(LogCategory.TRANSACTION, "useSendIbcTokens mutation failed", {
        error: err instanceof Error ? err.message : String(err),
        sourceChannel: data.sourceChannel,
      });
      return Promise.resolve(onError?.(err, data));
    },
    onMutate: onLoading,
    onSuccess: (txResponse) => {
      logger.info(LogCategory.TRANSACTION, "useSendIbcTokens mutation successful", {
        hook: "useSendIbcTokens",
        txHash: txResponse.transactionHash,
      });
      return Promise.resolve(onSuccess?.(txResponse));
    },
  });

  return {
    ...mutation,
    sendIbcTokens: mutate,
    sendIbcTokensAsync: mutateAsync,
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
 * import { useInstantiateContract, useCosmWasmSigningClient, useAccount } from "graz"
 *
 * // Get the account and signing client
 * const { data: accounts } = useAccount({ chainId: ["juno-1"] });
 * const { data: signingClients } = useCosmWasmSigningClient({ chainId: ["juno-1"] });
 *
 * const account = accounts?.["juno-1"];
 * const signingClient = signingClients?.["juno-1"];
 *
 * const { instantiateContract: instantiateMyContract } = useInstantiateContract({
 *   codeId: 4,
 *   onSuccess: ({ contractAddress }) => console.log('Address:', contractAddress)
 * })
 *
 * const instantiateMessage = { foo: 'bar' };
 * instantiateMyContract({
 *  signingClient,
 *  senderAddress: account.bech32Address,
 *  msg: instantiateMessage,
 *  label: "test",
 *  fee: "auto"
 * });
 * ```
 */
export const useInstantiateContract = <Message extends Record<string, unknown>>({
  codeId,
  onError,
  onLoading,
  onSuccess,
}: UseInstantiateContractArgs<Message>) => {
  const logger = getLogger();
  const mutationFn = (args: InstantiateContractMutationArgs<Message>) => {
    return instantiateContract({
      ...args,
      fee: args.fee ?? "auto",
      codeId,
    });
  };

  const { mutate, mutateAsync, ...mutation } = useMutation({
    mutationKey: ["USE_INSTANTIATE_CONTRACT", onError, onLoading, onSuccess, codeId],
    mutationFn,
    onError: (err, data) => {
      logger.error(LogCategory.TRANSACTION, "useInstantiateContract mutation failed", {
        error: err instanceof Error ? err.message : String(err),
        codeId,
      });
      return Promise.resolve(onError?.(err, data));
    },
    onMutate: onLoading,
    onSuccess: (instantiateResult) => {
      logger.info(LogCategory.TRANSACTION, "useInstantiateContract mutation successful", {
        hook: "useInstantiateContract",
        contractAddress: instantiateResult.contractAddress,
        txHash: instantiateResult.transactionHash,
      });
      return Promise.resolve(onSuccess?.(instantiateResult));
    },
  });

  return {
    ...mutation,
    instantiateContract: mutate,
    instantiateContractAsync: mutateAsync,
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
 * import { useExecuteContract, useCosmWasmSigningClient, useAccount } from "graz"
 *
 * interface ExecuteMessage {
 *   foo: string;
 * }
 *
 * const contractAddress = "juno1...";
 *
 * // Get the account and signing client
 * const { data: accounts } = useAccount({ chainId: ["juno-1"] });
 * const { data: signingClients } = useCosmWasmSigningClient({ chainId: ["juno-1"] });
 *
 * const account = accounts?.["juno-1"];
 * const signingClient = signingClients?.["juno-1"];
 *
 * const { executeContract } = useExecuteContract<ExecuteMessage>({
 *   contractAddress,
 *   onSuccess: (result) => console.log('Tx hash:', result.transactionHash)
 * });
 *
 * executeContract({
 *  signingClient,
 *  senderAddress: account.bech32Address,
 *  msg: { foo: "bar" },
 *  fee: "auto",
 *  funds: []
 * });
 * ```
 */
export const useExecuteContract = <Message extends Record<string, unknown>>({
  contractAddress,
  onError,
  onLoading,
  onSuccess,
}: UseExecuteContractArgs<Message>) => {
  const logger = getLogger();
  const mutationFn = (args: ExecuteContractMutationArgs<Message>) => {
    return executeContract({
      ...args,
      fee: args.fee ?? "auto",
      contractAddress,
      memo: args.memo ?? "",
      funds: args.funds ?? [],
    });
  };

  const { mutate, mutateAsync, ...mutation } = useMutation({
    mutationKey: ["USE_EXECUTE_CONTRACT", onError, onLoading, onSuccess, contractAddress],
    mutationFn,
    onError: (err, data) => {
      logger.error(LogCategory.TRANSACTION, "useExecuteContract mutation failed", {
        hook: "useExecuteContract",
        error: err instanceof Error ? err.message : String(err),
        contractAddress,
      });
      return Promise.resolve(onError?.(err, data));
    },
    onMutate: onLoading,
    onSuccess: (executeResult) => {
      logger.info(LogCategory.TRANSACTION, "useExecuteContract mutation successful", {
        hook: "useExecuteContract",
        txHash: executeResult.transactionHash,
        contractAddress,
      });
      return Promise.resolve(onSuccess?.(executeResult));
    },
  });

  return {
    ...mutation,
    executeContract: mutate,
    executeContractAsync: mutateAsync,
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
  const { data: clients } = useCosmWasmClient();
  const client = clients && Object.values(clients)[0];
  const query: UseQueryResult<TData, TError> = useQuery<TData, TError>({
    queryKey: ["USE_QUERY_SMART", args?.address, args?.queryMsg, client],
    queryFn: () => {
      if (!args?.address || !args.queryMsg) throw new Error("address or queryMsg undefined");
      return getQuerySmart<TData>(args.address, args.queryMsg, client);
    },
    enabled: Boolean(args?.address) && Boolean(args?.queryMsg) && Boolean(client),
  });

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
  const { data: clients } = useCosmWasmClient();
  const client = clients && Object.values(clients)[0];
  const queryKey = ["USE_QUERY_RAW", args?.key, args?.address, client];
  const query: UseQueryResult<Uint8Array | null, TError> = useQuery({
    queryKey,
    queryFn: ({ queryKey: [, _address] }) => {
      if (!args?.address || !args.key) throw new Error("address or key undefined");
      return getQueryRaw(args.address, args.key, client);
    },
    enabled: Boolean(args?.address) && Boolean(args?.key) && Boolean(client),
  });

  return query;
};
