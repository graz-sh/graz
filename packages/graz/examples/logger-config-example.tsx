/**
 * Example demonstrating both methods to enable logger in Graz
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  GrazProvider,
  configureGraz,
  LogLevel,
  LOG_CATEGORIES
} from "graz";

const queryClient = new QueryClient();

// Example chain info (replace with your actual chains)
const cosmoshubChainInfo = {
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
  // ... other chain properties
};

// ============================================================================
// METHOD 1: Enable logging via GrazProvider (Recommended for React apps)
// ============================================================================

export function AppWithGrazProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: [cosmoshubChainInfo],
          logger: {
            enabled: true,
            level: LogLevel.DEBUG,
            categories: ['wallet', 'transaction'],
          }
        }}
      >
        <YourApp />
      </GrazProvider>
    </QueryClientProvider>
  );
}

// ============================================================================
// METHOD 2: Enable logging via configureGraz (Direct configuration)
// ============================================================================

// Call this before rendering your app or in an initialization function
function initializeGraz() {
  configureGraz({
    chains: [cosmoshubChainInfo],
    logger: {
      enabled: true,
      level: LogLevel.DEBUG,
      categories: [
        LOG_CATEGORIES.WALLET,
        LOG_CATEGORIES.TRANSACTION,
        LOG_CATEGORIES.QUERY,
      ],
    },
  });
}

export function AppWithDirectConfig() {
  // Initialize before rendering
  initializeGraz();

  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}

// ============================================================================
// ADVANCED: Dynamic configuration based on environment
// ============================================================================

const isDevelopment = process.env.NODE_ENV === 'development';
const isStaging = process.env.REACT_APP_ENV === 'staging';

export function AppWithEnvironmentConfig() {
  const loggerConfig = {
    // Always enabled, but level changes per environment
    enabled: true,

    // Development: Show all logs
    // Staging: Show info and above
    // Production: Only errors
    level: isDevelopment
      ? LogLevel.DEBUG
      : isStaging
        ? LogLevel.INFO
        : LogLevel.ERROR,

    // Development: All categories
    // Production: Only critical categories
    categories: isDevelopment
      ? [] // Empty array = all categories
      : [LOG_CATEGORIES.WALLET, LOG_CATEGORIES.TRANSACTION],
  };

  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: [cosmoshubChainInfo],
          logger: loggerConfig,
        }}
      >
        <YourApp />
      </GrazProvider>
    </QueryClientProvider>
  );
}

// ============================================================================
// ADVANCED: Runtime logger control
// ============================================================================

import { getLogger } from "graz";

export function DeveloperTools() {
  const logger = getLogger();

  return (
    <div className="dev-tools">
      <h3>Logger Controls</h3>

      <button onClick={() => logger.enable()}>
        Enable Logger
      </button>

      <button onClick={() => logger.disable()}>
        Disable Logger
      </button>

      <button onClick={() => logger.setLevel(LogLevel.DEBUG)}>
        Set DEBUG Level
      </button>

      <button onClick={() => logger.setLevel(LogLevel.ERROR)}>
        Set ERROR Level
      </button>

      <button onClick={() => logger.setCategories([])}>
        Log All Categories
      </button>

      <button onClick={() => logger.setCategories(['wallet'])}>
        Only Wallet Logs
      </button>
    </div>
  );
}

// ============================================================================
// ADVANCED: Integration with error tracking (e.g., Sentry)
// ============================================================================

import * as Sentry from "@sentry/react";

export function AppWithErrorTracking() {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: [cosmoshubChainInfo],
          logger: {
            enabled: true,
            level: LogLevel.ERROR,
            categories: [],
            errorReporter: {
              captureException: (error, context) => {
                // Send errors to Sentry with context
                Sentry.captureException(error, {
                  extra: context,
                  tags: {
                    category: context.function || context.hook || 'unknown',
                  },
                });
              },
            },
          },
        }}
      >
        <YourApp />
      </GrazProvider>
    </QueryClientProvider>
  );
}

// Dummy component for examples
function YourApp() {
  return <div>Your App Content</div>;
}
