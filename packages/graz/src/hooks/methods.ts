import { fromBech32, toBech32 } from "@cosmjs/encoding";
import type { Coin, DeliverTxResponse } from "@cosmjs/stargate";
import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import type { ConnectClient, ConnectSigningClientArgs, SigningClients } from "../actions/clients";
import type { SendTokensArgs } from "../actions/methods";
import { getBalances, getBalanceStaked, sendTokens } from "../actions/methods";
import { useGrazInternalStore } from "../store";
import type { ChainIdArgs, HookResultDataWithChainId } from "../types/data";
import type { MutationEventArgs } from "../types/hooks";
import { useConnectClient, useConnectSigningClient } from "./clients";

/**
 * graz query hook to retrieve list of balances from current account or given address.
 *
 * @param bech32Address - Optional bech32 account address, defaults to connected account address
 *
 * @example
 * ```ts
 * import { useBalances } from "graz";
 *
 * // basic example
 * const { data, isFetching, refetch, ... } = useBalances();
 *
 * // with custom bech32 address
 * useBalances("cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu");
 * ```
 */
export const useBalances = <T extends "cosmWasm" | "stargate", U extends ChainIdArgs>(
  args: {
    bech32Address?: string;
    client?: T;
  } & U,
) => {
  const _client = (args.client ?? useGrazInternalStore.getState().defaultClient) as T;
  const _chains = useGrazInternalStore.getState().chains;

  const { data: singleClient } = useConnectClient({
    client: _client,
    chainId: args.chainId!,
    enabled: Boolean(args.chainId),
  });

  const { data: multiClient } = useConnectClient({
    client: _client,
    enabled: !args.chainId,
  });

  const query = useQuery(
    [
      "USE_BALANCES",
      {
        singleClient,
        multiClient,
        ...args,
        _chains,
      },
    ],
    async () => {
      if (args.chainId && singleClient) {
        const singleChain = _chains?.find((i) => i.chainId === args.chainId);
        const res = await getBalances({
          client: singleClient as unknown as ConnectClient<T>,
          bech32Address: toBech32(singleChain!.bech32Config.bech32PrefixAccAddr, fromBech32(args.bech32Address!).data),
          currencies: singleChain!.currencies,
        });
        return res;
      }
      if (!args.chainId && multiClient) {
        const multiChain = Object.entries(multiClient);
        const res: Record<string, Coin[]> = {};
        await Promise.all(
          multiChain.map(async ([chainId, client]) => {
            const chain = _chains?.find((i) => i.chainId === chainId);
            if (!chain) return;
            const _res = await getBalances({
              client: client as unknown as ConnectClient<T>,
              bech32Address: toBech32(chain.bech32Config.bech32PrefixAccAddr, fromBech32(args.bech32Address!).data),
              currencies: chain.currencies,
            });
            res[chainId] = _res;
          }),
        );
        return res;
      }
      return undefined;
    },
    {
      enabled: Boolean(args.bech32Address) && Boolean(_chains) && (Boolean(singleClient) || Boolean(multiClient)),
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  );

  return query as UseQueryResult<HookResultDataWithChainId<Coin[], U>>;
};

/**
 * graz query hook to retrieve list of staked balances from current account or given address.
 *
 * @param bech32Address - Optional bech32 account address, defaults to connected account address
 *
 * @example
 * ```ts
 * import { useBalanceStaked } from "graz";
 *
 * // basic example
 * const { data, isFetching, refetch, ... } = useBalanceStaked();
 *
 * // with custom bech32 address
 * useBalanceStaked("cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu");
 * ```
 */
export const useBalanceStaked = <T extends "stargate", U extends ChainIdArgs>(
  args: {
    bech32Address?: string;
    client?: T;
  } & U,
) => {
  const _chains = useGrazInternalStore.getState().chains;

  const { data: singleClient } = useConnectClient({
    client: "stargate",
    chainId: args.chainId!,
    enabled: Boolean(args.chainId),
  });

  const { data: multiClient } = useConnectClient({
    client: "stargate",
    enabled: !args.chainId,
  });

  const query = useQuery(
    [
      "USE_BALANCE_STAKED",
      {
        singleClient,
        multiClient,
        ...args,
        _chains,
      },
    ],
    async () => {
      if (args.chainId && singleClient) {
        const singleChain = _chains?.find((i) => i.chainId === args.chainId);
        if (!singleChain) throw new Error(`${args.chainId} Chain not found`);
        const res = await getBalanceStaked({
          client: singleClient,
          bech32Address: toBech32(singleChain.bech32Config.bech32PrefixAccAddr, fromBech32(args.bech32Address!).data),
        });
        return res;
      }
      if (!args.chainId && multiClient) {
        const multiChain = Object.entries(multiClient);
        const res: Record<string, Coin | null> = {};
        await Promise.all(
          multiChain.map(async ([chainId, client]) => {
            const chain = _chains?.find((i) => i.chainId === chainId);
            if (!chain) return;
            const _res = await getBalanceStaked({
              client,
              bech32Address: toBech32(chain.bech32Config.bech32PrefixAccAddr, fromBech32(args.bech32Address!).data),
            });
            res[chainId] = _res;
          }),
        );
        return res;
      }
      return undefined;
    },
    {
      enabled: Boolean(args.bech32Address) && Boolean(_chains) && (Boolean(singleClient) || Boolean(multiClient)),
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  );

  return query as UseQueryResult<HookResultDataWithChainId<Coin | null, U>>;
};

// /**
//  * graz mutation hook to send tokens. Note: if `senderAddress` undefined, it will use current connected account address.
//  *
//  * @example
//  * ```ts
//  * import { useSendTokens } from "graz";
//  *
//  * // basic example
//  * const { sendTokens } = useSendTokens();
//  *
//  * sendTokens({
//  *    recipientAddress: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430";
//  *    amount: [coin];
//  *    ...
//  * })
//  * ```
//  *
//  * @see {@link sendTokens}
//  */
export const useSendTokens = <T extends SigningClients>({
  signingClient,
  signingClientOptions,
  chainId,
  onError,
  onLoading,
  onSuccess,
}: MutationEventArgs<SendTokensArgs<T>, DeliverTxResponse> & {
  signingClient?: T;
  signingClientOptions?: ConnectSigningClientArgs<T>["options"];
  chainId: string;
}) => {
  const _client = (signingClient ?? useGrazInternalStore.getState().defaultSigningClient) as T;

  const { data: _signingClient } = useConnectSigningClient({
    chainId,
    client: _client,
    options: signingClientOptions,
  });

  const queryKey = ["USE_SEND_TOKENS", { onError, onLoading, onSuccess, chainId }];
  const mutation = useMutation(
    queryKey,
    async (args: Omit<SendTokensArgs<T>, "signingClient">) => {
      if (!_signingClient) throw new Error("Signing client is not available");
      const res = await sendTokens({ signingClient: _signingClient, ...args });
      return res;
    },
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
// /**
//  * graz mutation hook to send IBC tokens. Note: if `senderAddress` undefined, it will use current connected account address.
//  *
//  *
//  * @example
//  * ```ts
//  * import { useSendIbcTokens } from "graz";
//  *
//  * // basic example
//  * const { sendIbcTokens } = useSendIbcTokens();
//  *
//  * sendIbcTokens({
//  *    recipientAddress: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
//  *    transferAmount: coin,
//  *    ...
//  * })
//  * ```
//  */
// export const useSendIbcTokens = ({
//   onError,
//   onLoading,
//   onSuccess,
// }: MutationEventArgs<SendIbcTokensArgs, DeliverTxResponse> = {}) => {
//   const { data: account } = useAccount();
//   const accountAddress = account?.bech32Address;

//   const queryKey = ["USE_SEND_IBC_TOKENS", onError, onLoading, onSuccess, accountAddress];
//   const mutation = useMutation(
//     queryKey,
//     (args: SendIbcTokensArgs) => sendIbcTokens({ senderAddress: accountAddress, ...args }),
//     {
//       onError: (err, data) => Promise.resolve(onError?.(err, data)),
//       onMutate: onLoading,
//       onSuccess: (txResponse) => Promise.resolve(onSuccess?.(txResponse)),
//     },
//   );

//   return {
//     error: mutation.error,
//     isLoading: mutation.isLoading,
//     isSuccess: mutation.isSuccess,
//     sendIbcTokens: mutation.mutate,
//     sendIbcTokensAsync: mutation.mutateAsync,
//     status: mutation.status,
//   };
// };

// export type UseInstantiateContractArgs<Message extends Record<string, unknown>> = {
//   codeId: number;
// } & MutationEventArgs<InstantiateContractMutationArgs<Message>, InstantiateResult>;

// /**
//  * graz mutation hook to instantiate a CosmWasm smart contract when supported.
//  *
//  * @example
//  * ```ts
//  * import { useInstantiateContract } from "graz"
//  *
//  * const { instantiateContract: instantiateMyContract } = useInstantiateContract({
//  *   codeId: 4,
//  *   onSuccess: ({ contractAddress }) => console.log('Address:', contractAddress)
//  * })
//  *
//  * const instantiateMessage = { foo: 'bar' };
//  * instantiateMyContract({
//  *  msg: instatiateMessage,
//  *  label: "test"
//  * });
//  * ```
//  */
// export const useInstantiateContract = <Message extends Record<string, unknown>>({
//   codeId,
//   onError,
//   onLoading,
//   onSuccess,
// }: UseInstantiateContractArgs<Message>) => {
//   const { data: account } = useAccount();
//   const accountAddress = account?.bech32Address;

//   const mutationFn = (args: InstantiateContractMutationArgs<Message>) => {
//     if (!accountAddress) throw new Error("senderAddress is undefined");
//     const contractArgs: InstantiateContractArgs<Message> = {
//       ...args,
//       fee: args.fee ?? "auto",
//       senderAddress: accountAddress,
//       codeId,
//     };

//     return instantiateContract(contractArgs);
//   };

//   const queryKey = ["USE_INSTANTIATE_CONTRACT", onError, onLoading, onSuccess, codeId, accountAddress];
//   const mutation = useMutation(queryKey, mutationFn, {
//     onError: (err, data) => Promise.resolve(onError?.(err, data)),
//     onMutate: onLoading,
//     onSuccess: (instantiateResult) => Promise.resolve(onSuccess?.(instantiateResult)),
//   });

//   return {
//     error: mutation.error,
//     isLoading: mutation.isLoading,
//     isSuccess: mutation.isSuccess,
//     instantiateContract: mutation.mutate,
//     instantiateContractAsync: mutation.mutateAsync,
//     status: mutation.status,
//   };
// };

// export type UseExecuteContractArgs<Message extends Record<string, unknown>> = {
//   contractAddress: string;
// } & MutationEventArgs<ExecuteContractMutationArgs<Message>, ExecuteResult>;

// /**
//  * graz mutation hook for executing transactions against a CosmWasm smart
//  * contract.
//  *
//  * @example
//  * ```ts
//  * import { useExecuteContract } from "graz"
//  *
//  * interface GreetMessage {
//  *   name: string;
//  * }
//  *
//  * interface GreetResponse {
//  *   message: string;
//  * }
//  *
//  * const contractAddress = "cosmosfoobarbaz";
//  * const { executeContract } = useExecuteContract<ExecuteMessage>({ contractAddress });
//  * executeContract({ msg: {
//  *   foo: "bar"
//  * }}, {
//  *   onSuccess: (data: GreetResponse) => console.log('Got message:', data.message);
//  * });
//  * ```
//  */
// export const useExecuteContract = <Message extends Record<string, unknown>>({
//   contractAddress,
//   onError,
//   onLoading,
//   onSuccess,
// }: UseExecuteContractArgs<Message>) => {
//   const { data: account } = useAccount();
//   const accountAddress = account?.bech32Address;

//   const mutationFn = (args: ExecuteContractMutationArgs<Message>) => {
//     if (!accountAddress) throw new Error("senderAddress is undefined");
//     const executeArgs: ExecuteContractArgs<Message> = {
//       ...args,
//       fee: args.fee ?? "auto",
//       senderAddress: accountAddress,
//       contractAddress,
//       memo: args.memo ?? "",
//       funds: args.funds ?? [],
//     };

//     return executeContract(executeArgs);
//   };

//   const queryKey = ["USE_EXECUTE_CONTRACT", onError, onLoading, onSuccess, contractAddress, accountAddress];
//   const mutation = useMutation(queryKey, mutationFn, {
//     onError: (err, data) => Promise.resolve(onError?.(err, data)),
//     onMutate: onLoading,
//     onSuccess: (executeResult) => Promise.resolve(onSuccess?.(executeResult)),
//   });

//   return {
//     error: mutation.error,
//     isLoading: mutation.isLoading,
//     isSuccess: mutation.isSuccess,
//     executeContract: mutation.mutate,
//     executeContractAsync: mutation.mutateAsync,
//     status: mutation.status,
//   };
// };

// /**
//  * graz query hook for dispatching a "smart" query to a CosmWasm smart
//  * contract.
//  *
//  * @param address - The address of the contract to query
//  * @param queryMsg - The query message to send to the contract
//  * @returns A query result with the result returned by the smart contract.
//  */
// export const useQuerySmart = <TData, TError>(
//   address?: string,
//   queryMsg?: Record<string, unknown>,
// ): UseQueryResult<TData, TError> => {
//   const queryKey = ["USE_QUERY_SMART", address, queryMsg] as const;
//   const query: UseQueryResult<TData, TError> = useQuery(
//     queryKey,
//     ({ queryKey: [, _address] }) => {
//       if (!address || !queryMsg) throw new Error("address or queryMsg undefined");
//       return getQuerySmart(address, queryMsg);
//     },
//     {
//       enabled: Boolean(address) && Boolean(queryMsg),
//     },
//   );

//   return query;
// };

// /**
//  * graz query hook for dispatching a "raw" query to a CosmWasm smart contract.
//  *
//  * @param address - The address of the contract to query
//  * @param key - The key to lookup in the contract storage
//  * @returns A query result with raw byte array stored at the key queried.
//  */
// export const useQueryRaw = <TError>(address?: string, key?: string): UseQueryResult<Uint8Array | null, TError> => {
//   const queryKey = ["USE_QUERY_RAW", key, address] as const;
//   const query: UseQueryResult<Uint8Array | null, TError> = useQuery(
//     queryKey,
//     ({ queryKey: [, _address] }) => {
//       if (!address || !key) throw new Error("address or key undefined");
//       return getQueryRaw(address, key);
//     },
//     {
//       enabled: Boolean(address) && Boolean(key),
//     },
//   );

//   return query;
// };
