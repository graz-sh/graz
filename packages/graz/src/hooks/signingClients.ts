import type { SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { HttpEndpoint, SigningStargateClientOptions } from "@cosmjs/stargate";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { checkWallet, getWallet } from "../actions/wallet";
import { useGrazInternalStore, useGrazSessionStore } from "../store";
import type { QueryConfig, UseMultiChainQueryResult } from "../types/hooks";
import { LogCategory } from "../types/logger";
import { getLogger } from "../utils/logger";
import { createMultiChainAsyncFunction, useChainsFromArgs } from "../utils/multi-chain";

/**
 * Base signing client args - now always uses per-chain opts
 */
interface BaseSigningClientArgs extends QueryConfig {
  offlineSigner?: "offlineSigner" | "offlineSignerAuto" | "offlineSignerOnlyAmino";
  opts?: Record<string, SigningStargateClientOptions | SigningCosmWasmClientOptions>;
}
/**
 * graz query hook to retrieve a SigningStargateClient.
 *
 * Note: Returns multi-chain results by default (Record<chainId, SigningStargateClient | null>).
 * Options are now always per-chain using `opts` Record.
 *
 * @example
 * ```ts
 * import { useStargateSigningClient } from "graz";
 *
 * // Single chain with precise type inference
 * const { data: clients } = useStargateSigningClient({ chainId: ["cosmoshub-4"] });
 * // Type: { data?: { "cosmoshub-4": SigningStargateClient | null } }
 * const client = clients?.["cosmoshub-4"];
 * await client?.getAccount("address");
 *
 * // Multiple chains with per-chain options
 * const { data: clients } = useStargateSigningClient({
 *   chainId: ["cosmoshub-4", "osmosis-1"],
 *   opts: {
 *     "cosmoshub-4": { gasPrice: GasPrice.fromString("0.025uatom") },
 *     "osmosis-1": { gasPrice: GasPrice.fromString("0.025uosmo") }
 *   }
 * });
 * // Type: { data?: { "cosmoshub-4": SigningStargateClient | null, "osmosis-1": SigningStargateClient | null } }
 * await clients?.["cosmoshub-4"]?.getAccount("address"); // ✅ Autocomplete!
 *
 * // All connected chains
 * const { data: clients } = useStargateSigningClient();
 * // Type: { data?: Record<string, SigningStargateClient | null> }
 * ```
 */

// Overload: When chainId is provided with specific type
export function useStargateSigningClient<const TChainIds extends readonly string[]>(
  args: {
    chainId: TChainIds;
  } & BaseSigningClientArgs,
): UseMultiChainQueryResult<TChainIds, SigningStargateClient | null>;

// Overload: When chainId is not provided
export function useStargateSigningClient(
  args?: BaseSigningClientArgs,
): UseMultiChainQueryResult<undefined, SigningStargateClient | null>;

// Implementation
export function useStargateSigningClient<const TChainIds extends readonly string[] | undefined>(
  args?: {
    chainId?: TChainIds;
  } & BaseSigningClientArgs,
): UseMultiChainQueryResult<TChainIds, SigningStargateClient | null> {
  const chains = useChainsFromArgs({ chainId: args?.chainId as string[] | undefined });
  const wallet = useGrazInternalStore((x) => x.walletType);
  const activeChainIds = useGrazSessionStore((x) => x.activeChainIds);

  const isConnected =
    useGrazSessionStore.getState().status === "connected" &&
    useGrazSessionStore.getState().accounts &&
    useGrazInternalStore.getState()._reconnectConnector === wallet;

  const queryKey = useMemo(
    () => ["USE_STARGATE_SIGNING_CLIENT", chains, wallet, args, activeChainIds],
    [activeChainIds, args, chains, wallet],
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      const logger = getLogger();
      logger.debug(LogCategory.QUERY, "Creating Stargate signing clients", {
        hook: "useStargateSigningClient",
        chainCount: chains?.length || 0,
        chainIds: chains?.map((c) => c.chainId),
        walletType: wallet,
      });

      if (!chains || chains.length < 1) throw new Error("No chains found");
      if (!wallet) throw new Error("Wallet is not defined");
      // Always use multi-chain function
      try {
        const res = await createMultiChainAsyncFunction(chains, async (_chain) => {
          // Chain is not connected return null
          if (!activeChainIds?.includes(_chain.chainId)) return null;
          const isWalletAvailable = checkWallet(wallet);
          if (!isWalletAvailable) {
            throw new Error(`${wallet} is not available`);
          }
          const offlineSigner = await (async () => {
            switch (args?.offlineSigner) {
              case "offlineSigner":
                return getWallet(wallet).getOfflineSigner(_chain.chainId);
              case "offlineSignerAuto":
                return getWallet(wallet).getOfflineSignerAuto(_chain.chainId);
              case "offlineSignerOnlyAmino":
                return getWallet(wallet).getOfflineSignerOnlyAmino(_chain.chainId);
              default:
                return getWallet(wallet).getOfflineSignerAuto(_chain.chainId);
            }
          })();
          const chainConfig = useGrazInternalStore.getState().chainsConfig?.[_chain.chainId];
          const endpoint: HttpEndpoint = { url: _chain.rpc, headers: { ...(chainConfig?.rpcHeaders || {}) } };
          // Always use per-chain opts
          const signingClient = await SigningStargateClient.connectWithSigner(
            endpoint,
            offlineSigner,
            args?.opts?.[_chain.chainId],
          );
          return signingClient;
        }, "useStargateSigningClient");

        logger.debug(LogCategory.QUERY, "Stargate signing clients created successfully", {
          hook: "useStargateSigningClient",
          clientCount: Object.keys(res).length,
        });
        return res;
      } catch (error) {
        logger.error(LogCategory.QUERY, "Failed to create Stargate signing clients", {
          hook: "useStargateSigningClient",
          error: error instanceof Error ? error.message : String(error),
          walletType: wallet,
        });
        throw error;
      }
    },
    enabled:
      Boolean(chains) &&
      chains.length > 0 &&
      Boolean(wallet) &&
      (args?.enabled !== undefined ? Boolean(args.enabled) : true) &&
      Boolean(isConnected),
    refetchOnWindowFocus: false,
  });
}

