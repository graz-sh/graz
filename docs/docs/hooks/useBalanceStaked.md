# useBalanceStaked

Hook to retrieve staked balance from current account or given address. Returns staked balances in a `Record<chainId, Coin>` format.

## Usage

```tsx
import { useBalanceStaked } from "graz";

function App() {
  const { data: stakedBalances, isLoading } = useBalanceStaked({
    chainId: ["cosmoshub-4", "osmosis-1"],
    bech32Address: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
  });

  return (
    <div>
      <h3>Staked Balances</h3>
      {isLoading ? (
        "Loading..."
      ) : (
        stakedBalances && Object.entries(stakedBalances).map(([chainId, coin]) => (
          <div key={chainId}>
            <p>{chainId}: {coin.amount} {coin.denom}</p>
          </div>
        ))
      )}
    </div>
  );
}
```

### Connected Account

```tsx
import { useBalanceStaked, useAccount } from "graz";

function MyStakedBalance() {
  const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });

  // bech32Address is optional - uses connected account if not provided
  const { data: stakedBalances } = useBalanceStaked({
    chainId: ["cosmoshub-4"],
  });

  const staked = stakedBalances?.["cosmoshub-4"];

  return (
    <div>
      Staked: {staked?.amount} {staked?.denom}
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
  data?: Record<string, Coin>; // Coin from @cosmjs/proto-signing
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
  refetch: (options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<Record<string, Coin>, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
