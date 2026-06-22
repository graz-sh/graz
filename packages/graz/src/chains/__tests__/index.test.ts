import { describe, expect, it } from "vitest";

import { makeChainInfo } from "../../__tests__/fixtures";
import { defineChainInfo, defineChains } from "../index";

describe("chain definition helpers", () => {
  it("returns the exact chain info object for type-safe definitions", () => {
    const chain = makeChainInfo();

    expect(defineChainInfo(chain)).toBe(chain);
  });

  it("returns the exact chain record for type-safe maps", () => {
    const chains = {
      cosmoshub: makeChainInfo(),
      osmosis: makeChainInfo("osmosis-1"),
    };

    expect(defineChains(chains)).toBe(chains);
  });
});
