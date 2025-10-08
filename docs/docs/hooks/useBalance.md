# useBalance

Hook to retrieve a specific asset balance for a specific chain and address using `client.getBalance()`. Returns a single `Coin | undefined`.

## Usage

```tsx
import { useBalance, useAccount } from "graz";

function App() {
  const { data: accounts } = useAccount();
  const account = accounts?.["cosmoshub-4"];

  const { data: balance, isLoading, refetch } = useBalance({
    chainId: "cosmoshub-4",
    bech32Address: account?.bech32Address || "",
    denom: "uatom",
    enabled: Boolean(account?.bech32Address),
  });

  return (
    <div>
      {isLoading ? (
        "Loading..."
      ) : (
        <div>
          Balance: {balance?.amount} {balance?.denom}
        </div>
      )}
      <button onClick={() => void refetch()}>Refresh</button>
    </div>
  );
}
```

### With Custom Address

```tsx
import { useBalance } from "graz";

function BalanceViewer() {
  const { data: balance } = useBalance({
    chainId: "cosmoshub-4",
    bech32Address: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
    denom: "uatom",
  });

  return (
    <div>
      {balance ? (
        <span>{balance.amount} ATOM</span>
      ) : (
        <span>No balance</span>
      )}
    </div>
  );
}
```

### Multiple Chains

To fetch balances for multiple chains, call `useBalance` for each chain:

```tsx
import { useBalance, useAccount } from "graz";

function MultiChainBalance() {
  const { data: accounts } = useAccount();

  const { data: cosmosBalance } = useBalance({
    chainId: "cosmoshub-4",
    bech32Address: accounts?.["cosmoshub-4"]?.bech32Address || "",
    denom: "uatom",
    enabled: Boolean(accounts?.["cosmoshub-4"]?.bech32Address),
  });

  const { data: osmosisBalance } = useBalance({
    chainId: "osmosis-1",
    bech32Address: accounts?.["osmosis-1"]?.bech32Address || "",
    denom: "uosmo",
    enabled: Boolean(accounts?.["osmosis-1"]?.bech32Address),
  });

  return (
    <div>
      <div>Cosmos Hub: {cosmosBalance?.amount} ATOM</div>
      <div>Osmosis: {osmosisBalance?.amount} OSMO</div>
    </div>
  );
}
```

## Hook Params

```ts
{
  chainId: string; // Single chain ID (required)
  bech32Address: string; // Address to query balance for (required)
  denom: string; // Asset denom to search (required)
  enabled?: boolean; // Optional, defaults to true
  // ... other react-query options
}
```

## Return Value

```tsx
{
  data?: Coin | undefined; // Coin from @cosmjs/proto-signing
  dataUpdatedAt: number;
  error: TError | null;
  errorUpdatedAt: number;
  failureCount: number;
  errorUpdateCount: number;
  isError: boolean;
  isFetched: boolean;
  isFetchedAfterMount: boolean;
  isFetching: boolean;
  isLoading: boolean;
  isLoadingError: boolean;
  isPaused: boolean;
  isPlaceholderData: boolean;
  isRefetchError: boolean;
  isRefetching: boolean;
  isStale: boolean;
  isSuccess: boolean;
  refetch: (options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<Coin | undefined, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
