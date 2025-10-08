/**
 * Type tests for UseMultiChainQueryResult type inference
 */

import type { Key } from "@keplr-wallet/types";
import { describe, expectTypeOf, it } from "vitest";

import type { ChainIdToRecord } from "../hooks";

describe("UseMultiChainQueryResult Type Inference", () => {
  it("should infer exact types when chainId is const tuple", () => {
    // Simulating what happens in hooks
    type ChainIds = readonly ["cosmoshub-4", "osmosis-1"];
    type Result = ChainIds extends readonly string[] ? ChainIdToRecord<ChainIds, Key> : Record<string, Key>;

    expectTypeOf<Result>().toEqualTypeOf<{
      "cosmoshub-4": Key;
      "osmosis-1": Key;
    }>();
  });

  it("should fall back to generic Record when chainId is undefined", () => {
    type ChainIds = undefined;
    type Result = ChainIds extends readonly string[] ? ChainIdToRecord<ChainIds, Key> : Record<string, Key>;

    expectTypeOf<Result>().toEqualTypeOf<Record<string, Key>>();
  });

  it("should fall back to generic Record when chainId is not const", () => {
    type ChainIds = string[];
    type Result = ChainIds extends readonly string[] ? ChainIdToRecord<ChainIds, Key> : Record<string, Key>;

    // string[] is assignable to readonly string[], so this will try to create ChainIdToRecord
    // but string[] doesn't have literal types, so the result will be Record<string, Key>
    expectTypeOf<Result>().toMatchTypeOf<Record<string, Key>>();
  });

  it("should provide autocomplete-friendly types with const", () => {
    // Simulate hook return type
    interface HookResult<TChainIds extends readonly string[] | undefined> {
      data?: TChainIds extends readonly string[] ? ChainIdToRecord<TChainIds, Key> : Record<string, Key>;
    }

    // With as const - should have exact keys
    const CHAINS = ["cosmoshub-4", "osmosis-1"] as const;
    type ResultWithConst = HookResult<typeof CHAINS>;

    // Type checker should know these keys exist
    const testData: ResultWithConst = {
      data: {
        "cosmoshub-4": {} as Key,
        "osmosis-1": {} as Key,
      },
    };

    // Should have exact types
    if (testData.data) {
      expectTypeOf(testData.data["cosmoshub-4"]).toEqualTypeOf<Key>();
      expectTypeOf(testData.data["osmosis-1"]).toEqualTypeOf<Key>();
    }
  });

  it("should handle undefined chainId gracefully", () => {
    interface HookResult<TChainIds extends readonly string[] | undefined> {
      data?: TChainIds extends readonly string[] ? ChainIdToRecord<TChainIds, Key> : Record<string, Key>;
    }

    type ResultWithoutChainId = HookResult<undefined>;

    const testData: ResultWithoutChainId = {
      data: {
        "cosmoshub-4": {} as Key,
        "osmosis-1": {} as Key,
        "any-chain": {} as Key,
      },
    };

    // Should accept any string key
    expectTypeOf(testData.data).toMatchTypeOf<Record<string, Key> | undefined>();
  });
});