/**
 * graz query hook to retrieve a SigningCosmWasmClient.
 *
 * Note: Returns multi-chain results by default (Record<chainId, SigningCosmWasmClient | null>).
 * Options are now always per-chain using `opts` Record.
 *
 * @example
 * ```ts
 * import { useCosmWasmSigningClient } from "graz";
 *
 * // Single chain with precise type inference
 * const { data: clients } = useCosmWasmSigningClient({ chainId: ["cosmoshub-4"] });
 * // Type: { data?: { "cosmoshub-4": SigningCosmWasmClient | null } }
 * const client = clients?.["cosmoshub-4"];
 * await client?.getAccount("address");
 *
 * // Multiple chains with per-chain options
 * const { data: clients } = useCosmWasmSigningClient({
 *   chainId: ["cosmoshub-4", "osmosis-1"],
 *   opts: {
 *     "cosmoshub-4": { gasPrice: GasPrice.fromString("0.025uatom") },
 *     "osmosis-1": { gasPrice: GasPrice.fromString("0.025uosmo") }
 *   }
 * });
 * // Type: { data?: { "cosmoshub-4": SigningCosmWasmClient | null, "osmosis-1": SigningCosmWasmClient | null } }
 * await clients?.["cosmoshub-4"]?.getAccount("address"); // ✅ Autocomplete!
 *
 * // All connected chains
 * const { data: clients } = useCosmWasmSigningClient();
 * // Type: { data?: Record<string, SigningCosmWasmClient | null> }
 * ```
 */

// Overload: When chainId is provided with specific type
export function useCosmWasmSigningClient<const TChainIds extends readonly string[]>(
  args: {
    chainId: TChainIds;
  } & BaseSigningClientArgs,
): UseMultiChainQueryResult<TChainIds, SigningCosmWasmClient | null>;

