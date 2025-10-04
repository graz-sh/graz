/**
 * Tests for Record format consistency between sync and async multi-chain functions
 */

import { describe, it, expect } from "vitest";
import type { ChainInfo } from "@keplr-wallet/types";
import { createMultiChainFunction, createMultiChainAsyncFunction } from "../multi-chain";

describe("Multi-Chain Record Format Consistency", () => {
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

  it("should return consistent Record format regardless of chain count", async () => {
    const singleResult = await createMultiChainAsyncFunction([mockChains[0]!], async (chain) => chain.chainName);

    const multiResult = await createMultiChainAsyncFunction(mockChains, async (chain) => chain.chainName);

    // Both should be objects (Records)
    expect(typeof singleResult).toBe("object");
    expect(typeof multiResult).toBe("object");
    expect(Array.isArray(singleResult)).toBe(false);
    expect(Array.isArray(multiResult)).toBe(false);

    // Both should have chainId as keys
    expect(Object.keys(singleResult)).toEqual(["cosmoshub-4"]);
    expect(Object.keys(multiResult)).toEqual(["cosmoshub-4", "osmosis-1", "juno-1"]);
  });

  it("sync and async functions should return same structure", async () => {
    const syncResult = createMultiChainFunction(mockChains, (chain) => chain.chainName);

    const asyncResult = await createMultiChainAsyncFunction(mockChains, async (chain) => chain.chainName);

    expect(Object.keys(syncResult)).toEqual(Object.keys(asyncResult));
    expect(syncResult).toEqual(asyncResult);
  });

  it("should maintain Record structure with single chain", () => {
    const syncSingle = createMultiChainFunction([mockChains[0]!], (chain) => chain.chainId);

    expect(syncSingle).toEqual({
      "cosmoshub-4": "cosmoshub-4",
    });
    expect(Object.keys(syncSingle).length).toBe(1);
    expect(typeof syncSingle).toBe("object");
  });

  it("should maintain Record structure with multiple chains", () => {
    const syncMulti = createMultiChainFunction(mockChains, (chain) => chain.chainId);

    expect(syncMulti).toEqual({
      "cosmoshub-4": "cosmoshub-4",
      "osmosis-1": "osmosis-1",
      "juno-1": "juno-1",
    });
    expect(Object.keys(syncMulti).length).toBe(3);
    expect(typeof syncMulti).toBe("object");
  });

  it("should handle empty arrays consistently", async () => {
    const syncEmpty = createMultiChainFunction([], (chain) => chain.chainName);
    const asyncEmpty = await createMultiChainAsyncFunction([], async (chain) => chain.chainName);

    expect(syncEmpty).toEqual({});
    expect(asyncEmpty).toEqual({});
    expect(typeof syncEmpty).toBe("object");
    expect(typeof asyncEmpty).toBe("object");
  });

  it("should use chainId as key consistently", async () => {
    const syncResult = createMultiChainFunction(mockChains, (chain) => ({
      name: chain.chainName,
      rpc: chain.rpc,
    }));

    const asyncResult = await createMultiChainAsyncFunction(mockChains, async (chain) => ({
      name: chain.chainName,
      rpc: chain.rpc,
    }));

    // Keys should be chain IDs
    expect(Object.keys(syncResult)).toEqual(["cosmoshub-4", "osmosis-1", "juno-1"]);
    expect(Object.keys(asyncResult)).toEqual(["cosmoshub-4", "osmosis-1", "juno-1"]);

    // Values should match
    expect(syncResult["cosmoshub-4"]).toEqual(asyncResult["cosmoshub-4"]);
    expect(syncResult["osmosis-1"]).toEqual(asyncResult["osmosis-1"]);
    expect(syncResult["juno-1"]).toEqual(asyncResult["juno-1"]);
  });
});
