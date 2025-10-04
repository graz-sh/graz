# useBalances

Hook to retrieve all balances from current account or given address. Returns balances in a `Record<chainId, Coin[]>` format.

## Usage

```tsx
import { useBalances } from "graz";

function App() {
  const { data: balances, isLoading } = useBalances({
    chainId: ["cosmoshub-4", "osmosis-1"],
    bech32Address: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
  });

  return (
    <div>
      <h3>Balances</h3>
      {isLoading ? (
        "Loading..."
      ) : (
        balances && Object.entries(balances).map(([chainId, coins]) => (
          <div key={chainId}>
            <h4>{chainId}</h4>
            <ul>
              {coins?.map((coin) => (
                <li key={coin.denom}>
                  {coin.amount} {coin.denom}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
```

### Connected Account

```tsx
import { useBalances, useAccount } from "graz";

function MyBalances() {
  const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });

  // bech32Address is optional - uses connected account if not provided
  const { data: balances } = useBalances({
    chainId: ["cosmoshub-4"],
  });

  const cosmosBalances = balances?.["cosmoshub-4"];

  return (
    <div>
      {cosmosBalances?.map((coin) => (
        <div key={coin.denom}>
          {coin.amount} {coin.denom}
        </div>
      ))}
    </div>
  );
}
```

## Hook Params

```tsx
{
  chainId?: string[]; // Array of chain IDs
  bech32Address?: string; // Optional address, defaults to connected account
}
```

## Return Value

```tsx
{
  data?: Record<string, Coin[]>; // Coin from @cosmjs/proto-signing
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
  refetch: (options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<Record<string, Coin[]>, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
