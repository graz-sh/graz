# Graz Codebase Context for AI Agents

## ⚠️ IMPORTANT: Shell Environment Setup

**CRITICAL**: Before running ANY `pnpm` or `node` commands, you MUST first run:

```bash
nvm use 20
```

This loads Node.js v20.18.0 into the shell environment. Without this, pnpm and node commands will fail with "command not found" errors.

### Example Command Pattern
```bash
# WRONG - Will fail
pnpm build

# CORRECT - Always load nvm first
nvm use 20 && pnpm build
```

### Why This Is Needed
- The shell doesn't automatically load Node.js from nvm
- Node.js is installed via nvm in `~/.nvm/versions/node/v20.18.0/`
- Each new shell session requires loading nvm explicitly

---

## Project Overview

**Graz** is a React hooks library for building applications in the Cosmos ecosystem. It provides a comprehensive set of hooks and utilities for wallet connections, signing clients, token transfers, smart contract interactions, and multi-chain support.

### Key Features
- 20+ React hooks for Cosmos wallet interactions
- Multi-wallet support (Keplr, Leap, Cosmostation, Vectis, Station, XDefi, Metamask Snap, WalletConnect, Compass, Initia, OKX, Para, Cosmiframe)
- Multi-chain support (connect and interact with multiple chains simultaneously)
- Built on `@tanstack/react-query` and `zustand` for state management
- TypeScript-first with full type safety
- Tree-shakeable and optimized for production

### Tech Stack
- **React** (>=17) - UI framework
- **TypeScript** - Primary language
- **@tanstack/react-query** - Data fetching and caching
- **Zustand** - State management (stores wallet state, session, configuration)
- **CosmJS** - Cosmos blockchain interactions (@cosmjs/stargate, @cosmjs/cosmwasm-stargate)
- **@keplr-wallet/types** - Wallet interface types
- **@walletconnect** - WalletConnect protocol integration
- **Turbo** - Monorepo build system
- **pnpm** - Package manager
- **tsup** - TypeScript bundler

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            QueryClientProvider (react-query)           │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │              GrazProvider                         │  │ │
│  │  │                                                    │  │ │
│  │  │  ┌─────────────────┐    ┌──────────────────────┐ │  │ │
│  │  │  │  React Hooks    │───▶│   Actions/Methods    │ │  │ │
│  │  │  │  (useConnect,   │    │   (connect, send,    │ │  │ │
│  │  │  │   useAccount,   │    │    execute, etc.)    │ │  │ │
│  │  │  │   useBalance)   │    └──────────────────────┘ │  │ │
│  │  │  └─────────────────┘              │              │  │ │
│  │  │           │                        │              │  │ │
│  │  │           ▼                        ▼              │  │ │
│  │  │  ┌─────────────────────────────────────────────┐ │  │ │
│  │  │  │         Zustand Stores                      │ │  │ │
│  │  │  │  • GrazInternalStore (config, wallet type)  │ │  │ │
│  │  │  │  • GrazSessionStore (accounts, connection)  │ │  │ │
│  │  │  └─────────────────────────────────────────────┘ │  │ │
│  │  │                        │                          │  │ │
│  │  └────────────────────────┼──────────────────────────┘  │ │
│  └───────────────────────────┼─────────────────────────────┘ │
│                               │                               │
└───────────────────────────────┼───────────────────────────────┘
                                ▼
              ┌──────────────────────────────────┐
              │      Wallet Connectors           │
              │  (Keplr, Leap, Cosmostation,     │
              │   WalletConnect, Para, etc.)     │
              └──────────────────────────────────┘
                                │
                                ▼
              ┌──────────────────────────────────┐
              │      Cosmos Blockchains          │
              │   (via RPC/REST endpoints)       │
              └──────────────────────────────────┘
