---
name: graz
description: React hooks for Cosmos blockchain interactions — connect wallets, query balances, send tokens, sign messages. Use when building Cosmos dApps with graz hooks, setting up GrazProvider, connecting wallets, or performing transactions.
---

# Using the graz Library

React hooks for Cosmos blockchain interactions.

## Quick start

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider, useConnect, useAccount, useSendTokens, useStargateSigningClient } from "graz";
import { cosmoshub } from "graz/chains";

const queryClient = new QueryClient();
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider grazOptions={{ chains: [cosmoshub] }}>
        <Wallet />
      </GrazProvider>
    </QueryClientProvider>
  );
}

function Wallet() {
  const { connect } = useConnect();
  const { data: accounts, isConnected } = useAccount({ chainId: ["cosmoshub-4"] as const });
  const { data: signingClients } = useStargateSigningClient({ chainId: ["cosmoshub-4"] as const, enabled: isConnected });
  const { sendTokens } = useSendTokens();
  const addr = accounts?.["cosmoshub-4"]?.bech32Address;
  return (
    <button onClick={async () => {
      if (!addr) return connect();
      await sendTokens({ signingClient: signingClients?.["cosmoshub-4"], senderAddress: addr, recipientAddress: "cosmos1...", amount: [{ denom: "uatom", amount: "1000" }], fee: { amount: [{ denom: "uatom", amount: "500" }], gas: "200000" } });
    }}>{addr || "Connect"}</button>
  );
}
```

## Provider Setup

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider } from "graz";
import { cosmoshub } from "graz/chains";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider grazOptions={{ chains: [cosmoshub] }}>
        <YourApp />
      </GrazProvider>
    </QueryClientProvider>
  );
}
```

`GrazProvider` must be inside `QueryClientProvider`. The `chains` prop is required — pass `ChainInfo[]` (from `graz/chains`, `defineChainInfo()`, or manually).

## Configure Options

```ts
interface ConfigureGrazArgs {
  chains: ChainInfo[];
  defaultWallet?: WalletType;           // Default: Keplr
  chainsConfig?: Record<string, ChainConfig>;  // Per-chain: { rpcHeaders, gas: { price, denom } }
  autoReconnect?: boolean;              // Default: true
  walletConnect?: {                     // WalletConnect config
    options: { projectId: string };
    modalOptions?: ModalConfig;
  };
  walletDefaultOptions?: Keplr["defaultOptions"];
  multiChainFetchConcurrency?: number;  // Default: 3
  onNotFound?: () => void;
  onReconnectFailed?: () => void;
  iframeOptions?: IframeOptions;        // Cosmiframe config
  pingInteval?: number;                 // MS between pings, default: 1hr
  logger?: { enabled?: boolean; level?: LogLevel; categories?: (keyof typeof LogCategory)[] };
  paraConfig?: ParaGrazConfig;          // Para wallet config
}
```

## Chain Info

```ts
import { defineChainInfo, defineChains } from "graz";

// Type-safe helpers (identity functions)
const myChain = defineChainInfo({
  chainId: "mychain-1",
  currencies: [{ coinDenom: "TOKEN", coinMinimalDenom: "utoken", coinDecimals: 6 }],
  rpc: "https://rpc.example.com",
  rest: "https://rest.example.com",
  bech32Config: {
    bech32PrefixAccAddr: "mychain",
    bech32PrefixAccPub: "mychainpub",
    bech32PrefixValAddr: "mychainvaloper",
    bech32PrefixValPub: "mychainvaloperpub",
    bech32PrefixConsAddr: "mychainvalcons",
    bech32PrefixConsPub: "mychainvalconspub",
  },
  chainName: "My Chain",
  feeCurrencies: [{ coinDenom: "TOKEN", coinMinimalDenom: "utoken", coinDecimals: 6 }],
  stakeCurrency: { coinDenom: "TOKEN", coinMinimalDenom: "utoken", coinDecimals: 6 },
  bip44: { coinType: 118 },
});

defineChains({ cosmoshub, osmosis }); // Wraps Record<string, ChainInfo> for type safety
```

### CLI Generate

```bash
pnpm graz cli --generate                  # Generate all chains
pnpm graz cli --generate --mainnet cosmoshub,osmosis --testnet osmosistestnet
pnpm graz cli --generate --endpoint <url> # Custom registry endpoint
pnpm graz cli --generate --best           # Use lowest-latency endpoints
pnpm graz cli --generate --authz          # Authz-compatible chains only
```

Output goes to `packages/graz/chains/index.{js,mjs,ts}` (gitignored).

