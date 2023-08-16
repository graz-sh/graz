import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { HttpEndpoint } from "@cosmjs/stargate";
import { StargateClient } from "@cosmjs/stargate";
import { Tendermint34Client, Tendermint37Client } from "@cosmjs/tendermint-rpc";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useGrazSessionStore } from "../store";

/**
 * graz query hook to retrieve a StargateClient.
 *
 * @example
 * ```ts
 * import { useStargateClient } from "graz";
 *
 * const { data:client, isFetching, refetch, ... } = useStargateClient();
 *
 * client.getAccount("address")
 *
 * ```
 */
export const useStargateClient = () => {
  const chain = useGrazSessionStore((x) => x.activeChain);
  const queryKey = useMemo(() => ["USE_STARGATE_CLIENT", chain] as const, [chain]);

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, _chain] }) => {
      if (!_chain) throw new Error("No chain found");
      const endpoint: HttpEndpoint = { url: _chain.rpc, headers: { ...(_chain.rpcHeaders || {}) } };
      const client = await StargateClient.connect(endpoint);
      return client;
    },
    enabled: Boolean(chain),
    refetchOnWindowFocus: false,
  });
};

/**
 * graz query hook to retrieve a CosmWasmClient.
 *
 * @example
 * ```ts
 * import { useCosmWasmClient } from "graz";
 *
 * const { data:client, isFetching, refetch, ... } = useCosmWasmClient();
 *
 * client.getAccount("address")
 *
 * ```
 */
export const useCosmWasmClient = () => {
  const chain = useGrazSessionStore((x) => x.activeChain);
  const queryKey = useMemo(() => ["USE_COSMWASM_CLIENT", chain] as const, [chain]);

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, _chain] }) => {
      if (!_chain) throw new Error("No chain found");
      const endpoint: HttpEndpoint = { url: _chain.rpc, headers: { ...(_chain.rpcHeaders || {}) } };
      const client = await CosmWasmClient.connect(endpoint);
      return client;
    },
    enabled: Boolean(chain),
    refetchOnWindowFocus: false,
  });
};

/**
 * graz query hook to retrieve a TendermintClient.
 *
 * @example
 * ```ts
 * import { useCosmWasmClient } from "graz";
 *
 * const { data:client, isFetching, refetch, ... } = useTendermintClient("tm37");
 *
 * client.getAccount("address")
 *
 * ```
 */
export const useTendermintClient = <T extends "tm34" | "tm37">(
  type: T,
): UseQueryResult<T extends "tm34" ? Tendermint34Client : Tendermint37Client> => {
  const chain = useGrazSessionStore((x) => x.activeChain);
  const queryKey = useMemo(() => ["USE_TENDERMINT_CLIENT", type, chain] as const, [type, chain]);

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, _type, _chain] }) => {
      if (!_chain) throw new Error("No chain found");
      const endpoint: HttpEndpoint = { url: _chain.rpc, headers: { ...(_chain.rpcHeaders || {}) } };
      const TendermintClient = _type === "tm37" ? Tendermint37Client : Tendermint34Client;
      const client = await TendermintClient.connect(endpoint);
      return client;
    },
    enabled: Boolean(chain),
    refetchOnWindowFocus: false,
  });
};
