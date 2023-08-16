import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { HttpEndpoint } from "@cosmjs/stargate";
import { StargateClient } from "@cosmjs/stargate";
import { Tendermint34Client, Tendermint37Client } from "@cosmjs/tendermint-rpc";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useGrazSessionStore } from "../store";

/**
 * graz query hook to retrieve a CosmWasmClient, StargateClient and Tendermint34Client. If there's no given arguments it will be using the current connected client
 *
 * @example
 * ```ts
 * import { useClient } from "graz";
 *
 * // use connected client's cosmwasm client
 * const { data, isFetching, refetch, ... } = useClient();
 *
 * // initialize new custom client from given arguments
 * useClient({ rpc: "https://rpc.cosmoshub.strange.love", });
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
