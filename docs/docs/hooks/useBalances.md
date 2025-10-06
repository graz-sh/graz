# useBalances

Hook to retrieve all balances for a specific chain and address. Returns an array of `Coin[]`.

## Usage

```tsx
import { useBalances, useAccount } from "graz";

function App() {
  const { data: accounts } = useAccount();
  const account = accounts?.["cosmoshub-4"];

  const { data: balances, isLoading } = useBalances({
    chainId: "cosmoshub-4",
    bech32Address: account?.bech32Address || "",
    enabled: Boolean(account?.bech32Address),
  });

  return (
    <div>
      <h3>Cosmos Hub Balances</h3>
      {isLoading ? (
        "Loading..."
      ) : (
        <ul>
          {balances?.map((coin) => (
            <li key={coin.denom}>
              {coin.amount} {coin.denom}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### With Custom Address

```tsx
import { useBalances } from "graz";

function BalancesViewer() {
  const { data: balances } = useBalances({
    chainId: "cosmoshub-4",
    bech32Address: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
  });

  return (
    <div>
      {balances?.map((coin) => (
        <div key={coin.denom}>
          {coin.amount} {coin.denom}
        </div>
      ))}
    </div>
  );
}
```

### Multiple Chains

To fetch balances for multiple chains, call `useBalances` for each chain:

```tsx
import { useBalances, useAccount } from "graz";

function MultiChainBalances() {
  const { data: accounts } = useAccount();

  const { data: cosmosBalances } = useBalances({
    chainId: "cosmoshub-4",
    bech32Address: accounts?.["cosmoshub-4"]?.bech32Address || "",
    enabled: Boolean(accounts?.["cosmoshub-4"]?.bech32Address),
  });

  const { data: osmosisBalances } = useBalances({
    chainId: "osmosis-1",
    bech32Address: accounts?.["osmosis-1"]?.bech32Address || "",
    enabled: Boolean(accounts?.["osmosis-1"]?.bech32Address),
  });

  return (
    <div>
      <h4>Cosmos Hub</h4>
      {cosmosBalances?.map((coin) => (
        <div key={coin.denom}>{coin.amount} {coin.denom}</div>
      ))}

      <h4>Osmosis</h4>
      {osmosisBalances?.map((coin) => (
        <div key={coin.denom}>{coin.amount} {coin.denom}</div>
      ))}
    </div>
  );
}
```

## Hook Params

```tsx
{
  chainId: string; // Single chain ID (required)
  bech32Address: string; // Address to query balances for (required)
  enabled?: boolean; // Optional, defaults to true
  // ... other react-query options
}
```

## Return Value

```tsx
{
  data?: Coin[]; // Coin from @cosmjs/proto-signing
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
  refetch: (options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<Coin[], unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
