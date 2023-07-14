import type { ExecuteResult, InstantiateResult } from "@cosmjs/cosmwasm-stargate";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import type { Coin, DeliverTxResponse } from "@cosmjs/stargate";
import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import type { ConnectClient, ConnectSigningClientArgs, SigningClients } from "../actions/clients";
import type {
  ExecuteContractMutationArgs,
  InstantiateContractMutationArgs,
  SendIbcTokensArgs,
  SendTokensArgs,
} from "../actions/methods";
import {
  executeContract,
  getAllBalance,
  getBalance,
  getBalanceStaked,
  getQueryRaw,
  getQuerySmart,
  instantiateContract,
  sendIbcTokens,
  sendTokens,
} from "../actions/methods";
import { useGrazInternalStore } from "../store";
import type { ChainIdArgs, HookResultDataWithChainId } from "../types/data";
import type { MutationEventArgs } from "../types/hooks";
import { useAccount } from "./account";
import { useConnectClient, useConnectSigningClient } from "./clients";

/**
 * graz query hook to retrieve balance from given address, denom and chainId
 *
 * @param bech32Address - Optional bech32 address, if not provided will return undefined
 * @param searchDenom - Optional search denom, if not provided will return undefined
 * @param chainId - Required chainId to retrieve the balances from given address
 * @param client - Optional client, if not provided will use the default client
 *
 * @example
 * ```ts
 * import { useBalance } from "graz";
 *
 * const { data, isFetching, refetch, ... } = useBalance({
 *  client: "stargate",
 *  chainId: "cosmoshub-4",
 *  bech32Address: "cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu",
 * })
 *
 * ```
 */