```

### Data Flow

1. **Initialization**: `GrazProvider` calls `configureGraz()` to set up chains, wallet types, and configuration
2. **State Management**: Two Zustand stores persist state:
   - `GrazInternalStore`: Configuration, wallet type, chains (localStorage)
   - `GrazSessionStore`: Connected accounts, active chains, connection status (sessionStorage)
3. **Connection Flow**:
   - User calls `useConnect()` hook
   - Hook triggers `connect()` action
   - Action gets wallet adapter via `getWallet(walletType)`
   - Wallet enables chains and returns accounts
   - Session store updates with accounts and active chains
4. **Query Flow**:
   - Hooks like `useAccount()`, `useBalance()` use react-query
   - Query functions read from stores or call wallet/blockchain APIs
   - Results are cached and auto-refreshed by react-query
5. **Multi-Chain**:
   - Hooks accept `multiChain: true` and `chainId: string[]`
   - Utility `createMultiChainAsyncFunction()` maps operations across chains
   - Returns `Record<chainId, result>` instead of single result

---

## Package Structure

### Monorepo Layout

```
graz/
├── packages/
│   ├── graz/              # Main package (all-in-one, currently)
│   ├── core/              # Planned: Framework-agnostic core
│   ├── react/             # Planned: React-specific hooks
│   └── connectors/        # Planned: Wallet connectors
├── example/
│   ├── vite/              # Vite example
│   └── playground/        # Playground with multi-chain demos
└── docs/                  # Docusaurus documentation site
```

### Current Main Package Structure (`packages/graz/src/`)

```
src/
├── actions/               # Core business logic (framework-agnostic)
│   ├── account.ts         # connect, disconnect, reconnect, getOfflineSigners
│   ├── chains.ts          # Chain info utilities
│   ├── configure.ts       # configureGraz - sets up stores
│   ├── methods.ts         # sendTokens, sendIbcTokens, executeContract, etc.
│   └── wallet/            # Wallet-specific adapters
│       ├── index.ts       # getWallet, checkWallet, getAvailableWallets
│       ├── keplr.ts
│       ├── leap.ts
│       ├── cosmostation.ts
│       ├── vectis.ts
│       ├── station.ts
│       ├── xdefi.ts
│       ├── compass.ts
│       ├── initia.ts
│       ├── okx.ts
│       ├── para.ts
│       ├── cosmiframe.ts
│       ├── cosmos-metamask-snap/
│       ├── leap-metamask-snap/
│       └── wallet-connect/
│           ├── index.ts   # Generic WalletConnect
│           ├── keplr.ts
│           ├── leap.ts
│           ├── cosmostation.ts
│           └── clot.ts
├── hooks/                 # React hooks (wraps actions with react-query)
│   ├── account.ts         # useAccount, useConnect, useDisconnect
│   ├── chains.ts          # useActiveChains, useChainInfos, etc.
│   ├── clients.ts         # useStargateClient, useCosmWasmClient
│   ├── methods.ts         # useSendTokens, useExecuteContract, etc.
│   ├── signingClients.ts  # useStargateSigningClient, useCosmWasmSigningClient
│   └── wallet.ts          # useCheckWallet, useSuggestChain
├── provider/              # React context providers
│   ├── index.tsx          # GrazProvider (main provider)
│   ├── events.tsx         # GrazEvents (handles wallet events)
│   └── client-only.tsx    # Client-only rendering wrapper
├── store/                 # Zustand stores
│   └── index.ts           # GrazInternalStore, GrazSessionStore
├── types/                 # TypeScript types
│   ├── core.ts            # Core utility types
│   ├── hooks.ts           # Hook argument/return types
│   ├── wallet.ts          # WalletType enum, Wallet interface
│   └── tendermint.ts      # Tendermint types
├── utils/                 # Utility functions
│   ├── multi-chain.ts     # Multi-chain helpers
│   ├── conversion.ts      # Unit conversion
│   ├── isEmpty.ts         # Object checking
│   ├── os.ts              # OS detection
│   └── timeout.ts         # Timeout utilities
├── chains/                # Chain info generation (CLI)
│   └── index.ts
├── constant.ts            # Constants (RECONNECT_SESSION_KEY, etc.)
├── cli.mjs                # CLI for generating chain info
└── index.ts               # Main exports
```

---

## Core Concepts

### 1. Stores (State Management)

#### `GrazInternalStore` (Persisted in localStorage)
Configuration and settings that persist across sessions:
- `chains`: Array of ChainInfo objects provided to GrazProvider
- `chainsConfig`: Per-chain configuration (gas price, RPC headers, etc.)
- `walletType`: Currently active wallet type
- `recentChainIds`: Recently connected chain IDs
- `walletConnect`: WalletConnect configuration
- `paraConfig`: Para wallet configuration
- `iframeOptions`: Configuration for iframe embedding (Cosmiframe)
- `multiChainFetchConcurrency`: Concurrent request limit for multi-chain ops (default: 3)
- `pingInterval`: Wallet ping interval (default: 1 hour)
- `_reconnect`: Whether to auto-reconnect
- `_reconnectConnector`: Wallet to use for reconnection
- `_notFoundFn`: Callback when wallet not found
- `_onReconnectFailed`: Callback on reconnect failure

#### `GrazSessionStore` (Persisted in sessionStorage)
Active session data:
- `accounts`: Record<chainId, Key> - Connected accounts per chain
- `activeChainIds`: Array of currently connected chain IDs
- `status`: "connected" | "connecting" | "reconnecting" | "disconnected"
- `lastPing`: Timestamp of last wallet ping
- `wcSignClients`: Map of WalletConnect sign clients
- `paraConnector`: Para connector instance

**Key Pattern**: Stores are accessed via `useGrazInternalStore.getState()` or `useGrazSessionStore.getState()` in actions (non-React), and via hooks like `useGrazInternalStore((x) => x.chains)` in React components.

### 2. Wallet Adapters

Each wallet has an adapter file (e.g., `keplr.ts`, `leap.ts`) that exports a `getX()` function. All adapters return a `Wallet` interface:

```typescript
export type Wallet = {
  // Core methods
  enable: (chainIds: string[]) => Promise<void>;
  getKey: (chainId: string) => Promise<Key>;
  getKeys?: (chainIds: string[]) => Promise<(Key | undefined)[]>;
  getOfflineSigner: (chainId: string) => OfflineAminoSigner & OfflineDirectSigner;
  getOfflineSignerOnlyAmino: (chainId: string) => OfflineAminoSigner;
  getOfflineSignerAuto: (chainId: string) => Promise<OfflineAminoSigner | OfflineDirectSigner>;

  // Signing methods
  signAmino: (...args) => Promise<AminoSignResponse>;
  signDirect: (...args) => Promise<DirectSignResponse>;
  signArbitrary?: (chainId: string, signer: string, data: string) => Promise<StdSignature>;

  // Chain management
  experimentalSuggestChain: (chainInfo: ChainInfo) => Promise<void>;

  // Lifecycle hooks
  init?: () => Promise<unknown>;
  disable?: (chainIds?: string) => Promise<void>;
  subscription?: (reconnect: () => void) => () => void;  // Event listeners
  setDefaultOptions?: (options: KeplrIntereactionOptions) => void;
  onAfterLoginSuccessful?: () => Promise<void>;

  // Specialized signing
  signEthereum?: (chainId: string, signer: string, ...) => Promise<Uint8Array>;
  experimentalSignEIP712CosmosTx_v0?: (...) => Promise<AminoSignResponse>;
};
```

**Getting a wallet**:
```typescript
const wallet = getWallet(WalletType.KEPLR);  // Returns Wallet interface
```

The `getWallet()` function uses a switch statement to map `WalletType` enum to specific wallet adapters.

### 3. Actions vs Hooks

**Actions** (`src/actions/`):
- Pure functions, framework-agnostic
- Directly manipulate stores and call wallet APIs
- Can be used outside React components
- Examples: `connect()`, `disconnect()`, `sendTokens()`, `executeContract()`

**Hooks** (`src/hooks/`):
- React hooks that wrap actions
- Use `@tanstack/react-query` for caching, refetching, and state management
- Provide loading states, error handling, and data access
- Examples: `useConnect()`, `useAccount()`, `useSendTokens()`, `useExecuteContract()`

**Pattern**:
```typescript
// Action (pure function)
export const connect = async (args?: ConnectArgs): Promise<ConnectResult> => {
  // Business logic
};

