/**
 * Type tests for ChainIdToRecord utility type
 */

import type { Key } from "@keplr-wallet/types";
import { describe, expectTypeOf, it } from "vitest";

import type { ChainIdToRecord } from "../hooks";

describe("ChainIdToRecord Type Utility", () => {
  it("should map single chain ID to exact type", () => {
    type Result = ChainIdToRecord<readonly ["cosmoshub-4"], string>;

    expectTypeOf<Result>().toEqualTypeOf<{
      "cosmoshub-4": string;
    }>();

    // Should have exact key
    type Keys = keyof Result;
    expectTypeOf<Keys>().toEqualTypeOf<"cosmoshub-4">();
  });

  it("should map multiple chain IDs to exact types", () => {
    type Result = ChainIdToRecord<readonly ["cosmoshub-4", "osmosis-1", "juno-1"], number>;

    expectTypeOf<Result>().toEqualTypeOf<{
      "cosmoshub-4": number;
      "osmosis-1": number;
      "juno-1": number;
    }>();

    // Should have exact keys
    type Keys = keyof Result;
    expectTypeOf<Keys>().toEqualTypeOf<"cosmoshub-4" | "osmosis-1" | "juno-1">();
  });

  it("should work with complex types", () => {
    type Result = ChainIdToRecord<readonly ["cosmoshub-4", "osmosis-1"], Key>;

    // Should have the correct structure
    type CosmosKey = Result["cosmoshub-4"];
    expectTypeOf<CosmosKey>().toMatchTypeOf<Key>();

    type OsmosisKey = Result["osmosis-1"];
    expectTypeOf<OsmosisKey>().toMatchTypeOf<Key>();
  });

  it("should preserve literal types", () => {
    const CHAINS = ["cosmoshub-4", "osmosis-1"] as const;
    type Result = ChainIdToRecord<typeof CHAINS, string>;

    // Type should know exact keys
    type Keys = keyof Result;
    expectTypeOf<Keys>().toEqualTypeOf<"cosmoshub-4" | "osmosis-1">();

    // This should be valid
    const result: Result = {
      "cosmoshub-4": "test1",
      "osmosis-1": "test2",
    };
    expectTypeOf(result).toEqualTypeOf<Result>();
  });
});
