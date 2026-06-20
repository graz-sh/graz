import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { HttpEndpoint } from "@cosmjs/stargate";
import { StargateClient } from "@cosmjs/stargate";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useGrazInternalStore } from "../store";
import type { QueryConfig, UseMultiChainQueryResult } from "../types/hooks";
import { LogCategory } from "../types/logger";
import { getLogger } from "../utils/logger";
import { createMultiChainAsyncFunction, useChainsFromArgs } from "../utils/multi-chain";

/**
 * graz query hook to retrieve a StargateClient.
 *
 * Note: Returns multi-chain results by default (Record<chainId, StargateClient>).
 *
 * @example
 * ```ts
 * import { useStargateClient } from "graz";
 *
 * // Single chain with precise type inference
 * const { data: clients } = useStargateClient({ chainId: ["cosmoshub-4"] });
 * // Type: { data?: { "cosmoshub-4": StargateClient } }
 * const client = clients?.["cosmoshub-4"];
 * await client?.getAccount("address");
 *
 * // Multiple chains with precise type inference
 * const { data: clients } = useStargateClient({
 *   chainId: ["cosmoshub-4", "osmosis-1"]
 * });
 * // Type: { data?: { "cosmoshub-4": StargateClient, "osmosis-1": StargateClient } }
 * await clients?.["cosmoshub-4"]?.getAccount("address"); // ✅ Autocomplete!
 *
 * // All connected chains
 * const { data: clients } = useStargateClient();
 * // Type: { data?: Record<string, StargateClient> }
 * ```
 */

// Overload: When chainId is provided with specific type
export function useStargateClient<const TChainIds extends readonly string[]>(
  args: {
    chainId: TChainIds;
  } & QueryConfig,
): UseMultiChainQueryResult<TChainIds, StargateClient>;

// Overload: When chainId is not provided
export function useStargateClient(args?: QueryConfig): UseMultiChainQueryResult<undefined, StargateClient>;

// Implementation
export function useStargateClient<const TChainIds extends readonly string[] | undefined>(
  args?: {
    chainId?: TChainIds;
  } & QueryConfig,
): UseMultiChainQueryResult<TChainIds, StargateClient> {
  const chains = useChainsFromArgs({ chainId: args?.chainId as string[] | undefined });
  const queryKey = useMemo(() => ["USE_STARGATE_CLIENT", chains], [chains]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const logger = getLogger();
      logger.debug(LogCategory.QUERY, "Creating Stargate clients", {
        hook: "useStargateClient",
        chainCount: chains?.length || 0,
        chainIds: chains?.map((c) => c.chainId),
      });

      if (!chains || chains.length < 1) throw new Error("No chains found");
      // Always use multi-chain function
      try {
        const res = await createMultiChainAsyncFunction(
          chains,
          async (_chain) => {
            const chainConfig = useGrazInternalStore.getState().chainsConfig?.[_chain.chainId];
            const endpoint: HttpEndpoint = { url: _chain.rpc, headers: { ...(chainConfig?.rpcHeaders || {}) } };
            const client = await StargateClient.connect(endpoint);
            return client;
          },
          "useStargateClient",
        );

        logger.debug(LogCategory.QUERY, "Stargate clients created successfully", {
          hook: "useStargateClient",
          clientCount: Object.keys(res).length,
        });
        return res;
      } catch (error) {
        logger.error(LogCategory.QUERY, "Failed to create Stargate clients", {
          hook: "useStargateClient",
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    enabled: Boolean(chains) && chains.length > 0 && (args?.enabled !== undefined ? Boolean(args.enabled) : true),
    refetchOnWindowFocus: false,
  }) as UseMultiChainQueryResult<TChainIds, StargateClient>;
}

/**
 * graz query hook to retrieve a CosmWasmClient.
 *
 * Note: Returns multi-chain results by default (Record<chainId, CosmWasmClient>).
 *
 * @example
 * ```ts
 * import { useCosmWasmClient } from "graz";
 *
 * // Single chain with precise type inference
 * const { data: clients } = useCosmWasmClient({ chainId: ["cosmoshub-4"] });
 * // Type: { data?: { "cosmoshub-4": CosmWasmClient } }
 * const client = clients?.["cosmoshub-4"];
 * await client?.getAccount("address");
 *
 * // Multiple chains with precise type inference
 * const { data: clients } = useCosmWasmClient({
 *   chainId: ["cosmoshub-4", "osmosis-1"]
 * });
 * // Type: { data?: { "cosmoshub-4": CosmWasmClient, "osmosis-1": CosmWasmClient } }
 * await clients?.["cosmoshub-4"]?.getAccount("address"); // ✅ Autocomplete!
 *
 * // All connected chains
 * const { data: clients } = useCosmWasmClient();
 * // Type: { data?: Record<string, CosmWasmClient> }
 * ```
 */

// Overload: When chainId is provided with specific type
export function useCosmWasmClient<const TChainIds extends readonly string[]>(
  args: {
    chainId: TChainIds;
  } & QueryConfig,
): UseMultiChainQueryResult<TChainIds, CosmWasmClient>;

// Overload: When chainId is not provided
export function useCosmWasmClient(args?: QueryConfig): UseMultiChainQueryResult<undefined, CosmWasmClient>;

// Implementation
export function useCosmWasmClient<const TChainIds extends readonly string[] | undefined>(
  args?: {
    chainId?: TChainIds;
  } & QueryConfig,
): UseMultiChainQueryResult<TChainIds, CosmWasmClient> {
  const chains = useChainsFromArgs({ chainId: args?.chainId as string[] | undefined });
  const queryKey = useMemo(() => ["USE_COSMWASM_CLIENT", chains], [chains]);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const logger = getLogger();
      logger.debug(LogCategory.QUERY, "Creating CosmWasm clients", {
        hook: "useCosmWasmClient",
        chainCount: chains?.length || 0,
        chainIds: chains?.map((c) => c.chainId),
      });

      if (!chains || chains.length < 1) throw new Error("No chains found");
      // Always use multi-chain function
      try {
        const res = await createMultiChainAsyncFunction(
          chains,
          async (_chain) => {
            const chainConfig = useGrazInternalStore.getState().chainsConfig?.[_chain.chainId];
            const endpoint: HttpEndpoint = { url: _chain.rpc, headers: { ...(chainConfig?.rpcHeaders || {}) } };
            const client = await CosmWasmClient.connect(endpoint);
            return client;
          },
          "useCosmWasmClient",
        );

        logger.debug(LogCategory.QUERY, "CosmWasm clients created successfully", {
          hook: "useCosmWasmClient",
          clientCount: Object.keys(res).length,
        });
        return res;
      } catch (error) {
        logger.error(LogCategory.QUERY, "Failed to create CosmWasm clients", {
          hook: "useCosmWasmClient",
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    enabled: Boolean(chains) && chains.length > 0 && (args?.enabled !== undefined ? Boolean(args.enabled) : true),
    refetchOnWindowFocus: false,
  }) as UseMultiChainQueryResult<TChainIds, CosmWasmClient>;
}
