import { describe, expect, it } from "vitest";

import {
  convertDenomToMicroDenom,
  convertFromMicroDenom,
  convertMicroDenomToDenom,
  convertToFixedDecimals,
  formatTokenName,
  handleNaN,
} from "../conversion";

describe("conversion utilities", () => {
  it("converts between denom and micro denom", () => {
    expect(convertMicroDenomToDenom(1234567, 6)).toBe(1.234567);
    expect(convertMicroDenomToDenom("42", 0)).toBe(42);
    expect(convertDenomToMicroDenom(1.234567, 6)).toBe(1234567);
    expect(convertDenomToMicroDenom("42", 0)).toBe(42);
  });

  it("normalizes invalid numbers to zero where guarded", () => {
    expect(convertMicroDenomToDenom("not-a-number", 6)).toBe(0);
    expect(handleNaN(Number.NaN)).toBe(0);
    expect(handleNaN(5)).toBe(5);
  });

  it("formats denominations and display values", () => {
    expect(convertFromMicroDenom("uatom")).toBe("ATOM");
    expect(convertToFixedDecimals(12.345)).toBe("12.35");
    expect(convertToFixedDecimals(0.005)).toBe("0.005");
    expect(formatTokenName("oSMo")).toBe("Osmo");
    expect(formatTokenName("")).toBe("");
  });
});