export const useBalance = <T extends "stargate" | "cosmWasm">(args: {
  bech32Address?: string;
  client?: T;
  chainId: string;
  searchDenom?: string;
}) => {
  const _chains = useGrazInternalStore.getState().chains;
  const chain = _chains?.find((i) => i.chainId === args.chainId);

  const { data: client } = useConnectClient({
    client: "stargate",
    chainId: args.chainId,
    enabled: Boolean(chain) && Boolean(args.bech32Address),
  });

  const query = useQuery(
    [
      "USE_BALANCES",
      {
        client,
        ...args,
        _chains,
      },
    ],
    async () => {
      if (client) {
        const res = await getBalance({
          client: client as unknown as ConnectClient<T>,
          bech32Address: toBech32(chain!.bech32Config.bech32PrefixAccAddr, fromBech32(args.bech32Address!).data),
          searchDenom: args.searchDenom!,
        });
        return res;
      }
      return undefined;
    },
    {
      enabled: Boolean(args.bech32Address) && Boolean(chain) && (Boolean(client) || Boolean(args.searchDenom)),
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  );

  return query as UseQueryResult<Coin | undefined>;
};

/**
 * graz query hook to retrieve list of balances from given address.
 *
 * @param bech32Address - Optional bech32 address, if not provided will return undefined
 * @param chainId - Optional chainId to retrieve the balances from given address and chainId, if not provided will return all balances currencies from all chains provided from GrazProvider
 * @param client - Optional client, if not provided will use the default client
 *
 * @example
 * ```ts
 * import { useAllBalances } from "graz";
 *
 * // single chain example
 * const { data, isFetching, refetch, ... } = useAllBalances({
 *  client: "stargate",
 *  chainId: "cosmoshub-4",
 *  bech32Address: "cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu",
 * })
 *
 * // all chains from GrazProvider example
 * const { data, isFetching, refetch, ... } = useAllBalances({
 *  client: "stargate",
 *  bech32Address: "cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu",
 * })
 * ```
 */
export const useAllBalances = <U extends ChainIdArgs>(
  args: {
    bech32Address?: string;
  } & U,
) => {
  const _chains = useGrazInternalStore.getState().chains;

  const { data: singleClient } = useConnectClient({
    client: "stargate",
    chainId: args.chainId!,
    enabled: Boolean(args.chainId) && Boolean(args.bech32Address),
  });

  const { data: multiClient } = useConnectClient({
    client: "stargate",
    enabled: !args.chainId && Boolean(args.bech32Address),
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
        const res = await getAllBalance({
          client: singleClient,
          bech32Address: toBech32(singleChain!.bech32Config.bech32PrefixAccAddr, fromBech32(args.bech32Address!).data),
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
            const _res = await getAllBalance({
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

  return query as UseQueryResult<HookResultDataWithChainId<Coin[] | undefined, U>>;
};

/**
 * graz query hook to retrieve list of currencies from defined chains in GrazProvider and given address.
 *
 * @param bech32Address - Optional bech32 address, if not provided will return undefined
 * @param client - Optional client, if not provided will use the default client
 * @param chainId - Optional chainId to retrieve the balances from given address and chainId, if not provided will return all balances currencies from all chains provided from GrazProvider
 *
 * @example
 * ```ts
 * import { useChainBalances } from "graz";
 *
 * // single chain example
 * const { data, isFetching, refetch, ... } = useChainBalances({
 *  client: "stargate",
 *  chainId: "cosmoshub-4",
 *  bech32Address: "cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu",
 * })
 *
 * // all chains from GrazProvider example
 * const { data, isFetching, refetch, ... } = useChainBalances({
 *  client: "stargate",
 *  bech32Address: "cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu",
 * })
 * ```
 */
export const useChainBalances = <T extends "cosmWasm" | "stargate", U extends ChainIdArgs>(
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
    enabled: Boolean(args.chainId) && Boolean(args.bech32Address),
  });

  const { data: multiClient } = useConnectClient({
    client: _client,
    enabled: !args.chainId && Boolean(args.bech32Address),
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
        const res = await Promise.all(
          singleChain!.currencies.map((currency) =>
            getBalance({
              client: singleClient as unknown as ConnectClient<T>,
              bech32Address: toBech32(
                singleChain!.bech32Config.bech32PrefixAccAddr,
                fromBech32(args.bech32Address!).data,
              ),
              searchDenom: currency.coinMinimalDenom,
            }),
          ),
        );
        return res;
      }
      if (!args.chainId && multiClient) {
        const multiChain = Object.entries(multiClient);
        const res: Record<string, Coin[]> = {};
        await Promise.all(
          multiChain.map(async ([chainId, client]) => {
            const chain = _chains?.find((i) => i.chainId === chainId);
            if (!chain) return;
            const _res = await Promise.all(
              chain.currencies
                .filter((i) => !i.coinMinimalDenom.startsWith("cw20:"))
                .map((currency) =>
                  getBalance({
                    client: client as unknown as ConnectClient<T>,
                    bech32Address: toBech32(
                      chain.bech32Config.bech32PrefixAccAddr,
                      fromBech32(args.bech32Address!).data,
                    ),
                    searchDenom: currency.coinMinimalDenom,
                  }),
                ),
            );
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
 * @param bech32Address - Optional bech32 account address, if not provided will return undefined
 * @param chainId - Optional chainId to retrieve the balances from given address and chainId, if not provided will return all balances currencies from all chains provided from GrazProvider
 *
 * @example
 * ```ts
 * import { useBalanceStaked } from "graz";
 *
 * // single chain example
 * const { data, isFetching, refetch, ... } = useBalanceStaked({
 *  chainId: "cosmoshub-4",
 *  bech32Address: "cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu",
 * });
 *
 * // all chains from GrazProvider example
 * const { data, isFetching, refetch, ... } = useBalanceStaked({
 *  bech32Address: "cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu",
 * });
 * ```
 */
export const useBalanceStaked = <U extends ChainIdArgs>(
  args: {
    bech32Address?: string;
  } & U,
) => {
  const _chains = useGrazInternalStore.getState().chains;

  const { data: singleClient } = useConnectClient({
    client: "stargate",
    chainId: args.chainId!,
    enabled: Boolean(args.chainId) && Boolean(args.bech32Address),
  });

  const { data: multiClient } = useConnectClient({
    client: "stargate",
    enabled: !args.chainId && Boolean(args.bech32Address),
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

interface UseSendTokens<T extends SigningClients> {
  signingClient?: T;
  signingClientOptions?: ConnectSigningClientArgs<T>["options"];
  chainId: string;
}

/**
 * graz mutation hook to send tokens.
 *
 * @param signingClient - Optional ("stargate" | "cosmWasm") signing client to use, if not provided will use default signing client from GrazProvider
 * @param signingClientOptions - Optional signing client options to use.
 * @param chainId - Required chainId to send tokens to.
 * @param onError - Optional error callback function.
 * @param onLoading - Optional loading callback function.
 * @param onSuccess - Optional success callback function.
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
export const useSendTokens = <T extends SigningClients>({
  signingClient,
  signingClientOptions,
  chainId,
  onError,
  onLoading,
  onSuccess,
}: MutationEventArgs<SendTokensArgs<T>, DeliverTxResponse> & UseSendTokens<T>) => {
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

export interface UseSendIbcTokens {
  signingClientOptions?: ConnectSigningClientArgs<"stargate">["options"];
  chainId: string;
}

/**
 * graz mutation hook to send IBC tokens.
 *
 * @param chainId - Required chainId to send tokens to.
 * @param signingClientOptions - Optional signing client options to use.
 * @param onError - Optional error callback function.
 * @param onLoading - Optional loading callback function.
 * @param onSuccess - Optional success callback function.
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
  chainId,
  signingClientOptions,
  onError,
  onLoading,
  onSuccess,
}: MutationEventArgs<SendIbcTokensArgs, DeliverTxResponse> & UseSendIbcTokens) => {
  const { data: _signingClient } = useConnectSigningClient({
    chainId,
    client: "stargate",
    options: signingClientOptions,
  });

  const queryKey = [
    "USE_SEND_IBC_TOKENS",
    { onError, onLoading, onSuccess, _signingClient, chainId, signingClientOptions },
  ];
  const mutation = useMutation(
    queryKey,
    async (args: Omit<SendIbcTokensArgs, "signingClient">) => {
      if (!_signingClient) throw new Error("Signing client is not available");
      const res = await sendIbcTokens({ signingClient: _signingClient, ...args });
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
    sendIbcTokens: mutation.mutate,
    sendIbcTokensAsync: mutation.mutateAsync,
    status: mutation.status,
  };
};

export type UseInstantiateContractArgs<Message extends Record<string, unknown>> = {
  codeId: number;
  chainId: string;
  signingClientOptions?: ConnectSigningClientArgs<"cosmWasm">["options"];
} & MutationEventArgs<InstantiateContractMutationArgs<Message>, InstantiateResult>;

/**
 * graz mutation hook to instantiate a CosmWasm smart contract when supported.
 *
 * @param codeId - Required codeId to instantiate.
 * @param chainId - Required chainId to instantiate contract on.
 * @param signingClientOptions - Optional signing client options to use.
 * @param onError - Optional error callback function.
 * @param onLoading - Optional loading callback function.
 * @param onSuccess - Optional success callback function.
 *
 * @example
 * ```ts
 * import { useInstantiateContract } from "graz"
 *
 * const { instantiateContract: instantiateMyContract } = useInstantiateContract({
 *   codeId: 4,
 *   onSuccess: ({ contractAddress }) => console.log('Address:', contractAddress)
 * })
 *
 * const instantiateMessage = { foo: 'bar' };
 * instantiateMyContract({
 *  msg: instatiateMessage,
 *  label: "test"
 * });
 * ```
 */
export const useInstantiateContract = <Message extends Record<string, unknown>>({
  chainId,
  codeId,
  signingClientOptions,
  onError,
  onLoading,
  onSuccess,
}: UseInstantiateContractArgs<Message>) => {
  const account = useAccount({
    chainId,
  });
  const accountAddress = account?.account?.bech32Address;
  const { data: _signingClient } = useConnectSigningClient({
    chainId,
    client: "cosmWasm",
    options: signingClientOptions,
  });

  const mutationFn = (args: InstantiateContractMutationArgs<Message>) => {
    if (!accountAddress) throw new Error("senderAddress is undefined");
    if (!_signingClient) throw new Error("Signing client is not available");

    return instantiateContract({
      ...args,
      signingClient: _signingClient,
      fee: args.fee ?? "auto",
      senderAddress: accountAddress,
      codeId,
    });
  };
  const queryKey = ["USE_INSTANTIATE_CONTRACT", onError, onLoading, onSuccess, codeId, accountAddress];
  const mutation = useMutation(queryKey, mutationFn, {
    onError: (err, data) => Promise.resolve(onError?.(err, data)),
    onMutate: onLoading,
    onSuccess: (instantiateResult) => Promise.resolve(onSuccess?.(instantiateResult)),
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
  chainId: string;
  signingClientOptions?: ConnectSigningClientArgs<"cosmWasm">["options"];
} & MutationEventArgs<ExecuteContractMutationArgs<Message>, ExecuteResult>;

/**
 * graz mutation hook for executing transactions against a CosmWasm smart
 * contract.
 *
 * @param contractAddress - Required contractAddress to execute against.
 * @param chainId - Required chainId to execute contract on.
 * @param signingClientOptions - Optional signing client options to use.
 * @param onError - Optional error callback function.
 * @param onLoading - Optional loading callback function.
 * @param onSuccess - Optional success callback function.
 *
 * @example
 * ```ts
 * import { useExecuteContract } from "graz"
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
 * const { executeContract } = useExecuteContract<ExecuteMessage>({ contractAddress });
 * executeContract({ msg: {
 *   foo: "bar"
 * }}, {
 *   onSuccess: (data: GreetResponse) => console.log('Got message:', data.message);
 * });
 * ```
 */
export const useExecuteContract = <Message extends Record<string, unknown>>({
  chainId,
  contractAddress,
  signingClientOptions,
  onError,
  onLoading,
  onSuccess,
}: UseExecuteContractArgs<Message>) => {
  const account = useAccount({
    chainId,
  });
  const accountAddress = account?.account?.bech32Address;
  const { data: _signingClient } = useConnectSigningClient({
    chainId,
    client: "cosmWasm",
    options: signingClientOptions,
  });

  const mutationFn = (args: ExecuteContractMutationArgs<Message>) => {
    if (!accountAddress) throw new Error("senderAddress is undefined");
    if (!_signingClient) throw new Error("Signing client is not available");

    return executeContract({
      ...args,
      signingClient: _signingClient,
      fee: args.fee ?? "auto",
      senderAddress: accountAddress,
      contractAddress,
      memo: args.memo ?? "",
      funds: args.funds ?? [],
    });
  };

  const queryKey = ["USE_EXECUTE_CONTRACT", onError, onLoading, onSuccess, contractAddress, accountAddress];
  const mutation = useMutation(queryKey, mutationFn, {
    onError: (err, data) => Promise.resolve(onError?.(err, data)),
    onMutate: onLoading,
    onSuccess: (executeResult) => Promise.resolve(onSuccess?.(executeResult)),
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

/**
 * graz query hook for dispatching a "smart" query to a CosmWasm smart
 * contract.
 *
 * @param address - The address of the contract to query
 * @param queryMsg - The query message to send to the contract
 * @param chainId - The chainId to query on
 *
 * @returns A query result with the result returned by the smart contract.
 */
export const useQuerySmart = <TData, TError>({
  address,
  queryMsg,
  chainId,
}: {
  address?: string;
  queryMsg?: Record<string, unknown>;
  chainId: string;
}): UseQueryResult<TData, TError> => {
  const { data: client } = useConnectClient({
    client: "cosmWasm",
    chainId,
  });
  const query: UseQueryResult<TData, TError> = useQuery(
    ["USE_QUERY_SMART", { address, queryMsg, chainId }],
    () => {
      if (!address || !queryMsg) throw new Error("address or queryMsg undefined");
      if (!client) throw new Error("Client is not available");
      return getQuerySmart({ address, queryMsg, client });
    },
    {
      enabled: Boolean(address) && Boolean(queryMsg),
    },
  );

  return query;
};

/**
 * graz query hook for dispatching a "raw" query to a CosmWasm smart contract.
 *
 * @param address - The address of the contract to query
 * @param key - The key to lookup in the contract storage
 * @param chainId - The chainId to query on
 *
 * @returns A query result with raw byte array stored at the key queried.
 */
export const useQueryRaw = <TError>({
  address,
  key,
  chainId,
}: {
  address?: string;
  key?: string;
  chainId: string;
}): UseQueryResult<Uint8Array | null, TError> => {
  const { data: client } = useConnectClient({
    client: "cosmWasm",
    chainId,
  });
  const queryKey = ["USE_QUERY_RAW", key, address] as const;
  const query: UseQueryResult<Uint8Array | null, TError> = useQuery(
    queryKey,
    ({ queryKey: [, _address] }) => {
      if (!address || !key) throw new Error("address or key undefined");
      if (!client) throw new Error("Client is not available");
      return getQueryRaw({ address, keyStr: key, client });
    },
    {
      enabled: Boolean(address) && Boolean(key),
    },
  );

  return query;
};
