export const RECONNECT_SESSION_KEY = "connect-graz";

/**
 * Logger Categories
 * Used for categorizing logs throughout the Graz library
 */
export const LOG_CATEGORIES = {
  /** Wallet connections, disconnections, and adapter operations */
  WALLET: "wallet",
  /** Transaction signing and broadcasting */
  TRANSACTION: "transaction",
  /** Blockchain queries (balance, contract queries, etc.) */
  QUERY: "query",
  /** State management operations (store updates) */
  STORE: "store",
  /** Multi-chain parallel operations */
  MULTICHAIN: "multichain",
  /** Wallet events and listeners */
  EVENT: "event",
  /** Performance metrics and timing */
  PERFORMANCE: "performance",
} as const;

export type LogCategory = (typeof LOG_CATEGORIES)[keyof typeof LOG_CATEGORIES];

/**
 * Logger Function Names
 * Action/method function names used in logging context
 */
export const LOG_FUNCTIONS = {
  // Account actions
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  RECONNECT: "reconnect",

  // Wallet actions
  GET_WALLET: "getWallet",

  // Chain actions
  CLEAR_RECENT_CHAIN: "clearRecentChain",
  GET_RECENT_CHAIN_IDS: "getRecentChainIds",
  GET_RECENT_CHAINS: "getRecentChains",
  GET_CHAIN_INFO: "getChainInfo",
  GET_CHAIN_INFOS: "getChainInfos",
  ADD_CHAIN: "addChain",
  SUGGEST_CHAIN: "suggestChain",
  SUGGEST_CHAIN_AND_CONNECT: "suggestChainAndConnect",

  // Transaction methods
  SEND_TOKENS: "sendTokens",
  SEND_IBC_TOKENS: "sendIbcTokens",
  INSTANTIATE_CONTRACT: "instantiateContract",
  EXECUTE_CONTRACT: "executeContract",

  // Query methods
  GET_QUERY_SMART: "getQuerySmart",
  GET_QUERY_RAW: "getQueryRaw",
  
  // Multi-chain utilities
  CREATE_MULTI_CHAIN_ASYNC_FUNCTION: "createMultiChainAsyncFunction",
  
  // Event handlers
  HANDLE_FOCUS: "handleFocus",
  AUTO_CONNECT_IFRAME: "autoConnectIframe",
  RECONNECT_EFFECT: "reconnectEffect",
  SUBSCRIPTION: "subscription",
} as const;

export type LogFunction = (typeof LOG_FUNCTIONS)[keyof typeof LOG_FUNCTIONS];

/**
 * Logger Hook Names
 * React hook names used in logging context
 */
export const LOG_HOOKS = {
  // Account hooks
  USE_CONNECT: "useConnect",
  USE_DISCONNECT: "useDisconnect",

  // Wallet hooks
  USE_CHECK_WALLET: "useCheckWallet",

  // Chain hooks
  USE_ADD_CHAIN: "useAddChain",
  USE_SUGGEST_CHAIN: "useSuggestChain",
  USE_SUGGEST_CHAIN_AND_CONNECT: "useSuggestChainAndConnect",

  // Client hooks
  USE_STARGATE_CLIENT: "useStargateClient",
  USE_COSMWASM_CLIENT: "useCosmWasmClient",

  // Signing client hooks
  USE_STARGATE_SIGNING_CLIENT: "useStargateSigningClient",
  USE_COSMWASM_SIGNING_CLIENT: "useCosmWasmSigningClient",

  // Transaction hooks
  USE_SEND_TOKENS: "useSendTokens",
  USE_SEND_IBC_TOKENS: "useSendIbcTokens",
  USE_INSTANTIATE_CONTRACT: "useInstantiateContract",
  USE_EXECUTE_CONTRACT: "useExecuteContract",
} as const;

export type LogHook = (typeof LOG_HOOKS)[keyof typeof LOG_HOOKS];
