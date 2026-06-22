import { describe, expect, it } from "vitest";

import { isEmpty } from "../isEmpty";

describe("isEmpty", () => {
  it("treats nullish and empty records as empty", () => {
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty({})).toBe(true);
  });

  it("treats records with own keys as non-empty", () => {
    expect(isEmpty({ cosmoshub: "cosmos1..." })).toBe(false);
  });
});