// Hook (wraps action with react-query)
export const useConnect = () => {
  return useMutation({
    mutationFn: connect,
    onSuccess: (data) => { /* ... */ }
  });
};
```

### 4. Multi-Chain Support

Hooks that support multi-chain have these arguments:
```typescript
interface MultiChainHookArgs {
  chainId?: string | string[];  // Single chain, multiple chains, or undefined (all)
  multiChain?: boolean;          // If true, returns Record<chainId, T>
}
```

**Behavior**:
- `multiChain: true, chainId: ["chain1", "chain2"]` → Returns `{ chain1: data1, chain2: data2 }`
- `multiChain: false, chainId: "chain1"` → Returns `data1`
- `multiChain: true, chainId: undefined` → Returns data for all configured chains
- `multiChain: false, chainId: undefined` → Returns data for first chain

**Implementation**: `createMultiChainAsyncFunction()` utility uses `p-map` to parallelize async operations across chains with configurable concurrency.

### 5. React Query Integration

All query hooks use `@tanstack/react-query`:
- **Query keys**: Stable, dependency-based keys for caching (e.g., `["graz/account", chainId, wallet]`)
- **Enabled flags**: Queries only run when dependencies are met (e.g., wallet connected)
- **Auto-refetch**: Disabled on window focus to prevent excessive requests
- **Mutations**: Used for write operations (connect, send, execute)

---

## Key Components

### GrazProvider

**Purpose**: Root provider that configures Graz and sets up event listeners.

**Usage**:
```tsx
<QueryClientProvider queryClient={queryClient}>
  <GrazProvider grazOptions={{
    chains: [cosmoshubChainInfo, osmosisChainInfo],
    chainsConfig: {
      "cosmoshub-4": { gas: { price: "0.025", denom: "uatom" } }
    },
    walletConnect: {
      options: { projectId: "..." },
      walletConnectModal: { themeMode: "dark" }
    }
  }}>
    <App />
  </GrazProvider>
