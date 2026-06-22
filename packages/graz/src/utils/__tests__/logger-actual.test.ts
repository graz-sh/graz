import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LogCategory, LogLevel } from "../../types/logger";
import { configureLogger, getLogger } from "../logger";

describe("real Graz logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "group").mockImplementation(() => {});
    vi.spyOn(console, "groupEnd").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "trace").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    configureLogger({ enabled: false });
    window.__GRAZ_DEBUG__ = false;
    vi.restoreAllMocks();
  });

  it("filters by level and category and strips function metadata from context", () => {
    configureLogger({
      categories: ["WALLET"],
      enabled: true,
      level: LogLevel.INFO,
    });
    const logger = getLogger();

    logger.info(LogCategory.WALLET, "connected", {
      function: "connect",
      walletType: "keplr",
    });
    logger.debug(LogCategory.WALLET, "hidden");
    logger.warn(LogCategory.QUERY, "hidden");

    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    const infoCall = vi.mocked(console.info).mock.calls[0];
    expect(infoCall?.[0]).toEqual(expect.stringContaining("[connect]"));
    expect(infoCall?.at(-1)).toEqual({ walletType: "keplr" });
  });

  it("reports errors, supports exact level arrays, timers, and groups", () => {
    const errorReporter = {
      captureException: vi.fn(),
    };
    configureLogger({
      enabled: true,
      errorReporter,
      level: [LogLevel.ERROR, LogLevel.TRACE],
    });
    const logger = getLogger();

    logger.error(LogCategory.WALLET, "failed", { hook: "useConnect" });
    logger.trace(LogCategory.EVENT, "trace event");
    logger.info(LogCategory.WALLET, "hidden");
    logger.time("connect");
    logger.timeEnd("connect");
    logger.group("Connect Wallet");
    logger.groupEnd();

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.trace).toHaveBeenCalledTimes(1);
    expect(console.info).not.toHaveBeenCalled();
    expect(errorReporter.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        category: LogCategory.WALLET,
      }),
    );
    const debugCall = vi.mocked(console.debug).mock.calls[0];
    expect(debugCall?.[0]).toEqual(expect.stringContaining("connect:"));
    expect(console.group).toHaveBeenCalledWith("[graz] Connect Wallet");
    expect(console.groupEnd).toHaveBeenCalledTimes(1);
  });

  it("can be toggled dynamically and honors the global debug flag", () => {
    window.__GRAZ_DEBUG__ = true;
    configureLogger({});
    const logger = getLogger();

    logger.info(LogCategory.WALLET, "debug flag enabled");
    expect(console.info).toHaveBeenCalledTimes(1);

    logger.disable();
    logger.info(LogCategory.WALLET, "hidden");
    expect(console.info).toHaveBeenCalledTimes(1);

    logger.enable();
    logger.setLevel(LogLevel.ERROR);
    logger.setCategories(["TRANSACTION"]);
    logger.error(LogCategory.WALLET, "hidden");
    logger.error(LogCategory.TRANSACTION, "shown");

    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
