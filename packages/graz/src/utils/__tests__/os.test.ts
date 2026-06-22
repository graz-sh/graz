import { afterEach, describe, expect, it, vi } from "vitest";

import { isAndroid, isIos, isMobile } from "../os";

const setUserAgent = (userAgent: string) => {
  vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue(userAgent);
};

describe("os utilities", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("detects Android devices", () => {
    setUserAgent("Mozilla/5.0 (Linux; Android 14; Pixel)");

    expect(isMobile()).toBe(true);
    expect(isAndroid()).toBe(true);
    expect(isIos()).toBe(false);
  });

  it("detects iOS devices", () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)");

    expect(isMobile()).toBe(true);
    expect(isAndroid()).toBe(false);
    expect(isIos()).toBe(true);
  });

  it("treats desktop user agents as non-mobile", () => {
    setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)");

    expect(isMobile()).toBe(false);
    expect(isAndroid()).toBe(false);
    expect(isIos()).toBe(false);
  });
});
