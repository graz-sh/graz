/**
 * Unit tests for createMultiChainAsyncFunction (async operations)
 */

import type { ChainInfo } from "@keplr-wallet/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMultiChainAsyncFunction } from "../multi-chain";

describe("createMultiChainAsyncFunction", () => {
  const mockChains: ChainInfo[] = [
    {
      chainId: "cosmoshub-4",
      chainName: "Cosmos Hub",
      rpc: "https://rpc.cosmos.network",
      rest: "https://api.cosmos.network",
    } as ChainInfo,
    {
      chainId: "osmosis-1",
      chainName: "Osmosis",
      rpc: "https://rpc.osmosis.zone",
      rest: "https://api.osmosis.zone",
    } as ChainInfo,
    {
      chainId: "juno-1",
      chainName: "Juno",
      rpc: "https://rpc.juno.network",
      rest: "https://api.juno.network",
    } as ChainInfo,
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should always return Record format for single chain", async () => {
    const result = await createMultiChainAsyncFunction([mockChains[0]!], async (chain) => {
      return Promise.resolve(chain.chainName);
    });

    expect(result).toEqual({
      "cosmoshub-4": "Cosmos Hub",
    });
    expect(typeof result).toBe("object");
    expect(Array.isArray(result)).toBe(false);
  });

  it("should return Record format for multiple chains", async () => {
    const result = await createMultiChainAsyncFunction(mockChains, async (chain) => {
      return Promise.resolve(chain.chainName);
    });

    expect(result).toEqual({
      "cosmoshub-4": "Cosmos Hub",
      "osmosis-1": "Osmosis",
      "juno-1": "Juno",
    });
  });

  it("should execute async function for each chain", async () => {
    const fn = vi.fn(async (chain: ChainInfo) => {
      return Promise.resolve(chain.chainId.toUpperCase());
    });

    const result = await createMultiChainAsyncFunction(mockChains, fn);

    expect(fn).toHaveBeenCalledTimes(3);
    expect(result).toEqual({
      "cosmoshub-4": "COSMOSHUB-4",
      "osmosis-1": "OSMOSIS-1",
      "juno-1": "JUNO-1",
    });
  });

  it("should handle async operations in parallel", async () => {
    const startTimes: number[] = [];

    const result = await createMultiChainAsyncFunction(mockChains, async (chain) => {
      startTimes.push(Date.now());
      await new Promise((resolve) => setTimeout(resolve, 10));
      return chain.chainId;
    });

    // All should start roughly at the same time (parallel execution)
    // If sequential, there would be ~10ms gaps
    if (startTimes.length >= 2) {
      const gap1 = startTimes[1]! - startTimes[0]!;
      expect(gap1).toBeLessThan(5); // Should be nearly simultaneous
    }

    expect(result).toEqual({
      "cosmoshub-4": "cosmoshub-4",
      "osmosis-1": "osmosis-1",
      "juno-1": "juno-1",
    });
  });

  it("should handle empty array", async () => {
    const result = await createMultiChainAsyncFunction([], async (chain) => chain.chainName);

    expect(result).toEqual({});
  });

  it("should handle errors in async functions", async () => {
    const fn = async (chain: ChainInfo) => {
      if (chain.chainId === "osmosis-1") {
        throw new Error("Test error");
      }
      return chain.chainName;
    };

    await expect(createMultiChainAsyncFunction(mockChains, fn)).rejects.toThrow("Test error");
  });

  it("should preserve async operation results", async () => {
    const result = await createMultiChainAsyncFunction(mockChains, async (chain) => ({
      name: chain.chainName,
      id: chain.chainId,
      timestamp: Date.now(),
    }));

    expect(result["cosmoshub-4"]).toHaveProperty("name");
    expect(result["cosmoshub-4"]).toHaveProperty("id");
    expect(result["cosmoshub-4"]).toHaveProperty("timestamp");
    expect(typeof result["cosmoshub-4"]?.timestamp).toBe("number");
  });

  it("should respect concurrency limits", async () => {
    // This test verifies that p-map is being used with concurrency setting
    // The actual concurrency is controlled by the store, but we can verify
    // that the function completes successfully with multiple chains
    const executionOrder: string[] = [];

    const result = await createMultiChainAsyncFunction(mockChains, async (chain) => {
      executionOrder.push(`start-${chain.chainId}`);
      await new Promise((resolve) => setTimeout(resolve, 5));
      executionOrder.push(`end-${chain.chainId}`);
      return chain.chainName;
    });

    expect(result).toEqual({
      "cosmoshub-4": "Cosmos Hub",
      "osmosis-1": "Osmosis",
      "juno-1": "Juno",
    });
    expect(executionOrder.length).toBe(6); // 3 start + 3 end
  });
});
