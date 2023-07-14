import { GasPrice } from "@cosmjs/stargate";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { getOfflineSigners } from "../actions/account";
import type { Clients, ConnectClient, ConnectSigningClient, SigningClients } from "../actions/clients";
import { connectClient, connectSigningClient, type ConnectSigningClientArgs } from "../actions/clients";
import { useGrazInternalStore, useGrazSessionStore } from "../store";
import type { ChainIdArgs, HookResultDataWithChainId } from "../types/data";

/**
 * graz query hook to retrieve a CosmWasmClient or StargateClient or Tendermint34Client.
 *
 * @param client - if provided, it will use the given client instead of the default client
 * @param chainId - if provided, it will only return the data of the given chainId
 * @param onlyConnectedChains - if true, it will only return the client of the current connected chains
 * @param enabled - if false, it will not fetch the data
 *
 * @returns if chainId is string it will return an object, otherwise it will return a record of objects
 *
 * @example
 * ```ts
 * import { useClient } from "graz";
 *
 * // single chain
 * const { data, isLoading, ... } = useClient({ client: "stargate" chainId: "cosmoshub-4" });
 *
 * // all chains from GrazProvider example
 * const { data, isLoading, ... } = useClient({ client: "stargate" });
 *
 * ```
 */
export const useConnectClient = <T extends Clients, U extends ChainIdArgs>(
  args?: {
    client?: T;
    /**
     *
     *  if true, it will only return the client of the given connected chains
     */
    onlyConnectedChains?: boolean;
    enabled?: boolean;
  } & U,
) => {
  const _client = (args?.client ?? useGrazInternalStore.getState().defaultClient) as T;
  const _chains = useGrazInternalStore.getState().chains;
  const sessionChainIds = useGrazSessionStore.getState().sessions?.map((i) => i.chainId);
  const singleChain = _chains?.find((i) => i.chainId === args?.chainId);
  const sessionChains = sessionChainIds?.map((i) => _chains!.find((x) => x.chainId === i)!);
  const chains = args?.onlyConnectedChains ? sessionChains : _chains;

  const query = useQuery(
    [
      "USE_CONNECT_CLIENT",
      {
        client: _client,
        chainId: args?.chainId,
        onlyConnectedChains: args?.onlyConnectedChains,
      },
    ],
    async () => {
      if (singleChain) {
        const client = await connectClient({
          client: _client,
          rpc: singleChain.rpc,
          rpcHeaders: singleChain.rpcHeaders,
        });
        return client;
      }
      const res: Record<string, ConnectClient<T>> = {};
      if (!chains) return undefined;
      await Promise.all(
        chains.map(async (chain) => {
          const client = await connectClient({
            client: _client,
            rpc: chain.rpc,
            rpcHeaders: chain.rpcHeaders,
          });
          res[chain.chainId] = client;
        }),
      );

      return res;
    },
    {
      enabled: args?.enabled !== undefined ? args.enabled && Boolean(_chains) : Boolean(_chains),
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  return query as UseQueryResult<HookResultDataWithChainId<ConnectClient<T>, U> | undefined>;
};

/**
 * graz query hook to retrieve a SigningCosmWasmClient or SigningStargateClient.
 *
 * @param client - if provided, it will use the given client instead of the default client
 * @param chainId - if provided, it will only return the data of the given chainId
 * @param options - signing client options of given client
 *
 * @returns if chainId is string it will return an object, otherwise it will return a record of objects
 *
 * @example
 * ```ts
 * import { useSigningClient } from "graz";
 *
 * // single chain
 * const { data, isLoading, ... } = useSigningClient({ client: "stargate" chainId: "cosmoshub-4" });
 *
 * // all chains from GrazProvider example
 * const { data, isLoading, ... } = useSigningClient({ client: "stargate" });
 *
 * ```
 */
export const useConnectSigningClient = <T extends SigningClients, U extends ChainIdArgs>(
  args?: {
    client?: T;
    options?: U["chainId"] extends string
      ? ConnectSigningClientArgs<T>["options"]
      : Record<string, ConnectSigningClientArgs<T>["options"]>;
  } & U,
) => {
  const _client = (args?.client ?? useGrazInternalStore.getState().defaultClient) as T;

  const _chains = useGrazInternalStore.getState().chains;
  const sessionChainIds = useGrazSessionStore.getState().sessions?.map((i) => i.chainId);
  const singleChain = _chains?.find((i) => i.chainId === args?.chainId);
  const sessionChains = sessionChainIds?.map((i) => _chains!.find((x) => x.chainId === i)!);

  const queryKey = [
    "USE_CONNECT_SIGNING_CLIENT",
    { client: _client, chainId: args?.chainId, options: args?.options },
  ] as const;
  const query = useQuery(
    queryKey,
    async () => {
      if (singleChain) {
        const { offlineSignerAuto } = await getOfflineSigners({
          chainId: singleChain.chainId,
        });
        const gasPrice = singleChain.gas
          ? GasPrice.fromString(`${singleChain.gas.price}${singleChain.gas.denom}`)
          : undefined;
        const options = (
          _client === "cosmWasm" ? { gasPrice, ...(args?.options || {}) } : args?.options
        ) as ConnectSigningClientArgs<T>["options"];
        const client = await connectSigningClient({
          client: _client,
          rpc: singleChain.rpc,
          rpcHeaders: singleChain.rpcHeaders,
          offlineSignerAuto,
          options,
        });
        return client;
      }
      const res: Record<string, ConnectClient<T>> = {};
      if (!sessionChains) return undefined;
      await Promise.all(
        sessionChains.map(async (chain) => {
          const { offlineSignerAuto } = await getOfflineSigners({ chainId: chain.chainId });
          const gasPrice = chain.gas ? GasPrice.fromString(`${chain.gas.price}${chain.gas.denom}`) : undefined;

          const options = (
            _client === "cosmWasm"
              ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                { gasPrice, ...(args?.options?.[chain.chainId] || {}) }
              : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                args?.options?.[chain.chainId]
          ) as ConnectSigningClientArgs<T>["options"];

          const client = await connectSigningClient({
            client: _client,
            rpc: chain.rpc,
            rpcHeaders: chain.rpcHeaders,
            offlineSignerAuto,
            options,
          });
          res[chain.chainId] = client;
        }),
      );

      return res;
    },
    {
      enabled: Boolean(_chains),
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  return query as UseQueryResult<HookResultDataWithChainId<ConnectSigningClient<T>, U> | undefined>;
};
