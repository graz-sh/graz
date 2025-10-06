# Logger Design for Graz

## Overview

This document outlines the design for a comprehensive logging and debugging system for the Graz library.

## Goals

1. **Developer Experience**: Make debugging wallet connections and transactions easier
2. **Production Monitoring**: Enable error tracking in production
3. **Performance Insights**: Track performance metrics
4. **Minimal Overhead**: Low impact on bundle size and runtime performance
5. **Configurability**: Easy to enable/disable and configure

## Requirements

### Functional Requirements

- Multiple log levels (error, warn, info, debug, trace)
- Category-based filtering (wallet, transaction, query, store)
- Structured logging with context
- Performance timing and metrics
- Integration with error tracking services (Sentry, etc.)
- Browser console integration
- Conditional logging (development vs production)

### Non-Functional Requirements

- Bundle size impact < 5 KB
- Runtime overhead < 1ms per log call
- Tree-shakeable in production
- TypeScript support
- No external dependencies (optional integrations)

## Architecture

### Core Logger Interface

```typescript
interface Logger {
  // Log levels
  error(category: string, message: string, context?: Record<string, unknown>): void;
  warn(category: string, message: string, context?: Record<string, unknown>): void;
  info(category: string, message: string, context?: Record<string, unknown>): void;
  debug(category: string, message: string, context?: Record<string, unknown>): void;
  trace(category: string, message: string, context?: Record<string, unknown>): void;

  // Performance timing
  time(label: string): void;
  timeEnd(label: string): void;

  // Grouping
  group(label: string): void;
  groupEnd(): void;

  // Configuration
  setLevel(level: LogLevel): void;
  setCategories(categories: string[]): void;
  enable(): void;
  disable(): void;
}

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

type LogCategory =
  | "wallet" // Wallet connections, disconnections
  | "transaction" // Transaction signing and broadcasting
  | "query" // Blockchain queries
  | "store" // State management
  | "multichain" // Multi-chain operations
  | "event"; // Wallet events
```

### Logger Implementation

```typescript
// packages/graz/src/utils/logger.ts

class GrazLogger implements Logger {
  private level: LogLevel = LogLevel.WARN;
  private categories: Set<string> = new Set();
  private enabled: boolean = false;
  private timers: Map<string, number> = new Map();

  constructor(options?: LoggerOptions) {
    this.level = options?.level ?? LogLevel.WARN;
    this.categories = new Set(options?.categories ?? []);
    this.enabled = options?.enabled ?? process.env.NODE_ENV === "development";
  }

  error(category: string, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.ERROR, category)) return;
    console.error(`[graz:${category}]`, message, context);

    // Send to error tracking in production
    if (typeof window !== "undefined" && window.grazErrorReporter) {
      window.grazErrorReporter.captureException(new Error(message), {
        category,
        context,
      });
    }
  }

  warn(category: string, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.WARN, category)) return;
    console.warn(`[graz:${category}]`, message, context);
  }

  info(category: string, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.INFO, category)) return;
    console.info(`[graz:${category}]`, message, context);
  }

  debug(category: string, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.DEBUG, category)) return;
    console.debug(`[graz:${category}]`, message, context);
  }

  trace(category: string, message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.TRACE, category)) return;
    console.trace(`[graz:${category}]`, message, context);
  }

  time(label: string): void {
    if (!this.enabled) return;
    this.timers.set(label, performance.now());
  }

  timeEnd(label: string): void {
    if (!this.enabled) return;
    const start = this.timers.get(label);
    if (start) {
      const duration = performance.now() - start;
      this.debug("performance", `${label}: ${duration.toFixed(2)}ms`);
      this.timers.delete(label);
    }
  }

  group(label: string): void {
    if (!this.enabled) return;
    console.group(`[graz] ${label}`);
  }

  groupEnd(): void {
    if (!this.enabled) return;
    console.groupEnd();
  }

  private shouldLog(level: LogLevel, category: string): boolean {
    if (!this.enabled) return false;
    if (level > this.level) return false;
    if (this.categories.size > 0 && !this.categories.has(category)) return false;
    return true;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setCategories(categories: string[]): void {
    this.categories = new Set(categories);
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }
}

// Singleton instance
let logger: Logger | undefined;

export const getLogger = (): Logger => {
  if (!logger) {
    logger = new GrazLogger();
  }
  return logger;
};

export const configureLogger = (options: LoggerOptions): void => {
  logger = new GrazLogger(options);
};
```

### Usage in Actions

```typescript
// packages/graz/src/actions/account.ts

import { getLogger } from "../utils/logger";

export const connect = async (args?: ConnectArgs): Promise<ConnectResult> => {
  const logger = getLogger();

  logger.time("connect");
  logger.group("Connect Wallet");

  try {
    const { chainId, walletType } = args ?? {};

    logger.debug("wallet", "Starting connection", {
      chainId,
      walletType,
      timestamp: Date.now(),
    });

    // Check wallet availability
    const isWalletAvailable = await checkWallet(walletType);
    if (!isWalletAvailable) {
      logger.warn("wallet", "Wallet not found", { walletType });
      throw new Error(`Wallet ${walletType} not found`);
    }

    // Get wallet adapter
    const wallet = getWallet(walletType);
    logger.debug("wallet", "Wallet adapter retrieved", { walletType });

    // Initialize wallet
    await wallet.init?.();
    logger.debug("wallet", "Wallet initialized");

    // Enable chains
    logger.debug("wallet", "Enabling chains", { chainId });
    await wallet.enable(chainIds);

    // Get accounts
    logger.debug("wallet", "Fetching accounts");
    const accounts = await getAccounts(wallet, chainIds);

    logger.info("wallet", "Connection successful", {
      walletType,
      chainCount: chainIds.length,
      accounts: accounts.map((a) => a.bech32Address),
    });

    // Update store
    logger.debug("store", "Updating session store", { accountCount: accounts.length });
    useGrazSessionStore.setState({
      accounts,
      status: "connected",
      activeChainIds: chainIds,
    });

    logger.timeEnd("connect");
    logger.groupEnd();

    return { accounts, walletType, chains: chainIds };
  } catch (error) {
    logger.error("wallet", "Connection failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      walletType,
      chainId,
    });

    logger.timeEnd("connect");
    logger.groupEnd();

    throw error;
  }
};
```

