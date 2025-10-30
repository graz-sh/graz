import type { ErrorReporter, Logger, LoggerOptions, LogLevel } from "../types/logger";
import { LogCategory, LogLevel as LogLevelEnum } from "../types/logger";

/**
 * GrazLogger implementation
 */
class GrazLogger implements Logger {
  private level: LogLevel | LogLevel[] | undefined;
  private categories: Set<string>;
  private enabled: boolean;
  private timers: Map<string, number>;
  private errorReporter?: ErrorReporter;

  // Color scheme for log levels
  private readonly levelColors = {
    error: "color: #ff4444; font-weight: bold;",
    warn: "color: #ff9800; font-weight: bold;",
    info: "color: #2196f3; font-weight: bold;",
    debug: "color: #4caf50; font-weight: bold;",
    trace: "color: #9e9e9e; font-weight: bold;",
    reset: "color: inherit; font-weight: normal;",
  };

  // Color scheme for categories
  private readonly categoryColors: Record<string, string> = {
    [LogCategory.WALLET]: "color: #9c27b0; font-weight: bold;", // Purple
    [LogCategory.TRANSACTION]: "color: #e91e63; font-weight: bold;", // Pink
    [LogCategory.QUERY]: "color: #00bcd4; font-weight: bold;", // Cyan
    [LogCategory.STORE]: "color: #ff5722; font-weight: bold;", // Deep Orange
    [LogCategory.MULTICHAIN]: "color: #3f51b5; font-weight: bold;", // Indigo
    [LogCategory.EVENT]: "color: #ffc107; font-weight: bold;", // Amber
    [LogCategory.PERFORMANCE]: "color: #4caf50; font-weight: bold;", // Green
  };

  // Color scheme for function names (high contrast colors)
  private readonly functionColors: Record<string, string> = {
    // Account actions
    connect: "color: #00e5ff; font-weight: bold;", // Bright Cyan
    disconnect: "color: #00e676; font-weight: bold;", // Bright Green
    reconnect: "color: #ff6d00; font-weight: bold;", // Bright Orange
    // Wallet actions
    getWallet: "color: #d500f9; font-weight: bold;", // Bright Purple
    // Chain actions
    clearRecentChain: "color: #ff1744; font-weight: bold;", // Bright Red
    getRecentChainIds: "color: #f50057; font-weight: bold;", // Bright Pink
    getRecentChains: "color: #ff4081; font-weight: bold;", // Hot Pink
    getChainInfo: "color: #e040fb; font-weight: bold;", // Bright Purple
    getChainInfos: "color: #b388ff; font-weight: bold;", // Light Violet
    addChain: "color: #8c9eff; font-weight: bold;", // Periwinkle
    suggestChain: "color: #536dfe; font-weight: bold;", // Bright Indigo
    suggestChainAndConnect: "color: #448aff; font-weight: bold;", // Bright Blue
    // Transaction methods
    sendTokens: "color: #18ffff; font-weight: bold;", // Aqua
    sendIbcTokens: "color: #40c4ff; font-weight: bold;", // Sky Blue
    instantiateContract: "color: #69f0ae; font-weight: bold;", // Mint Green
    executeContract: "color: #b2ff59; font-weight: bold;", // Lime Green
    // Query methods
    getQuerySmart: "color: #eeff41; font-weight: bold;", // Bright Yellow
    getQueryRaw: "color: #ffea00; font-weight: bold;", // Golden Yellow
    // Multi-chain utilities
    createMultiChainAsyncFunction: "color: #7c4dff; font-weight: bold;", // Vivid Purple
    // Event handlers
    handleFocus: "color: #ff9100; font-weight: bold;", // Bright Orange
    autoConnectIframe: "color: #ff6e40; font-weight: bold;", // Coral
    reconnectEffect: "color: #a1887f; font-weight: bold;", // Tan
    subscription: "color: #90caf9; font-weight: bold;", // Light Blue
  };

  // Color scheme for hook names (high contrast colors)
  private readonly hookColors: Record<string, string> = {
    // Account hooks
    useConnect: "color: #00e5ff; font-weight: bold;", // Bright Cyan
    useDisconnect: "color: #1de9b6; font-weight: bold;", // Bright Teal
    // Wallet hooks
    useCheckWallet: "color: #d500f9; font-weight: bold;", // Bright Purple
    // Chain hooks
    useAddChain: "color: #aa00ff; font-weight: bold;", // Vivid Purple
    useSuggestChain: "color: #6200ea; font-weight: bold;", // Deep Violet
    useSuggestChainAndConnect: "color: #651fff; font-weight: bold;", // Bright Indigo
    // Client hooks
    useStargateClient: "color: #2979ff; font-weight: bold;", // Bright Blue
    useCosmWasmClient: "color: #2962ff; font-weight: bold;", // Royal Blue
    // Signing client hooks
    useStargateSigningClient: "color: #448aff; font-weight: bold;", // Sky Blue
    useCosmWasmSigningClient: "color: #536dfe; font-weight: bold;", // Periwinkle
    // Transaction hooks
    useSendTokens: "color: #00e676; font-weight: bold;", // Bright Green
    useSendIbcTokens: "color: #76ff03; font-weight: bold;", // Neon Green
    useInstantiateContract: "color: #c6ff00; font-weight: bold;", // Yellow Green
    useExecuteContract: "color: #aeea00; font-weight: bold;", // Lime
  };

  constructor(options?: LoggerOptions) {
    // Check for global debug flag
    const isDebugEnabled = typeof window !== "undefined" && window.__GRAZ_DEBUG__;

    // If level not specified, default to undefined (log all levels)
    this.level = options?.level;
    this.categories = new Set(options?.categories ?? []);
    // Only enable if explicitly set or if global debug flag is on
    this.enabled = options?.enabled ?? isDebugEnabled ?? false;
    this.timers = new Map();
    this.errorReporter = options?.errorReporter;
  }