```ts
import { cosmoshub, osmosis, mainnetChains, testnetChains } from "graz/chains";
```

## Wallet Connection

### Connect

```ts
import { useConnect, useAccount, useDisconnect, useActiveWalletType, useCheckWallet } from "graz";
import { WalletType } from "graz";

// Mutation hook
const { connect, connectAsync, isLoading, isSuccess, isSupported, error } = useConnect();

connect();                                                  // Default wallet
connect({ walletType: WalletType.KEPLR });                  // Specific wallet
connect({ chainId: ["cosmoshub-4", "osmosis-1"] });        // Specific chains
connect({ walletType: WalletType.LEAP, chainId: ["cosmoshub-4"] });
connect({ autoReconnect: false });

// Actions (no hook)
import { connect, disconnect, getAvailableWallets, checkWallet, clearSession } from "graz";
await connect({ walletType: WalletType.KEPLR });
```

### Reactive Account State

```ts
// Single chain (generic Record)
const { data: accounts, isConnected, isConnecting, isDisconnected, status, reconnect } = useAccount();
const address = Object.values(accounts || {})[0]?.bech32Address;

// Multi-chain with typed chain IDs (use `as const`)
const { data: accounts } = useAccount({ chainId: ["cosmoshub-4", "osmosis-1"] as const });
// accounts?.["cosmoshub-4"] is Key | undefined — fully typed
// accounts?.["osmosis-1"] is Key | undefined
const atomAddress = accounts?.["cosmoshub-4"]?.bech32Address;
```

### Check Wallet Availability

```ts
// Reactive hook
const { data: isKeplrAvailable } = useCheckWallet(WalletType.KEPLR);
const { data: isCosmostationAvailable } = useCheckWallet(WalletType.COSMOSTATION);

// Imperative
const available = getAvailableWallets();  // Record<WalletType, boolean>
const supported = checkWallet();          // Default wallet
const cosmostationSupported = checkWallet(WalletType.COSMOSTATION);

// Active wallet info
const { walletType, isKeplr, isCosmostation, isWalletConnect } = useActiveWalletType();
```

### Disconnect

```ts
const { disconnect, disconnectAsync, isLoading } = useDisconnect();

disconnect();                              // All chains
disconnect({ chainId: ["cosmoshub-4"] });  // Specific chain only

// Actions
import { clearSession } from "graz";
clearSession();                            // Reset session + clear storage
```

### Wallet Events

Use `useWalletEvents` to react to committed wallet state changes. The hook owns
its subscription and automatically cleans it up when the component unmounts.

```tsx
import { useWalletEvents } from "graz";

function WalletEventObserver() {
  useWalletEvents({
    onAccountChange: ({ accounts, previousAccounts, changedChainIds, walletType }) => {
      console.log({ accounts, previousAccounts, changedChainIds, walletType });
    },
    onActiveChainsChange: ({ activeChainIds, previousActiveChainIds, walletType }) => {
      console.log({ activeChainIds, previousActiveChainIds, walletType });
    },
    onDisconnect: ({ chainIds, reason, walletType }) => {
      console.log({ chainIds, reason, walletType });
    },
  });

  return null;
}
```

`onActiveChainsChange` reports the complete set of connected
`activeChainIds`. It does not represent an EVM-style switch to one active
chain. Initial connection does not emit account or active-chain events.

For non-React consumers, subscribe imperatively and retain the cleanup
function:

```ts
import { subscribeWalletEvents } from "graz";

const unsubscribe = subscribeWalletEvents({
  onDisconnect: ({ reason }) => console.log(reason),
});

unsubscribe();
```

Balance changes are not wallet events. Use `useBalance` or `useBalances` and an
explicit refetch strategy when balance monitoring is required.

## Offline Signers

```ts
const { data: signers } = useOfflineSigners();
const { data: signers } = useOfflineSigners({ chainId: ["cosmoshub-4"] as const });

// signers?.["cosmoshub-4"] is OfflineSigners
const { offlineSigner, offlineSignerAmino, offlineSignerAuto } = signers?.["cosmoshub-4"] || {};

// Imperative
import { getOfflineSigners } from "graz";
const signers = await getOfflineSigners({ chainId: "cosmoshub-4", walletType: WalletType.KEPLR });
```

## Balance Queries

```ts
// All balances
const { data: balances } = useBalances({
  chainId: "cosmoshub-4",
  bech32Address: "cosmos1...",
  enabled: Boolean(address),
});
// balances is Coin[] | undefined

// Single denom
const { data: atomBalance } = useBalance({
  chainId: "cosmoshub-4",
  bech32Address: "cosmos1...",
  denom: "uatom",
  enabled: Boolean(address),
});
// atomBalance is Coin | undefined

// Staked balance
const { data: staked } = useBalanceStaked({
  chainId: "cosmoshub-4",
  bech32Address: "cosmos1...",
  enabled: Boolean(address),
});
```