</QueryClientProvider>
```

**What it does**:
1. Calls `configureGraz()` to initialize stores
2. Wraps children in `<ClientOnly>` (SSR safety)
3. Renders `<GrazEvents>` for wallet event handling

### GrazEvents

**Purpose**: Handles wallet-specific event listeners (account changes, disconnections).

**Behavior**:
- Subscribes to wallet events (e.g., `keplr_keystorechange`)
- Calls reconnect on account change
- Cleans up listeners on unmount

### Actions

#### `connect(args?: ConnectArgs)`
Connects to one or more chains with a specified wallet.

**Flow**:
1. Validates wallet availability via `checkWallet()`
2. Gets wallet adapter via `getWallet()`
3. Calls `wallet.init?.()` (if needed, e.g., WalletConnect)
4. Calls `wallet.enable(chainIds)`
5. Fetches accounts via `wallet.getKey()` or `wallet.getKeys()`
6. Updates `GrazSessionStore` with accounts and active chains
7. Updates `GrazInternalStore` with recent chains and reconnect settings
8. Sets session storage flag for reconnection

**Return**: `{ accounts: Record<chainId, Key>, walletType, chains }`

#### `disconnect(args?: { chainId?: string | string[] })`
Disconnects from specified chains or all chains.

**Flow**:
1. If `chainId` provided, removes those chains from session
2. If all chains disconnected, calls `wallet.disable?.()` and resets stores
3. Clears session storage reconnect flag

#### `sendTokens(args: SendTokensArgs)`
Sends tokens to a recipient.

**Parameters**:
- `signingClient`: SigningStargateClient or SigningCosmWasmClient
- `senderAddress`: Sender's address
- `recipientAddress`: Recipient's address
- `amount`: Array of Coin objects
- `fee`: Number, StdFee, or "auto"
- `memo`: Optional memo

**Return**: `DeliverTxResponse`

#### `executeContract(args: ExecuteContractArgs)`
Executes a CosmWasm smart contract.

**Parameters**:
- `signingClient`: SigningCosmWasmClient
- `senderAddress`: Sender's address
- `contractAddress`: Contract address
- `msg`: Execution message (JSON)
- `fee`: Number, StdFee, or "auto"
- `memo`: Optional memo
- `funds`: Optional coins to send

**Return**: `ExecuteResult`

### Hooks

#### `useAccount(args?: { chainId?, multiChain?, onConnect?, onDisconnect? })`
Returns current account(s).

**Return**:
```typescript
{
  data: Key | Record<chainId, Key>,  // Account data
  isConnected: boolean,
  isConnecting: boolean,
  isReconnecting: boolean,
  reconnect: (args?) => Promise<ConnectResult>,
  status: string,
  walletType: WalletType
}
```

#### `useConnect(args?: { onSuccess?, onError? })`
Mutation hook to connect wallet.

**Return**:
```typescript
{
  connect: (args: { chainId, walletType?, autoReconnect? }) => Promise<ConnectResult>,
  isLoading: boolean,
  error: Error | null,
  data: ConnectResult | undefined
}
```

#### `useBalance(args: { chainId?, bech32Address?, denom?, multiChain? })`
Fetches account balance for a specific denom.

**Return**:
```typescript
{
  data: Coin | Record<chainId, Coin>,
  isLoading: boolean,
  error: Error | null,
  refetch: () => void
}
```

#### `useStargateSigningClient(args?: { chainId?, multiChain?, opts? })`
Returns a signing client for Stargate (standard Cosmos SDK) transactions.

**Return**:
```typescript
{
  data: SigningStargateClient | Record<chainId, SigningStargateClient>,
  isLoading: boolean
}
```

#### `useCosmWasmSigningClient(args?: { chainId?, multiChain?, opts? })`
Returns a signing client for CosmWasm smart contract interactions.

---

## Development Workflows

### Building

```bash
# IMPORTANT: Always run 'nvm use 20' first!

