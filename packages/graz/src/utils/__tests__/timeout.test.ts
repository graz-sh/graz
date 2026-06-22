import { afterEach, describe, expect, it, vi } from "vitest";

import { promiseWithTimeout } from "../timeout";

describe("promiseWithTimeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves with the original promise value before timeout", async () => {
    await expect(promiseWithTimeout(Promise.resolve("done"), 100)).resolves.toBe("done");
  });

  it("rejects with the provided timeout error", async () => {
    vi.useFakeTimers();
    const timeoutError = new Error("too slow");
    const promise = promiseWithTimeout(new Promise(() => undefined), 100, timeoutError);
    const expectation = expect(promise).rejects.toThrow(timeoutError);

    await vi.advanceTimersByTimeAsync(100);

    await expectation;
  });
});