## Clients

### Read Clients

```ts
const { data: stargateClients } = useStargateClient({
  chainId: ["cosmoshub-4"] as const,
  enabled: Boolean(connected),
});
// stargateClients?.["cosmoshub-4"] is StargateClient | undefined

const { data: cosmwasmClients } = useCosmWasmClient({
  chainId: ["neutron-1"] as const,
  enabled: Boolean(connected),
});
```

### Signing Clients (requires wallet connected)

```ts
const { data: signingClients, isLoading } = useStargateSigningClient({
  chainId: ["cosmoshub-4"] as const,
  enabled: isConnected,
  offlineSigner: "offlineSignerAuto",  // "offlineSigner" | "offlineSignerAuto" | "offlineSignerOnlyAmino"
});

const { data: cosmwasmSigningClients } = useCosmWasmSigningClient({
  chainId: ["neutron-1"] as const,
  enabled: isConnected,
});

// Use client
await signingClients?.["cosmoshub-4"]?.sendTokens(
  senderAddress,
  recipientAddress,
  [{ denom: "uatom", amount: "1000" }],
  { amount: [{ denom: "uatom", amount: "500" }], gas: "200000" }
);
```

## Transaction Hooks

```ts
// Send tokens
const { sendTokens, sendTokensAsync, isPending, isSuccess, isError, data, reset } = useSendTokens();

sendTokens({
  signingClient: signingClients?.["cosmoshub-4"],
  senderAddress: account?.bech32Address,
  recipientAddress: "cosmos1...",
  amount: [{ denom: "uatom", amount: "1000" }],
  fee: { amount: [{ denom: "uatom", amount: "500" }], gas: "200000" },
  memo: "optional memo",
});

// IBC transfer
const { sendIbcTokens } = useSendIbcTokens();

sendIbcTokens({
  signingClient,
  senderAddress,
  recipientAddress: "osmo1...",
  transferAmount: { denom: "uatom", amount: "1000" },
  sourcePort: "transfer",
  sourceChannel: "channel-0",
  timeoutTimestamp: (Date.now() + 600_000) * 1_000_000, // 10 min in nanos
  fee: { amount: [{ denom: "uatom", amount: "500" }], gas: "200000" },
});

// Execute smart contract
const { executeContract } = useExecuteContract();

executeContract({
  signingClient,
  senderAddress: account?.bech32Address,
  contractAddress: "cosmos1contract...",
  msg: { transfer: { recipient: "cosmos1...", amount: "100" } },
  fee: { amount: [{ denom: "uatom", amount: "500" }], gas: "300000" },
  funds: [{ denom: "uatom", amount: "100" }],
});

// Instantiate contract
const { instantiateContract } = useInstantiateContract();

instantiateContract({
  codeId: 1,
  signingClient,
  senderAddress: account?.bech32Address,
  msg: { name: "My Contract", symbol: "MYC" },
  label: "my-contract",
  fee: { amount: [{ denom: "uatom", amount: "5000" }], gas: "500000" },
});

// Query smart contract
const { data: queryResult } = useQuerySmart({
  address: "cosmos1contract...",
  queryMsg: { get_info: {} },
});
```

## Chain Management

```ts
// Suggest chain to wallet (no auto-connect)
const { suggest } = useSuggestChain();
await suggest({ chainInfo: cosmoshub, walletType: WalletType.KEPLR });

// Suggest + auto-connect
const { suggestAndConnect } = useSuggestChainAndConnect();
await suggestAndConnect({ chainInfo: osmosistestnet });

// Add chain (add to GrazProvider config at runtime)
const { addChain } = useAddChain();
await addChain({ chainInfo: myNewChain });

// Chain info hooks
const { data: chainInfo } = useChainInfo({ chainId: "cosmoshub-4" }); // Single
const { data: chainInfos } = useChainInfos({ chainId: ["cosmoshub-4", "osmosis-1"] }); // Filtered
const { data: activeChains } = useActiveChains(); // Currently connected
const { data: activeChainIds } = useActiveChainIds(); // Connected chain IDs

// Recent chains
const { data: recentChainIds, clear: clearRecentIds } = useRecentChainIds();
const { data: recentChains, clear: clearRecentChains } = useRecentChains();

// Actions
import { addChain, suggestChain, suggestChainAndConnect, getChainInfo, getChainInfos } from "graz";
```

## Multi-Chain API Pattern