### Configuration via Provider

```typescript
// packages/graz/src/provider/index.tsx

<GrazProvider
  grazOptions={{
    chains,
    logger: {
      enabled: true,
      level: LogLevel.DEBUG,
      categories: ['wallet', 'transaction'],
    },
  }}
>
  <App />
</GrazProvider>
```

### Browser Extension Integration

```typescript
// Browser extension detection
if (typeof window !== "undefined" && window.__GRAZ_DEVTOOLS__) {
  const devtools = window.__GRAZ_DEVTOOLS__;

  // Send logs to extension
  logger.on("log", (entry) => {
    devtools.postMessage({
      type: "GRAZ_LOG",
      payload: entry,
    });
  });
}
```

## Log Categories

### 1. Wallet

Connection, disconnection, account changes, wallet events

**Example:**

```typescript
logger.debug("wallet", "Enabling chains", { chainIds });
logger.info("wallet", "Connected successfully", { address });
logger.error("wallet", "Connection failed", { error });
```

### 2. Transaction

Transaction signing, broadcasting, confirmation

**Example:**

```typescript
logger.debug("transaction", "Signing transaction", { msg, fee });
logger.info("transaction", "Transaction broadcasted", { txHash });
logger.error("transaction", "Transaction failed", { error, txHash });
```

### 3. Query

Blockchain queries, balance fetches, contract queries

**Example:**

```typescript
logger.debug("query", "Fetching balance", { address, denom });
logger.info("query", "Balance retrieved", { amount });
logger.warn("query", "Query timeout", { retryCount });
```

### 4. Store

State management operations

**Example:**

```typescript
logger.debug("store", "Updating accounts", { accountCount });
logger.debug("store", "Clearing session", {});
```

### 5. Multi-chain

Multi-chain operations

**Example:**

```typescript
logger.debug("multichain", "Starting parallel operations", { chainCount });
logger.info("multichain", "All chains completed", { duration });
logger.warn("multichain", "Some chains failed", { failedChains });
```

### 6. Event

Wallet events and listeners

**Example:**

```typescript
logger.debug("event", "Account changed", { newAddress });
logger.debug("event", "Chain switched", { newChainId });
```

## Performance Metrics

Track key performance indicators:

```typescript
// Automatic timing
logger.time("connect");
await connect();
logger.timeEnd("connect"); // Outputs: "connect: 234.56ms"

// Custom metrics
logger.info("performance", "Multi-chain operation", {
  chainCount: 5,
  duration: 800,
  parallelism: 3,
});
```

## Error Tracking Integration

### Sentry Example

```typescript
// In GrazProvider or user's app
import * as Sentry from "@sentry/react";

configureLogger({
  enabled: true,
  level: LogLevel.ERROR,
  errorReporter: {
    captureException: (error, context) => {
      Sentry.captureException(error, {
        tags: { category: context.category },
        extra: context.context,
      });
    },
  },
});
```

### Custom Error Reporter

```typescript
window.grazErrorReporter = {
  captureException: (error, context) => {
    // Send to your error tracking service
    fetch("/api/errors", {
      method: "POST",
      body: JSON.stringify({ error, context }),
    });
  },
};
```

## Production Considerations

### Bundle Size Optimization

```typescript
// Use environment-based tree-shaking
const logger = process.env.NODE_ENV === "development" ? getLogger() : createNoopLogger(); // Returns no-op functions

// Or use build-time replacement
if (__DEV__) {
  logger.debug("wallet", "Debug info");
}
```

### Performance Impact

- Check enabled state before expensive operations
- Lazy evaluation of context objects
- Debounce high-frequency logs

```typescript
// Good: Lazy evaluation
logger.debug("query", "Result", () => ({
  data: expensiveSerialize(result),
}));

// Bad: Always evaluates
logger.debug("query", "Result", {
  data: expensiveSerialize(result), // Runs even if logging disabled
});
```

## Testing

```typescript
// Mock logger in tests
const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Verify logging behavior
expect(mockLogger.error).toHaveBeenCalledWith(
  "wallet",
  "Connection failed",
  expect.objectContaining({ walletType: "keplr" }),
);
```

## Future Enhancements

1. **Log Export**: Export logs to file for debugging
2. **Log Filtering UI**: In-browser log filtering interface
3. **Performance Profiler**: Detailed performance analysis
4. **Network Logs**: Track RPC/REST requests
5. **Redux DevTools**: Integration with Redux DevTools extension
6. **Log Aggregation**: Send logs to centralized logging service

## Implementation Checklist

- [ ] Create logger utility with core interface
- [ ] Add logger configuration to GrazProvider
- [ ] Integrate logger into all actions
- [ ] Add performance timing to critical paths
- [ ] Create documentation and examples
- [ ] Add tests for logger functionality
- [ ] Create browser extension for log viewing
- [ ] Add error tracking integration examples
- [ ] Optimize for production bundle size
- [ ] Add TypeScript types and exports

## References

- [Pino Logger](https://getpino.io/) - Inspiration for structured logging
- [Debug Module](https://github.com/debug-js/debug) - Namespace-based logging
- [Sentry](https://docs.sentry.io/) - Error tracking integration
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) - Browser extension integration