# Build all packages
nvm use 20 && pnpm build

# Build main package only
nvm use 20 && pnpm graz build

# Watch mode
nvm use 20 && pnpm graz dev
```

### Running Examples

```bash
# IMPORTANT: Always run 'nvm use 20' first!

# Vite example
nvm use 20 && pnpm example:vite dev

# Playground example
nvm use 20 && pnpm example:playground dev
```

### Documentation

```bash
# IMPORTANT: Always run 'nvm use 20' first!

# Run docs locally
nvm use 20 && pnpm project:docs dev

# Build docs
nvm use 20 && pnpm project:docs build
```

### Linting

```bash
# IMPORTANT: Always run 'nvm use 20' first!
nvm use 20 && pnpm lint
```

### Publishing

```bash
# IMPORTANT: Always run 'nvm use 20' first!
# Uses changesets
nvm use 20 && pnpm release
```

---

## File Naming and Code Conventions

### Naming Conventions

- **Files**: kebab-case (`multi-chain.ts`, `use-account.ts`)
- **React Components**: PascalCase (`GrazProvider`, `GrazEvents`)
- **Hooks**: camelCase starting with `use` (`useConnect`, `useAccount`)
- **Actions**: camelCase (`connect`, `disconnect`, `sendTokens`)
- **Types/Interfaces**: PascalCase (`Wallet`, `ConnectArgs`, `GrazInternalStore`)
- **Enums**: PascalCase with UPPER_CASE values (`WalletType.KEPLR`)

### Code Patterns

1. **Store Access in Actions**:
   ```typescript
   const { chains, walletType } = useGrazInternalStore.getState();
   ```

2. **Store Access in Hooks**:
   ```typescript
   const chains = useGrazInternalStore((x) => x.chains);
   ```

3. **Error Handling**:
   ```typescript
   try {
     // Operation
   } catch (error) {
     console.error("connect ", error);
     // Restore previous state if needed
     throw error;
   }
   ```

4. **Multi-Chain Pattern**:
   ```typescript
   const chains = useChainsFromArgs({ chainId, multiChain });
   const result = await createMultiChainAsyncFunction(
     Boolean(multiChain),
     chains,
     async (chain) => {
       // Per-chain operation
       return await fetchData(chain.chainId);
     }
   );
   // result is T if single-chain, Record<chainId, T> if multi-chain
   ```

5. **Hook Return Pattern**:
   ```typescript
   export const useConnect = ({ onSuccess, onError }: Args = {}) => {
     const mutation = useMutation({
       mutationFn: connect,
       onSuccess: (data) => {
         onSuccess?.(data);
       },
       onError: (error) => {
         onError?.(error);
       }
     });
     return {
       connect: mutation.mutate,
       connectAsync: mutation.mutateAsync,
       isLoading: mutation.isLoading,
       // ... other mutation properties
     };
   };
   ```

6. **Wallet Adapter Pattern**:
   ```typescript
   export const getKeplr = (): Wallet => {
     if (typeof window.keplr !== "undefined") {
       const keplr = window.keplr;

       // Add custom methods
       const subscription = (reconnect) => {
         const listener = () => { reconnect(); };
         window.addEventListener("keplr_keystorechange", listener);
         return () => window.removeEventListener("keplr_keystorechange", listener);
       };

       return Object.assign(keplr, { subscription, /* other additions */ });
     }
     throw new Error("window.keplr is not defined");
   };
   ```

---

## Important Types

### Key (Account)
```typescript
type Key = {
  name: string;
  algo: string;
  pubKey: Uint8Array;
  address: Uint8Array;
  bech32Address: string;
  isNanoLedger?: boolean;
  isKeystone?: boolean;
};
```

### WalletType (Enum)
```typescript
enum WalletType {
  KEPLR = "keplr",
  LEAP = "leap",
  COSMOSTATION = "cosmostation",
  VECTIS = "vectis",
  STATION = "station",
  XDEFI = "xdefi",
  COMPASS = "compass",
  INITIA = "initia",
  OKX = "okx",
  PARA = "para",
  COSMIFRAME = "cosmiframe",
  WALLETCONNECT = "walletconnect",
  WC_KEPLR_MOBILE = "wc_keplr_mobile",
  WC_LEAP_MOBILE = "wc_leap_mobile",
  WC_COSMOSTATION_MOBILE = "wc_cosmostation_mobile",
  WC_CLOT_MOBILE = "wc_clot_mobile",
  METAMASK_SNAP_LEAP = "metamask_snap_leap",
  METAMASK_SNAP_COSMOS = "metamask_snap_cosmos",
}
```

### ChainInfo (from @keplr-wallet/types)
```typescript
interface ChainInfo {
  chainId: string;
  chainName: string;
  rpc: string;
  rest: string;
  bip44: { coinType: number };
  bech32Config: Bech32Config;
  currencies: Currency[];
  feeCurrencies: FeeCurrency[];
  stakeCurrency: Currency;
  features?: string[];
  // ... other fields
}
```

---

## Testing Strategy

Currently, Graz doesn't have extensive automated tests in the repository. Testing is primarily done through:

1. **Example Applications**: Three example apps (Next.js, Vite, Starter) serve as integration tests
2. **Manual Testing**: Testing against live wallets and blockchains
3. **Type Safety**: Heavy reliance on TypeScript for catching errors at compile time

**Recommended Future Testing**:
- Unit tests for actions and utilities (Vitest)
- Integration tests for wallet adapters (mock wallet objects)
- E2E tests for examples (Playwright)
- Visual regression tests for docs site

---

## Common Patterns and Gotchas

### 1. SSR Safety
Always wrap wallet interactions in client-only code:
```typescript
if (typeof window !== "undefined") {
  // Safe to access window.keplr
}
```
`GrazProvider` uses `<ClientOnly>` to prevent server-side execution.

### 2. Wallet Detection Timing
Wallets may not be immediately available on page load. Use polling or event listeners:
```typescript
// Keplr recommends:
if (!window.keplr) {
  document.addEventListener("keplr_keystorechange", handler);
}
```

### 3. Chain Not Provided Error
If a user tries to connect to a chain not in `GrazProvider.grazOptions.chains`, connection fails. Always validate chain IDs.

### 4. Session vs Local Storage
- **Session storage**: Active connection state (cleared on tab close)
- **Local storage**: Reconnection preferences (persists across sessions)

### 5. WalletConnect Lifecycle
WalletConnect requires explicit `init()` and `disable()` calls. The `connect()` action handles this automatically.

### 6. Multi-Chain Query Keys
React Query keys must account for multi-chain mode:
```typescript
const queryKey = useMemo(
  () => ["graz/balance", chainId, multiChain, address],
  [chainId, multiChain, address]
);
```

### 7. Reconnection Flow
On page load, `GrazEvents` checks for `_reconnect` flag and calls `reconnect()` if set. This restores the previous session.

---

## Future Refactoring Plan (Mentioned in Context)

The maintainer wants to reorganize into separate packages:

1. **@graz-sh/core**: Framework-agnostic core
   - Actions (connect, disconnect, sign, send)
   - Store logic
   - Wallet interface and utilities
   - Multi-chain utilities

2. **@graz-sh/react**: React-specific hooks
   - All hooks (useConnect, useAccount, etc.)
   - GrazProvider and context

3. **@graz-sh/connectors**: Wallet connectors as separate packages
   - @graz-sh/connector-keplr
   - @graz-sh/connector-leap
   - @graz-sh/connector-cosmostation
   - @graz-sh/connector-walletconnect
   - etc.

**Benefits**:
- Smaller bundle sizes (tree-shaking connectors)
- Framework portability (Vue, Svelte, vanilla JS)
- Easier maintenance (each connector is independent)
- Better versioning (connectors can update independently)

---

## Key Files Reference

### Essential Files for Understanding Graz

1. **`packages/graz/src/index.ts`**: Main exports, entry point
2. **`packages/graz/src/store/index.ts`**: State management (Zustand stores)
3. **`packages/graz/src/actions/account.ts`**: Core connection logic
4. **`packages/graz/src/actions/wallet/index.ts`**: Wallet selection and utilities
5. **`packages/graz/src/hooks/account.ts`**: Main React hooks for accounts
6. **`packages/graz/src/provider/index.tsx`**: GrazProvider setup
7. **`packages/graz/src/types/wallet.ts`**: Wallet interface and types
8. **`packages/graz/src/utils/multi-chain.ts`**: Multi-chain utilities

### Configuration Files

- **`turbo.json`**: Turborepo build pipeline
- **`pnpm-workspace.yaml`**: Workspace configuration
- **`packages/graz/package.json`**: Dependencies and exports
- **`packages/graz/tsup.config.ts`**: Build configuration
- **`packages/graz/tsconfig.json`**: TypeScript configuration

---

## Resources and Links

- **Documentation**: https://graz.sh/
- **GitHub**: https://github.com/graz-sh/graz
- **npm**: https://www.npmjs.com/package/graz
- **Cosmos SDK**: https://docs.cosmos.network/
- **CosmJS**: https://cosmos.github.io/cosmjs/
- **Keplr Docs**: https://docs.keplr.app/
- **WalletConnect**: https://docs.walletconnect.com/

---

## When Working on This Codebase

### Adding a New Hook

1. Create action function in `src/actions/` (if needed)
2. Create hook in `src/hooks/` that wraps action with `useMutation` or `useQuery`
3. Add multi-chain support if applicable (use `useChainsFromArgs` and `createMultiChainAsyncFunction`)
4. Export from `src/index.ts`
5. Add documentation to `docs/docs/hooks/`

### Adding a New Wallet

1. Create adapter file in `src/actions/wallet/` (e.g., `my-wallet.ts`)
2. Implement `getMyWallet()` function returning `Wallet` interface
3. Add wallet type to `WalletType` enum in `src/types/wallet.ts`
4. Add case to switch statement in `src/actions/wallet/index.ts` (`getWallet()`)
5. Test with example app
6. Update README and docs

### Modifying Store Schema

1. Update interface in `src/store/index.ts`
2. Update default values (`grazInternalDefaultValues` or `grazSessionDefaultValues`)
3. Increment `version` in persist options (triggers migration)
4. Update partialize function if adding persisted field
5. Update all code that reads/writes the field

### Debugging Tips

- **Check stores**: Use Zustand devtools or log `useGrazInternalStore.getState()`
- **React Query**: Use React Query Devtools
- **Wallet events**: Add console.logs to wallet adapters
- **Session storage**: Check `sessionStorage.getItem("graz-session")` and `localStorage.getItem("graz-internal")`
- **Multi-chain**: Log `useChainsFromArgs()` result to verify chain resolution

---

## Summary

Graz is a well-architected React library for Cosmos wallet integration with:
- Clear separation between actions (business logic) and hooks (React bindings)
- Robust state management via Zustand with persistence
- Powerful multi-chain support via utility functions
- Extensible wallet adapter pattern
- Strong TypeScript typing throughout

The codebase is currently monolithic but well-organized, with a clear path to modularization. When making changes, always consider multi-chain implications, SSR safety, and maintain the action/hook separation pattern.
