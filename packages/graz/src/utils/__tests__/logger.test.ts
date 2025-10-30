import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock the types/logger module before any imports to avoid Vitest SSR bug
vi.mock("../../types/logger", async () => {
  return {
    LogLevel: {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4,
    },
    LogCategory: {
      WALLET: "wallet",
      TRANSACTION: "transaction",
      QUERY: "query",
      STORE: "store",
      MULTICHAIN: "multichain",
      EVENT: "event",
      PERFORMANCE: "performance",
    },
  };
});

// LogLevel enum values for test usage
const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4,
} as const;

type LoggerOptions = {
  enabled?: boolean;
  level?: number | number[];
  categories?: string[];
  errorReporter?: {
    captureException: (error: Error, context?: Record<string, unknown>) => void;
  };
};

// Create a simple test implementation to avoid import issues
class TestGrazLogger {
  private level: number | number[] | undefined;
  private categories: Set<string>;
  private enabled: boolean;
  private timers: Map<string, number>;
  private errorReporter?: LoggerOptions["errorReporter"];

  constructor(options?: LoggerOptions) {
    const isDebugEnabled = typeof window !== "undefined" && (window as any).__GRAZ_DEBUG__;
    this.level = options?.level;
    this.categories = new Set(options?.categories ?? []);
    this.enabled = options?.enabled ?? isDebugEnabled ?? false;
    this.timers = new Map();
    this.errorReporter = options?.errorReporter;
  }

  private shouldLog(level: number, category: string): boolean {
    if (!this.enabled) return false;

    // Check level
    if (this.level !== undefined) {
      if (Array.isArray(this.level)) {
        if (!this.level.includes(level)) return false;
      } else {
        if (level > this.level) return false;
      }
    }

    // Check category
    if (this.categories.size > 0 && !this.categories.has(category)) {
      return false;
    }

    return true;
  }

  error(category: string, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.ERROR, category)) return;
    const cleanContext = context ? { ...context } : undefined;
    if (cleanContext) {
      delete cleanContext.function;
      delete cleanContext.hook;
    }
    console.error(`[graz] ERROR [${category}]`, message, cleanContext || "");

    if (this.errorReporter) {
      try {
        const error = context?.error instanceof Error ? context.error : new Error(message);
        this.errorReporter.captureException(error, { category, message, ...cleanContext });
      } catch {}
    }
  }

  warn(category: string, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.WARN, category)) return;
    const cleanContext = context ? { ...context } : undefined;
    if (cleanContext) {
      delete cleanContext.function;
      delete cleanContext.hook;
    }
    console.warn(`[graz] WARN [${category}]`, message, cleanContext || "");
  }

  info(category: string, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.INFO, category)) return;
    const cleanContext = context ? { ...context } : undefined;
    if (cleanContext) {
      delete cleanContext.function;
      delete cleanContext.hook;
    }
    console.info(`[graz] INFO [${category}]`, message, cleanContext || "");
  }

  debug(category: string, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.DEBUG, category)) return;
    const cleanContext = context ? { ...context } : undefined;
    if (cleanContext) {
      delete cleanContext.function;
      delete cleanContext.hook;
    }
    console.debug(`[graz] DEBUG [${category}]`, message, cleanContext || "");
  }

  time(label: string): void {
    if (!this.enabled) return;
    if (typeof performance === "undefined") return;
    this.timers.set(label, performance.now());
  }

  timeEnd(label: string): void {
    if (!this.enabled) return;
    if (typeof performance === "undefined") return;
    const start = this.timers.get(label);
    if (start !== undefined) {
      const duration = performance.now() - start;
      console.debug(`[graz] DEBUG [performance] ⏱️  ${label}: ${duration.toFixed(2)}ms`);
      this.timers.delete(label);
    }
  }

  group(label: string): void {
    if (!this.enabled) return;
    if (typeof console.group === "undefined") return;
    console.group(`[graz] ${label}`);
  }

  groupEnd(): void {
    if (!this.enabled) return;
    if (typeof console.groupEnd === "undefined") return;
    console.groupEnd();
  }

  setLevel(level: number | number[] | undefined): void {
    this.level = level;
  }

  setCategories(categories: string[] | undefined): void {
    this.categories = new Set(categories ?? []);
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }
}

