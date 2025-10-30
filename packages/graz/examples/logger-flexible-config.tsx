/**
 * Examples showing flexible logger configuration with level and category options
 */

import { GrazProvider, LogLevel, type LogCategory } from "graz";

// ============================================================================
// LEVEL CONFIGURATION OPTIONS
// ============================================================================

// 1. SINGLE LEVEL (Minimum level - logs this level and above)
export const MinimumLevelExample = () => (
  <GrazProvider
    grazOptions={{
      chains: [...],
      logger: {
        enabled: true,
        level: LogLevel.INFO, // Logs INFO, WARN, ERROR (not DEBUG or TRACE)
      }
    }}
  >
    <App />
  </GrazProvider>
);

// 2. ARRAY OF LEVELS (Only specific levels)
export const SpecificLevelsExample = () => (
  <GrazProvider
    grazOptions={{
      chains: [...],
      logger: {
        enabled: true,
        level: [LogLevel.ERROR, LogLevel.WARN], // Only errors and warnings
      }
    }}
  >
    <App />
  </GrazProvider>
);

// 3. UNDEFINED LEVEL (All levels)
export const AllLevelsExample = () => (
  <GrazProvider
    grazOptions={{
      chains: [...],
      logger: {
        enabled: true,
        level: undefined, // Logs ALL levels (ERROR, WARN, INFO, DEBUG, TRACE)
      }
    }}
  >
    <App />
  </GrazProvider>
);

// ============================================================================
// CATEGORY CONFIGURATION OPTIONS
// ============================================================================

// 1. ARRAY OF CATEGORIES (Only specific categories)
export const SpecificCategoriesExample = () => (
  <GrazProvider
    grazOptions={{
      chains: [...],
      logger: {
        enabled: true,
        categories: ['wallet', 'transaction'], // Only wallet and transaction logs
      }
    }}
  >
    <App />
  </GrazProvider>
);

// 2. EMPTY ARRAY (All categories)
export const EmptyArrayCategoriesExample = () => (
  <GrazProvider
    grazOptions={{
      chains: [...],
      logger: {
        enabled: true,
        categories: [], // Logs ALL categories
      }
    }}
  >
    <App />
  </GrazProvider>
);

// 3. UNDEFINED CATEGORIES (All categories)
export const UndefinedCategoriesExample = () => (
  <GrazProvider
    grazOptions={{
      chains: [...],
      logger: {
        enabled: true,
        categories: undefined, // Logs ALL categories (same as empty array)
      }
    }}
  >
    <App />
  </GrazProvider>
);

// Or simply omit categories
export const OmitCategoriesExample = () => (
  <GrazProvider
    grazOptions={{
      chains: [...],
      logger: {
        enabled: true,
        // categories not specified = all categories
      }
    }}
  >
    <App />
  </GrazProvider>
);

// ============================================================================
// COMBINED EXAMPLES
// ============================================================================

// Only errors and warnings, all categories
export const ErrorsAndWarningsOnly = () => (
  <GrazProvider
    grazOptions={{
      chains: [...],
      logger: {
        enabled: true,
        level: [LogLevel.ERROR, LogLevel.WARN],
        categories: undefined, // All categories
      }
    }}
  >
    <App />
  </GrazProvider>
);

// All levels, but only wallet operations
export const WalletOnlyAllLevels = () => (
  <GrazProvider
    grazOptions={{
      chains: [...],
      logger: {
        enabled: true,
        level: undefined, // All levels
        categories: ['wallet'],
      }
    }}
  >
    <App />
  </GrazProvider>
);

// Debug and info only, for transaction and query categories
export const DebugInfoForTxQuery = () => (
  <GrazProvider
    grazOptions={{
      chains: [...],
      logger: {
        enabled: true,
        level: [LogLevel.DEBUG, LogLevel.INFO],
        categories: ['transaction', 'query'],
      }
    }}
  >
    <App />
  </GrazProvider>
);

// ============================================================================
// ENVIRONMENT-BASED FLEXIBLE CONFIGURATION
// ============================================================================

const isDevelopment = process.env.NODE_ENV === 'development';
const isStaging = process.env.REACT_APP_ENV === 'staging';

export const EnvironmentFlexibleConfig = () => {
  const loggerConfig = isDevelopment
    ? {
        // Development: Everything
        enabled: true,
        level: undefined, // All levels
        categories: undefined, // All categories
      }
    : isStaging
      ? {
          // Staging: Info and above, all categories
          enabled: true,
          level: LogLevel.INFO,
          categories: undefined,
        }
      : {
          // Production: Only errors and warnings for critical operations
          enabled: true,
          level: [LogLevel.ERROR, LogLevel.WARN],
          categories: ['wallet', 'transaction'] as LogCategory[],
        };

  return (
    <GrazProvider
      grazOptions={{
        chains: [...],
        logger: loggerConfig,
      }}
    >
      <App />
    </GrazProvider>
  );
};

// ============================================================================
// RUNTIME CONTROL WITH FLEXIBLE OPTIONS
// ============================================================================

import { getLogger } from "graz";

export function DeveloperToolsFlexible() {
  const logger = getLogger();

  return (
    <div className="dev-tools">
      <h3>Level Controls</h3>
      <button onClick={() => logger.setLevel(LogLevel.DEBUG)}>
        Minimum: DEBUG and above
      </button>
      <button onClick={() => logger.setLevel([LogLevel.ERROR, LogLevel.WARN])}>
        Only: Errors & Warnings
      </button>
      <button onClick={() => logger.setLevel(undefined)}>
        All Levels
      </button>

      <h3>Category Controls</h3>
      <button onClick={() => logger.setCategories(['wallet'])}>
        Only: Wallet
      </button>
      <button onClick={() => logger.setCategories(['wallet', 'transaction'])}>
        Only: Wallet & Transaction
      </button>
      <button onClick={() => logger.setCategories(undefined)}>
        All Categories
      </button>
      <button onClick={() => logger.setCategories([])}>
        All Categories (empty array)
      </button>
    </div>
  );
}

// ============================================================================
// PRACTICAL USE CASES
// ============================================================================

// Use Case 1: Debug specific issue
export const DebugWalletConnection = () => (
  <GrazProvider
    grazOptions={{
      chains: [...],
      logger: {
        enabled: true,
        level: undefined, // See everything
        categories: ['wallet', 'event'], // Focus on wallet and events
      }
    }}
  >
    <App />
  </GrazProvider>
);

// Use Case 2: Monitor transactions only
export const MonitorTransactions = () => (
  <GrazProvider
    grazOptions={{
      chains: [...],
      logger: {
        enabled: true,
        level: [LogLevel.INFO, LogLevel.ERROR], // Info and errors only
        categories: ['transaction'],
      }
    }}
  >
    <App />
  </GrazProvider>
);

// Use Case 3: Production error tracking
export const ProductionErrorTracking = () => (
  <GrazProvider
    grazOptions={{
      chains: [...],
      logger: {
        enabled: true,
        level: LogLevel.ERROR, // Only errors
        categories: undefined, // All categories for full context
      }
    }}
  >
    <App />
  </GrazProvider>
);

// Dummy component
function App() {
  return <div>Your App</div>;
}