**All hooks that accept `chainId` support three overloads:**

```ts
// 1. No chainId — returns generic Record<string, T>
useAccount();                              // Record<string, Key | undefined>

// 2. Single element tuple — typed Record with one key
useAccount({ chainId: ["cosmoshub-4"] as const });  // ChainIdToRecord<["cosmoshub-4"], Key | undefined>

// 3. Multi-element tuple — typed Record with multiple keys
useAccount({ chainId: ["cosmoshub-4", "osmosis-1"] as const });  // ChainIdToRecord<["cosmoshub-4", "osmosis-1"], Key | undefined>
```

This applies to: `useAccount`, `useOfflineSigners`, `useStargateClient`, `useCosmWasmClient`, `useStargateSigningClient`, `useCosmWasmSigningClient`.

The `UseMultiChainQueryResult<TChainIds, TData>` return type gives you:
```ts
TypeUseMultiChainQueryResult<TChainIds, TData> = UseQueryResult<
  TChainIds extends readonly string[] ? ChainIdToRecord<TChainIds, TData> : Record<string, TData>
>;
```

## Logger

```ts
import { LOG_CATEGORIES, LOG_FUNCTIONS, LOG_HOOKS, LogLevel, LogCategory } from "graz";

// In GrazProvider
<GrazProvider grazOptions={{
  chains: [...],
  logger: {
    enabled: true,
    level: LogLevel.DEBUG,
    categories: ["WALLET", "TRANSACTION"],
  },
}}/>;
```

## Key Types

```ts
import { WalletType, Key, Wallet, OfflineSigners, ConnectResult, UseMultiChainQueryResult, ChainConfig } from "graz";

// WalletType — enum for all supported wallets
WalletType.KEPLR, WalletType.COSMOSTATION,
WalletType.VECTIS, WalletType.WALLETCONNECT, WalletType.OKX,
WalletType.PARA, WalletType.INITIA, WalletType.CACTUSCOSMOS,
WalletType.COMPASS, WalletType.STATION, WalletType.XDEFI,
WalletType.COSMIFRAME, WalletType.METAMASK_SNAP_COSMOS,
WalletType.WC_KEPLR_MOBILE,
WalletType.WC_COSMOSTATION_MOBILE, WalletType.WC_CLOT_MOBILE

// Key — wallet account key
interface Key {
  name: string;
  algo: string;
  pubKey: Uint8Array;
  address: Uint8Array;
  bech32Address: string;
  isNanoLedger: boolean;
}

// OfflineSigners
interface OfflineSigners {
  offlineSigner: OfflineSigner;
  offlineSignerAmino: OfflineSignerAmino;
  offlineSignerAuto: OfflineSigner;
}

// Query config
interface QueryConfig { enabled?: boolean; }
interface MutationEventArgs<T = unknown, S = T> {
  onError?: (error: unknown, data: T) => unknown;
  onLoading?: (data: T) => unknown;
  onSuccess?: (data: S) => unknown;
}
```

## Quick Reference

| Task | Hook/Action |
|---|---|
| Connect wallet | `useConnect()` → `connect()` |
| Disconnect | `useDisconnect()` → `disconnect()` |
| Account state | `useAccount({ chainId })` |
| Wallet events | `useWalletEvents(handlers)`, `subscribeWalletEvents(handlers)` |
| Check wallet availability | `useCheckWallet(type)`, `getAvailableWallets()` |
| Active wallet info | `useActiveWalletType()` |
| Offline signers | `useOfflineSigners({ chainId })` |
| Read client | `useStargateClient({ chainId })`, `useCosmWasmClient({ chainId })` |
| Signing client | `useStargateSigningClient({ chainId })`, `useCosmWasmSigningClient({ chainId })` |
| Balances | `useBalances({ chainId, bech32Address })` |
| Single balance | `useBalance({ chainId, bech32Address, denom })` |
| Staked balance | `useBalanceStaked({ chainId, bech32Address })` |
| Send tokens | `useSendTokens()` |
| IBC transfer | `useSendIbcTokens()` |
| Execute contract | `useExecuteContract()` |
| Instantiate contract | `useInstantiateContract()` |
| Query contract | `useQuerySmart({ address, queryMsg })` |
| Query raw | `useQueryRaw({ address, key })` |
| Suggest chain | `useSuggestChain()`, `useSuggestChainAndConnect()` |
| Add chain | `useAddChain()` |
| Chain info | `useChainInfo({ chainId })`, `useChainInfos({ chainId })` |
| Active chains | `useActiveChains()`, `useActiveChainIds()` |
| Validators | `useQueryClientValidators({ queryClient })` |
