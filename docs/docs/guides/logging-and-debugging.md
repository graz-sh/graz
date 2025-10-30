---
title: Logging and Debugging
---

# Logging and Debugging

Graz includes a comprehensive logging system to help you debug wallet connections, transactions, and multi-chain operations during development and monitor errors in production.

:::info
**Logging is disabled by default** and must be explicitly enabled through configuration.
:::

## Quick Start

### Enable Logging via GrazProvider

The easiest way to enable logging is through the `GrazProvider`:

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider, LogLevel, LogCategory } from "graz";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: [cosmoshubChainInfo, osmosisChainInfo],
          logger: {
            enabled: true, // Must explicitly enable
            level: LogLevel.DEBUG,
            categories: [LogCategory.WALLET, LogCategory.TRANSACTION],
          },
        }}
      >
        <YourApp />
      </GrazProvider>
    </QueryClientProvider>
  );
}
```

### Enable Logging via configureGraz

You can also configure logging directly:

```tsx
import { configureGraz, LogLevel, LogCategory } from "graz";

configureGraz({
  chains: [cosmoshubChainInfo, osmosisChainInfo],
  logger: {
    enabled: true, // Must explicitly enable
    level: LogLevel.INFO,
    categories: [LogCategory.WALLET],
  },
});
```

This is useful when:
- You're not using React
- You need to configure Graz before rendering
- You want to dynamically change logger settings

## Default Behavior

| Configuration                  | Logger State          |
| ------------------------------ | --------------------- |
| **No `logger` config**         | ❌ Disabled (default) |
| `logger: { enabled: true }`    | ✅ Enabled            |
| `logger: { enabled: false }`   | ❌ Disabled           |
| `window.__GRAZ_DEBUG__ = true` | ✅ Force enabled      |

## Log Levels

Graz supports five log levels that control verbosity:

```tsx
import { LogLevel } from "graz";

enum LogLevel {
  ERROR = 0, // Only errors
  WARN = 1,  // Errors and warnings
  INFO = 2,  // Errors, warnings, and info
  DEBUG = 3, // All logs including debug
  TRACE = 4, // Most verbose (not currently used)
}
```

### Single Level

Set a minimum level - all messages at this level and above will be logged:

```tsx
// Production: Only errors
logger: { enabled: true, level: LogLevel.ERROR }

// Development: All logs
logger: { enabled: true, level: LogLevel.DEBUG }

// Moderate logging
logger: { enabled: true, level: LogLevel.INFO }
```

### Multiple Levels

Log only specific levels by passing an array:

```tsx
// Only errors and warnings
logger: {
  enabled: true,
  level: [LogLevel.ERROR, LogLevel.WARN]
}
```

### All Levels

Log everything by setting `level` to `undefined`:

```tsx
// Log all levels
logger: {
  enabled: true,
  level: undefined
}
```

## Log Categories

Filter logs by specific categories to focus on what you need:

```tsx
import { LogCategory } from "graz";

enum LogCategory {
  WALLET = "wallet",           // Wallet connections, disconnections
  TRANSACTION = "transaction", // Token transfers, contract execution
  QUERY = "query",             // Blockchain queries, client creation
  STORE = "store",             // State management, chain config
  MULTICHAIN = "multichain",   // Multi-chain operations
  EVENT = "event",             // Wallet events (ping, keystore changes)
  PERFORMANCE = "performance", // Performance timing
}
```

### Category Examples

```tsx
// Only wallet operations
logger: {
  enabled: true,
  categories: [LogCategory.WALLET]
}

// Transaction and query logs
logger: {
  enabled: true,
  categories: [LogCategory.TRANSACTION, LogCategory.QUERY]
}

// Everything (default)
logger: {
  enabled: true,
  categories: undefined  // undefined = all categories
}
```

## What Gets Logged?

### Wallet Operations

```
[graz] INFO [wallet] [connect] Connection successful
  { walletType: "keplr", chainCount: 2, chainIds: ["cosmoshub-4", "osmosis-1"] }
```

### Transactions

```
[graz] INFO [transaction] [sendTokens] Transaction broadcasted
  { txHash: "ABC123...", senderAddress: "cosmos1...", amount: "1000000" }
```

### Multi-chain Operations

```
[graz] DEBUG [multichain] [useStargateClient] Starting parallel operations
  { chainCount: 3, concurrency: 3, chainIds: ["cosmoshub-4", "osmosis-1", "juno-1"] }
```

### Errors

```
[graz] ERROR [wallet] [connect] Connection failed
  { error: "User rejected request", walletType: "keplr", chainId: "cosmoshub-4" }
```

## Dynamic Configuration

Change logger settings at runtime:

```tsx
import { getLogger, LogLevel, LogCategory } from "graz";

const logger = getLogger();

// Enable/disable
logger.enable();
logger.disable();

// Change log level
logger.setLevel(LogLevel.DEBUG);
logger.setLevel([LogLevel.ERROR, LogLevel.WARN]);
logger.setLevel(undefined); // All levels

