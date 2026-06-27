import { ChainInfo } from "@keplr-wallet/types";

import { useGrazInternalStore } from "../store";
import { LogCategory } from "../types/logger";
import { getLogger } from "./logger";

const pMap = async <T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  { concurrency = Infinity }: { concurrency?: number } = {},
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let i = 0;
  const runNext = async (): Promise<void> => {
    if (i >= items.length) return;
    const idx = i++;
    results[idx] = await fn(items[idx]!);
    await runNext();
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runNext));
  return results;
};

/**
 * ChainId is now always an array of chain IDs.
 * This ensures consistent multi-chain behavior across all hooks.
 */
export type ChainId = string[];

/**
 * Hook to get chain info objects from chainId argument.
 * If chainId is provided, returns those specific chains.
 * If chainId is undefined, returns all chains configured in GrazProvider.
 */
export const useChainsFromArgs = ({ chainId }: { chainId?: ChainId }) => {
  const chains = useGrazInternalStore((x) => x.chains);
  if (!chains) throw new Error("No chains found in GrazProvider");

  // If chainId provided, return those specific chains
  if (chainId && chainId.length > 0) {
    return chainId.map((id) => chains.find((c) => c.chainId === id)!).filter(Boolean);
  }

  // Otherwise return all configured chains
  return chains;
};

/**
 * Creates an async function that executes across multiple chains in parallel.
 * Always returns Record<chainId, T> for consistent multi-chain results.
 *
 * @param chains - Array of ChainInfo objects to execute against
 * @param fn - Async function to execute for each chain
 * @param caller - Name of the hook or function calling this (for logging)
 * @returns Promise<Record<chainId, T>> - Results mapped by chain ID
 */
export const createMultiChainAsyncFunction = async <T>(
  chains: ChainInfo[],
  fn: (chain: ChainInfo) => Promise<T>,
  caller?: string,
): Promise<Record<string, T>> => {
  const logger = getLogger();
  const concurrency = useGrazInternalStore.getState().multiChainFetchConcurrency;

  const logContext = caller ? { hook: caller } : { function: "createMultiChainAsyncFunction" };

  logger.debug(LogCategory.MULTICHAIN, "Starting parallel operations", {
    ...logContext,
    chainCount: chains.length,
    concurrency,
    chainIds: chains.map((c) => c.chainId),
  });

  logger.time("multichain-operation");

  try {
    const res = await pMap(chains, fn, { concurrency });
    const result = Object.fromEntries(res.map((x, i) => [chains[i]!.chainId, x]));

    logger.timeEnd("multichain-operation");
    logger.info(LogCategory.MULTICHAIN, "All chains completed", {
      ...logContext,
      chainCount: chains.length,
      chainIds: chains.map((c) => c.chainId),
      successCount: Object.keys(result).length,
    });

    return result;
  } catch (error) {
    logger.timeEnd("multichain-operation");
    logger.error(LogCategory.MULTICHAIN, "Multi-chain operation failed", {
      ...logContext,
      error: error instanceof Error ? error.message : String(error),
      chainCount: chains.length,
      chainIds: chains.map((c) => c.chainId),
    });
    throw error;
  }
};

/**
 * Creates a synchronous function that executes across multiple chains.
 * Always returns Record<chainId, T> for consistent multi-chain results.
 *
 * @param chains - Array of ChainInfo objects to execute against
 * @param fn - Synchronous function to execute for each chain
 * @returns Record<chainId, T> - Results mapped by chain ID
 */
export const createMultiChainFunction = <T>(chains: ChainInfo[], fn: (chain: ChainInfo) => T): Record<string, T> => {
  const res = chains.map(fn);
  return Object.fromEntries(res.map((x, i) => [chains[i]!.chainId, x]));
};
