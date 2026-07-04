/**
 * Logger types and interfaces for Graz
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export enum LogCategory {
  WALLET = "wallet", // Wallet connections, disconnections
  TRANSACTION = "transaction", // Transaction signing and broadcasting
  QUERY = "query", // Blockchain queries
  STORE = "store", // State management
  MULTICHAIN = "multichain", // Multi-chain operations
  EVENT = "event", // Wallet events
  PERFORMANCE = "performance", // Performance metrics
}

/**
 * Error reporter interface for integration with error tracking services
 * (e.g., Sentry, custom error tracking)
 */
export interface ErrorReporter {
  captureException: (error: Error, context?: { category?: string; message?: string; context?: Record<string, unknown> }) => void;
}

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  /**
   * Enable/disable logging
   * @default true in development, false in production
   */
  enabled?: boolean;

  /**
   * Log level configuration:
   * - Single LogLevel: Minimum level (e.g., LogLevel.INFO logs INFO, WARN, ERROR)
   * - Array of LogLevel: Only log these specific levels
   * - undefined/not specified: Log all levels
   * @default undefined (all levels)
   */
  level?: LogLevel | LogLevel[];

  /**
   * Categories to log:
   * - Array of categories: Only log these specific categories
   * - Empty array or undefined: Log all categories
   * @default undefined (all categories)
   */
  categories?: (keyof typeof LogCategory)[];

  /**
   * Optional error reporter for error tracking integration
   */
  errorReporter?: ErrorReporter;
}

/**
 * Logger interface
 */
export interface Logger {
  // Log levels
  error(category: LogCategory, message: string, context?: Record<string, unknown>): void;
  warn(category: LogCategory, message: string, context?: Record<string, unknown>): void;
  info(category: LogCategory, message: string, context?: Record<string, unknown>): void;
  debug(category: LogCategory, message: string, context?: Record<string, unknown>): void;
  trace(category: LogCategory, message: string, context?: Record<string, unknown>): void;

  // Performance timing
  time(label: string): void;
  timeEnd(label: string): void;

  // Grouping
  group(label: string): void;
  groupEnd(): void;

  // Configuration
  setLevel(level: LogLevel | LogLevel[] | undefined): void;
  setCategories(categories: (keyof typeof LogCategory)[] | undefined): void;
  enable(): void;
  disable(): void;
}

/**
 * Global window extensions for Graz debugging
 */
declare global {
  interface Window {
    __GRAZ_DEBUG__?: boolean;
    grazErrorReporter?: ErrorReporter;
  }
}