// Overload: When chainId is not provided
export function useCosmWasmSigningClient(
  args?: BaseSigningClientArgs,
): UseMultiChainQueryResult<undefined, SigningCosmWasmClient | null>;

// Implementation
export function useCosmWasmSigningClient<const TChainIds extends readonly string[] | undefined>(
  args?: {
    chainId?: TChainIds;
  } & BaseSigningClientArgs,
): UseMultiChainQueryResult<TChainIds, SigningCosmWasmClient | null> {
  const chains = useChainsFromArgs({ chainId: args?.chainId as string[] | undefined });
  const wallet = useGrazInternalStore((x) => x.walletType);
  const activeChainIds = useGrazSessionStore((x) => x.activeChainIds);

  const isConnected =
    useGrazSessionStore.getState().status === "connected" &&
    useGrazSessionStore.getState().accounts &&
    useGrazInternalStore.getState()._reconnectConnector === wallet;

  const queryKey = useMemo(
    () => ["USE_COSMWASM_SIGNING_CLIENT", chains, wallet, args, activeChainIds],
    [activeChainIds, args, chains, wallet],
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      const logger = getLogger();
      logger.debug(LogCategory.QUERY, "Creating CosmWasm signing clients", {
        hook: "useCosmWasmSigningClient",
        chainCount: chains?.length || 0,
        chainIds: chains?.map((c) => c.chainId),
        walletType: wallet,
      });

      if (!chains || chains.length < 1) throw new Error("No chains found");
      if (!wallet) throw new Error("Wallet is not defined");
      // Always use multi-chain function
      try {
        const res = await createMultiChainAsyncFunction(chains, async (_chain) => {
          // Chain is not connected return null
          if (!activeChainIds?.includes(_chain.chainId)) return null;
          const isWalletAvailable = checkWallet(wallet);
          if (!isWalletAvailable) {
            throw new Error(`${wallet} is not available`);
          }
          const offlineSigner = await (async () => {
            switch (args?.offlineSigner) {
              case "offlineSigner":
                return getWallet(wallet).getOfflineSigner(_chain.chainId);
              case "offlineSignerAuto":
                return getWallet(wallet).getOfflineSignerAuto(_chain.chainId);
              case "offlineSignerOnlyAmino":
                return getWallet(wallet).getOfflineSignerOnlyAmino(_chain.chainId);
              default:
                return getWallet(wallet).getOfflineSignerAuto(_chain.chainId);
            }
          })();
          const chainConfig = useGrazInternalStore.getState().chainsConfig?.[_chain.chainId];
          const endpoint: HttpEndpoint = { url: _chain.rpc, headers: { ...(chainConfig?.rpcHeaders || {}) } };
          const gasPrice = chainConfig?.gas
            ? GasPrice.fromString(`${chainConfig.gas.price}${chainConfig.gas.denom}`)
            : undefined;
          // Always use per-chain opts
          const signingClient = await SigningCosmWasmClient.connectWithSigner(endpoint, offlineSigner, {
            gasPrice,
            ...(args?.opts?.[_chain.chainId] || {}),
          });
          return signingClient;
        }, "useCosmWasmSigningClient");

        logger.debug(LogCategory.QUERY, "CosmWasm signing clients created successfully", {
          hook: "useCosmWasmSigningClient",
          clientCount: Object.keys(res).length,
        });
        return res;
      } catch (error) {
        logger.error(LogCategory.QUERY, "Failed to create CosmWasm signing clients", {
          hook: "useCosmWasmSigningClient",
          error: error instanceof Error ? error.message : String(error),
          walletType: wallet,
        });
        throw error;
      }
    },
    enabled:
      Boolean(chains) &&
      chains.length > 0 &&
      Boolean(wallet) &&
      (args?.enabled !== undefined ? Boolean(args.enabled) : true) &&
      Boolean(isConnected),
    refetchOnWindowFocus: false,
  });
}