// Change categories
logger.setCategories([LogCategory.WALLET, LogCategory.TRANSACTION]);
logger.setCategories(undefined); // All categories
```

## Performance Timing

Some operations include automatic performance timing:

```tsx
// Automatically timed operations:
// - connect() - Wallet connection time
// - Multi-chain operations - Parallel execution time
// - Contract queries - Query execution time
```

Performance logs appear as:

```
[graz] DEBUG [performance] ⏱️ connect: 1234.56ms
```

## Error Tracking Integration

Integrate with error tracking services like Sentry:

```tsx
import * as Sentry from "@sentry/react";
import { configureLogger, LogLevel } from "graz";

configureLogger({
  enabled: true,
  level: LogLevel.ERROR,
  errorReporter: {
    captureException: (error, context) => {
      Sentry.captureException(error, { extra: context });
    },
  },
});
```

This automatically sends all ERROR-level logs to your error tracking service with full context.

## Recommended Configurations

### Development

```tsx
<GrazProvider
  grazOptions={{
    chains: [...],
    logger: {
      enabled: true,
      level: LogLevel.DEBUG,
      categories: undefined, // All categories
    }
  }}
>
```

### Production

```tsx
<GrazProvider
  grazOptions={{
    chains: [...],
    logger: {
      enabled: true,
      level: LogLevel.ERROR,
      errorReporter: sentryReporter,
    }
  }}
>
```

### Environment-based

```tsx
const isDevelopment = process.env.NODE_ENV === "development";

<GrazProvider
  grazOptions={{
    chains: [...],
    logger: isDevelopment
      ? {
          enabled: true,
          level: LogLevel.DEBUG,
        }
      : {
          enabled: true,
          level: LogLevel.ERROR,
        },
  }}
>
```

## Debug Mode Override

Force enable logging in any environment by setting a global flag:

```tsx
// In browser console or your app
window.__GRAZ_DEBUG__ = true;
```

This bypasses all configuration and enables logging at all levels and categories.

## Browser Console Features

Logs appear with **colored formatting** for easy identification:

- 🟣 **[graz]** - Purple prefix
- 🔴 **ERROR** - Red
- 🟡 **WARN** - Orange
- 🔵 **INFO** - Blue
- ⚪ **DEBUG** - Cyan
- 🟢 **[category]** - Category-specific colors
- 🎨 **[function/hook]** - Unique colors per function/hook

Each log includes structured data that can be expanded in the console for detailed inspection.

## Troubleshooting

### Logs not appearing?

1. ✅ Check `enabled: true` is set
2. ✅ Verify log level includes desired logs
3. ✅ Check categories filter (use `undefined` for all)
4. ✅ Open browser console
5. ✅ Try `window.__GRAZ_DEBUG__ = true`

### Too many logs?

1. Reduce log level: `LogLevel.INFO` or `LogLevel.ERROR`
2. Filter categories: `[LogCategory.WALLET]`
3. Disable in production: `enabled: false`

### Want specific operations only?

```tsx
// Only wallet connection issues
logger: {
  enabled: true,
  level: LogLevel.ERROR,
  categories: [LogCategory.WALLET]
}

// Only transaction logs
logger: {
  enabled: true,
  categories: [LogCategory.TRANSACTION]
}
```

## Best Practices

### 1. Use Environment-based Configuration

```tsx
const loggerConfig = process.env.NODE_ENV === "development"
  ? { enabled: true, level: LogLevel.DEBUG }
  : { enabled: true, level: LogLevel.ERROR, errorReporter };
```

### 2. Filter by Category in Development

Instead of disabling logs, filter to relevant categories:

```tsx
// When debugging wallet issues
logger: {
  enabled: true,
  categories: [LogCategory.WALLET, LogCategory.EVENT]
}
```

### 3. Always Enable Error Logging in Production

```tsx
// Catch production errors without verbose logs
logger: {
  enabled: true,
  level: LogLevel.ERROR,
  errorReporter: sentryReporter
}
```

### 4. Use Debug Mode for Deep Investigation

When users report issues, ask them to enable debug mode:

```tsx
window.__GRAZ_DEBUG__ = true;
// Then reproduce the issue
```

### 5. Monitor Performance in Development

Keep an eye on performance logs for optimization opportunities:

```tsx
logger: {
  enabled: true,
  categories: [LogCategory.PERFORMANCE]
}
```

## Example: Complete Setup

Here's a complete example with all features:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider, LogLevel, LogCategory } from "graz";
import * as Sentry from "@sentry/react";

const queryClient = new QueryClient();

const isDevelopment = process.env.NODE_ENV === "development";

const errorReporter = {
  captureException: (error: Error, context?: Record<string, unknown>) => {
    Sentry.captureException(error, { extra: context });
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: [cosmoshubChainInfo, osmosisChainInfo],
          logger: isDevelopment
            ? {
                // Development: Verbose logging
                enabled: true,
                level: LogLevel.DEBUG,
                categories: undefined, // All categories
              }
            : {
                // Production: Only errors with tracking
                enabled: true,
                level: LogLevel.ERROR,
                errorReporter,
              },
        }}
      >
        <YourApp />
      </GrazProvider>
    </QueryClientProvider>
  );
}
```

## Next Steps

- Explore [Performance Optimization](/docs/performance) for tips on improving your app
- Learn about [Multi-chain Support](/docs/guides/multi-chain) and how it's logged
- Check out the [Migration Guide](/docs/migration-guide) for breaking changes