  private formatLog(
    level: string,
    category: LogCategory,
    message: string,
    functionName?: string,
  ): [string, ...string[]] {
    const functionPart = functionName ? `%c[${functionName}]%c ` : "";
    let functionColor = "color: #00e5ff; font-weight: bold;"; // Default bright cyan

    // Get specific color for function/hook name
    if (functionName) {
      functionColor = this.hookColors[functionName] || this.functionColors[functionName] || functionColor;
    }

    const functionStyles = functionName ? [functionColor, this.levelColors.reset] : [];

    return [
      `%c[graz]%c %c${level.toUpperCase()}%c %c[${category}]%c ${functionPart}${message}`,
      "color: #673ab7; font-weight: bold;", // [graz]
      this.levelColors.reset,
      this.levelColors[level as keyof typeof this.levelColors] || this.levelColors.reset, // level
      this.levelColors.reset,
      this.categoryColors[category] || this.levelColors.reset, // [category] - unique color per category
      this.levelColors.reset,
      ...functionStyles,
    ] as [string, ...string[]];
  }

  error(category: LogCategory, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevelEnum.ERROR, category)) return;

    const functionName = (context?.function || context?.hook) as string | undefined;
    const [format, ...styles] = this.formatLog("error", category, message, functionName);

    // Remove function/hook from context since it's now in the log format
    const cleanContext = context ? { ...context } : undefined;
    if (cleanContext) {
      delete cleanContext.function;
      delete cleanContext.hook;
    }

    console.error(format, ...styles, Object.keys(cleanContext || {}).length > 0 ? cleanContext : "");

    // Send to error tracking if available
    const reporter = this.errorReporter || (typeof window !== "undefined" && window.grazErrorReporter);
    if (reporter) {
      const error = new Error(message);
      reporter.captureException(error, {
        category,
        context,
      });
    }
  }

  warn(category: LogCategory, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevelEnum.WARN, category)) return;
    const functionName = (context?.function || context?.hook) as string | undefined;
    const [format, ...styles] = this.formatLog("warn", category, message, functionName);

    // Remove function/hook from context since it's now in the log format
    const cleanContext = context ? { ...context } : undefined;
    if (cleanContext) {
      delete cleanContext.function;
      delete cleanContext.hook;
    }

    console.warn(format, ...styles, Object.keys(cleanContext || {}).length > 0 ? cleanContext : "");
  }

  info(category: LogCategory, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevelEnum.INFO, category)) return;
    const functionName = (context?.function || context?.hook) as string | undefined;
    const [format, ...styles] = this.formatLog("info", category, message, functionName);

    // Remove function/hook from context since it's now in the log format
    const cleanContext = context ? { ...context } : undefined;
    if (cleanContext) {
      delete cleanContext.function;
      delete cleanContext.hook;
    }

    console.info(format, ...styles, Object.keys(cleanContext || {}).length > 0 ? cleanContext : "");
  }

  debug(category: LogCategory, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevelEnum.DEBUG, category)) return;
    const functionName = (context?.function || context?.hook) as string | undefined;
    const [format, ...styles] = this.formatLog("debug", category, message, functionName);

    // Remove function/hook from context since it's now in the log format
    const cleanContext = context ? { ...context } : undefined;
    if (cleanContext) {
      delete cleanContext.function;
      delete cleanContext.hook;
    }

    console.debug(format, ...styles, Object.keys(cleanContext || {}).length > 0 ? cleanContext : "");
  }

  trace(category: LogCategory, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevelEnum.TRACE, category)) return;
    const functionName = (context?.function || context?.hook) as string | undefined;
    const [format, ...styles] = this.formatLog("trace", category, message, functionName);

    // Remove function/hook from context since it's now in the log format
    const cleanContext = context ? { ...context } : undefined;
    if (cleanContext) {
      delete cleanContext.function;
      delete cleanContext.hook;
    }

    console.trace(format, ...styles, Object.keys(cleanContext || {}).length > 0 ? cleanContext : "");
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
      const [format, ...styles] = this.formatLog(
        "debug",
        LogCategory.PERFORMANCE,
        `⏱️  ${label}: ${duration.toFixed(2)}ms`,
      );
      console.debug(format, ...styles);
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

  private shouldLog(level: LogLevel, category: LogCategory): boolean {
    if (!this.enabled) return false;

    // Check level filtering
    if (this.level !== undefined) {
      if (Array.isArray(this.level)) {
        // Array mode: only log if level is in the array
        if (!this.level.includes(level)) return false;
      } else {
        // Single value mode: minimum level (current behavior)
        if (level > this.level) return false;
      }
    }
    // If level is undefined, log all levels

    // Check category filtering
    // Only filter if categories is explicitly set and has items
    if (this.categories.size > 0 && !this.categories.has(category)) return false;
    // If categories is empty (size === 0), log all categories

    return true;
  }

  setLevel(level: LogLevel | LogLevel[] | undefined): void {
    this.level = level;
  }

  setCategories(categories: (keyof typeof LogCategory)[] | undefined): void {
    this.categories = new Set(categories ?? []);
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }
}

// Singleton instance
let loggerInstance: Logger | undefined;

/**
 * Get the singleton logger instance
 * @returns Logger instance
 */
export const getLogger = (): Logger => {
  if (!loggerInstance) {
    loggerInstance = new GrazLogger();
  }
  return loggerInstance;
};

/**
 * Configure the logger with custom options
 * This will recreate the logger instance with new options
 * @param options Logger configuration options
 */
export const configureLogger = (options: LoggerOptions): void => {
  loggerInstance = new GrazLogger(options);
};
