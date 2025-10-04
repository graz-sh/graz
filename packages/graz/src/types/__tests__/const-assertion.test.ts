/**
 * Type tests for const assertion behavior
 */

import { describe, it, expectTypeOf } from "vitest";

describe("Const Assertion Behavior", () => {
  it("should preserve exact types with as const", () => {
    const chains1 = ["cosmoshub-4", "osmosis-1"] as const;
    type Chains1 = typeof chains1;

    expectTypeOf<Chains1>().toEqualTypeOf<readonly ["cosmoshub-4", "osmosis-1"]>();
    expectTypeOf<Chains1[0]>().toEqualTypeOf<"cosmoshub-4">();
    expectTypeOf<Chains1[1]>().toEqualTypeOf<"osmosis-1">();
  });

  it("should have generic type without as const", () => {
    const chains2 = ["cosmoshub-4", "osmosis-1"];
    type Chains2 = typeof chains2;

    expectTypeOf<Chains2>().toEqualTypeOf<string[]>();
    expectTypeOf<Chains2[0]>().toMatchTypeOf<string | undefined>();
  });

  it("should work with readonly arrays", () => {
    const chains: readonly string[] = ["cosmoshub-4", "osmosis-1"];
    type Chains = typeof chains;

    expectTypeOf<Chains>().toEqualTypeOf<readonly string[]>();
  });

  it("should extract union from readonly tuple", () => {
    type Chains = readonly ["cosmoshub-4", "osmosis-1", "juno-1"];
    type Union = Chains[number];

    expectTypeOf<Union>().toEqualTypeOf<"cosmoshub-4" | "osmosis-1" | "juno-1">();
  });

  it("should work with single element tuple", () => {
    type Chains = readonly ["cosmoshub-4"];
    type Union = Chains[number];

    expectTypeOf<Union>().toEqualTypeOf<"cosmoshub-4">();
  });

  it("should return never for empty tuple", () => {
    type Chains = readonly [];
    type Union = Chains[number];

    expectTypeOf<Union>().toEqualTypeOf<never>();
  });
});