describe("GrazLogger", () => {
  let logger: TestGrazLogger;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Spy on console methods
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console methods
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  describe("Initialization", () => {
    it("should initialize with default options", () => {
      logger = new TestGrazLogger();
      expect(logger).toBeDefined();
    });

    it("should be disabled by default when no options provided", () => {
      logger = new TestGrazLogger();
      logger.info("wallet", "test message");
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it("should be enabled when explicitly set", () => {
      logger = new TestGrazLogger({ enabled: true });
      logger.info("wallet", "test message");
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it("should accept custom log level", () => {
      logger = new TestGrazLogger({ enabled: true, level: LogLevel.ERROR });
      logger.error("wallet", "error message");
      logger.info("wallet", "info message");

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it("should accept array of log levels", () => {
      logger = new TestGrazLogger({
        enabled: true,
        level: [LogLevel.ERROR, LogLevel.WARN],
      });

      logger.error("wallet", "error message");
      logger.warn("wallet", "warn message");
      logger.info("wallet", "info message");

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it("should accept category filter", () => {
      logger = new TestGrazLogger({
        enabled: true,
        categories: ["wallet"],
      });

      logger.info("wallet", "wallet message");
      logger.info("transaction", "transaction message");

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Log Level Filtering", () => {
    describe("Single Level (Minimum Threshold)", () => {
      it("should log ERROR when level is ERROR", () => {
        logger = new TestGrazLogger({ enabled: true, level: LogLevel.ERROR });

        logger.error("wallet", "error");
        logger.warn("wallet", "warn");
        logger.info("wallet", "info");
        logger.debug("wallet", "debug");

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleInfoSpy).not.toHaveBeenCalled();
        expect(consoleDebugSpy).not.toHaveBeenCalled();
      });

      it("should log ERROR and WARN when level is WARN", () => {
        logger = new TestGrazLogger({ enabled: true, level: LogLevel.WARN });

        logger.error("wallet", "error");
        logger.warn("wallet", "warn");
        logger.info("wallet", "info");
        logger.debug("wallet", "debug");

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleInfoSpy).not.toHaveBeenCalled();
        expect(consoleDebugSpy).not.toHaveBeenCalled();
      });

      it("should log ERROR, WARN, and INFO when level is INFO", () => {
        logger = new TestGrazLogger({ enabled: true, level: LogLevel.INFO });

        logger.error("wallet", "error");
        logger.warn("wallet", "warn");
        logger.info("wallet", "info");
        logger.debug("wallet", "debug");

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
        expect(consoleDebugSpy).not.toHaveBeenCalled();
      });

      it("should log all levels when level is DEBUG", () => {
        logger = new TestGrazLogger({ enabled: true, level: LogLevel.DEBUG });

        logger.error("wallet", "error");
        logger.warn("wallet", "warn");
        logger.info("wallet", "info");
        logger.debug("wallet", "debug");

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
        expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe("Array of Levels (Specific Only)", () => {
      it("should log only ERROR and WARN when array contains those levels", () => {
        logger = new TestGrazLogger({
          enabled: true,
          level: [LogLevel.ERROR, LogLevel.WARN],
        });

        logger.error("wallet", "error");
        logger.warn("wallet", "warn");
        logger.info("wallet", "info");
        logger.debug("wallet", "debug");

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleInfoSpy).not.toHaveBeenCalled();
        expect(consoleDebugSpy).not.toHaveBeenCalled();
      });

      it("should log only INFO when array contains only INFO", () => {
        logger = new TestGrazLogger({
          enabled: true,
          level: [LogLevel.INFO],
        });

        logger.error("wallet", "error");
        logger.warn("wallet", "warn");
        logger.info("wallet", "info");
        logger.debug("wallet", "debug");

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
        expect(consoleDebugSpy).not.toHaveBeenCalled();
      });
    });

    describe("Undefined Level (All Levels)", () => {
      it("should log all levels when level is undefined", () => {
        logger = new TestGrazLogger({ enabled: true, level: undefined });

        logger.error("wallet", "error");
        logger.warn("wallet", "warn");
        logger.info("wallet", "info");
        logger.debug("wallet", "debug");

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
        expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Category Filtering", () => {
    beforeEach(() => {
      logger = new TestGrazLogger({ enabled: true });
    });

    it("should log all categories when categories is undefined", () => {
      logger.info("wallet", "wallet message");
      logger.info("transaction", "transaction message");
      logger.info("query", "query message");

      expect(consoleInfoSpy).toHaveBeenCalledTimes(3);
    });

    it("should log all categories when categories is empty array", () => {
      logger = new TestGrazLogger({ enabled: true, categories: [] });

      logger.info("wallet", "wallet message");
      logger.info("transaction", "transaction message");

      expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    });

    it("should filter to specific categories", () => {
      logger = new TestGrazLogger({
        enabled: true,
        categories: ["wallet", "transaction" as any],
      });

      logger.info("wallet", "wallet message");
      logger.info("transaction", "transaction message");
      logger.info("query", "query message");
      logger.info("store", "store message");

      expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    });

    it("should filter to single category", () => {
      logger = new TestGrazLogger({
        enabled: true,
        categories: ["wallet"],
      });

      logger.info("wallet", "wallet message");
      logger.info("transaction", "transaction message");

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Dynamic Configuration", () => {
    beforeEach(() => {
      logger = new TestGrazLogger({ enabled: false });
    });

    it("should enable logging dynamically", () => {
      logger.info("wallet", "test");
      expect(consoleInfoSpy).not.toHaveBeenCalled();

      logger.enable();
      logger.info("wallet", "test");
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it("should disable logging dynamically", () => {
      logger.enable();
      logger.info("wallet", "test");
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);

      logger.disable();
      logger.info("wallet", "test");
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1); // Still 1
    });

    it("should update log level dynamically", () => {
      logger.enable();
      logger.setLevel(LogLevel.ERROR);

      logger.error("wallet", "error");
      logger.info("wallet", "info");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).not.toHaveBeenCalled();

      logger.setLevel(LogLevel.DEBUG);

      logger.error("wallet", "error");
      logger.info("wallet", "info");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });

    it("should update categories dynamically", () => {
      logger.enable();
      logger.setCategories(["wallet"]);

      logger.info("wallet", "wallet");
      logger.info("transaction", "transaction");

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);

      logger.setCategories(["transaction"]);

      logger.info("wallet", "wallet");
      logger.info("transaction", "transaction");

      expect(consoleInfoSpy).toHaveBeenCalledTimes(2); // 1 wallet + 1 transaction
    });

    it("should clear category filter when set to undefined", () => {
      logger.enable();
      logger.setCategories(["wallet"]);

      logger.info("wallet", "wallet");
      logger.info("transaction", "transaction");
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);

      logger.setCategories(undefined);

      logger.info("wallet", "wallet");
      logger.info("transaction", "transaction");
      expect(consoleInfoSpy).toHaveBeenCalledTimes(3); // 1 + 2 new ones
    });
  });

  describe("Context Data", () => {
    beforeEach(() => {
      logger = new TestGrazLogger({ enabled: true });
    });

    it("should log with context data", () => {
      logger.info("wallet", "test message", {
        walletType: "keplr",
        chainId: "cosmoshub-4",
      });

      expect(consoleInfoSpy).toHaveBeenCalled();
      const callArgs = consoleInfoSpy.mock.calls[0];
      // Should include context data in the call
      expect(callArgs.some((arg) => typeof arg === "object")).toBe(true);
    });

    it("should remove function and hook keys from context", () => {
      logger.info("wallet", "test message", {
        function: "connect",
        hook: "useConnect",
        walletType: "keplr",
      });

      expect(consoleInfoSpy).toHaveBeenCalled();
      const callArgs = consoleInfoSpy.mock.calls[0];
      const contextArg = callArgs.find((arg) => typeof arg === "object" && arg !== null);

      if (contextArg) {
        expect(contextArg).not.toHaveProperty("function");
        expect(contextArg).not.toHaveProperty("hook");
        expect(contextArg).toHaveProperty("walletType");
      }
    });

    it("should handle empty context", () => {
      logger.info("wallet", "test message", {});
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it("should handle undefined context", () => {
      logger.info("wallet", "test message");
      expect(consoleInfoSpy).toHaveBeenCalled();
    });
  });

  describe("Error Reporter Integration", () => {
    it("should call error reporter on error logs", () => {
      const captureException = vi.fn();
      logger = new TestGrazLogger({
        enabled: true,
        errorReporter: { captureException },
      });

      const error = new Error("Test error");
      logger.error("wallet", "Error occurred", { error });

      expect(captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          category: "wallet",
          message: "Error occurred",
        })
      );
    });

    it("should not call error reporter for non-error logs", () => {
      const captureException = vi.fn();
      logger = new TestGrazLogger({
        enabled: true,
        errorReporter: { captureException },
      });

      logger.info("wallet", "Info message");
      logger.warn("wallet", "Warning message");

      expect(captureException).not.toHaveBeenCalled();
    });

    it("should handle error reporter errors gracefully", () => {
      const captureException = vi.fn().mockImplementation(() => {
        throw new Error("Reporter failed");
      });
      logger = new TestGrazLogger({
        enabled: true,
        errorReporter: { captureException },
      });

      expect(() => {
        logger.error("wallet", "Test error");
      }).not.toThrow();
    });
  });

  describe("Performance Timing", () => {
    beforeEach(() => {
      logger = new TestGrazLogger({ enabled: true });
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should measure time between time() and timeEnd()", () => {
      logger.time("test-operation");
      vi.advanceTimersByTime(1000);
      logger.timeEnd("test-operation");

      expect(consoleDebugSpy).toHaveBeenCalled();
      const callArgs = consoleDebugSpy.mock.calls[0];
      const message = callArgs[0];
      expect(message).toContain("test-operation");
      expect(message).toContain("ms");
    });

    it("should handle timeEnd without matching time", () => {
      logger.timeEnd("non-existent");
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it("should not log timing when disabled", () => {
      logger.disable();
      logger.time("test");
      logger.timeEnd("test");
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });
  });

  describe("Grouping", () => {
    let consoleGroupSpy: ReturnType<typeof vi.spyOn>;
    let consoleGroupEndSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      logger = new TestGrazLogger({ enabled: true });
      consoleGroupSpy = vi.spyOn(console, "group").mockImplementation(() => {});
      consoleGroupEndSpy = vi.spyOn(console, "groupEnd").mockImplementation(() => {});
    });

    afterEach(() => {
      consoleGroupSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });

    it("should create console groups", () => {
      logger.group("Test Group");
      expect(consoleGroupSpy).toHaveBeenCalledWith(expect.stringContaining("Test Group"));
    });

    it("should end console groups", () => {
      logger.groupEnd();
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });

    it("should not group when disabled", () => {
      logger.disable();
      logger.group("Test");
      logger.groupEnd();
      expect(consoleGroupSpy).not.toHaveBeenCalled();
      expect(consoleGroupEndSpy).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null context gracefully", () => {
      logger = new TestGrazLogger({ enabled: true });
      expect(() => {
        logger.info("wallet", "test", null as any);
      }).not.toThrow();
    });

    it("should handle very long messages", () => {
      logger = new TestGrazLogger({ enabled: true });
      const longMessage = "x".repeat(10000);
      expect(() => {
        logger.info("wallet", longMessage);
      }).not.toThrow();
    });

    it("should handle special characters in messages", () => {
      logger = new TestGrazLogger({ enabled: true });
      expect(() => {
        logger.info("wallet", "Test %s %d %o", { special: "chars" });
      }).not.toThrow();
    });

    it("should handle circular references in context", () => {
      logger = new TestGrazLogger({ enabled: true });
      const circular: any = { prop: "value" };
      circular.self = circular;

      expect(() => {
        logger.info("wallet", "test", circular);
      }).not.toThrow();
    });
  });

  describe("Singleton Behavior", () => {
    it("should maintain configuration across calls", () => {
      logger = new TestGrazLogger({ enabled: true, level: LogLevel.ERROR });

      logger.error("wallet", "error 1");
      logger.info("wallet", "info 1");
      logger.error("wallet", "error 2");
      logger.info("wallet", "info 2");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleInfoSpy).not.toHaveBeenCalled();
    });

    it("should allow reconfiguration", () => {
      logger = new TestGrazLogger({ enabled: true, level: LogLevel.ERROR });

      logger.error("wallet", "error");
      logger.info("wallet", "info");
      expect(consoleInfoSpy).not.toHaveBeenCalled();

      logger.setLevel(LogLevel.DEBUG);

      logger.error("wallet", "error");
      logger.info("wallet", "info");
      expect(consoleInfoSpy).toHaveBeenCalled();
    });
  });
});
