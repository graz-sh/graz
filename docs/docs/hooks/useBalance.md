# useBalance

Hook to retrieve specific asset balance from current account or given address. Returns balances in a `Record<chainId, Coin>` format.

## Usage

```tsx
import { useBalance } from "graz";

function App() {
  const { data: balances, isLoading, refetch } = useBalance({
    chainId: ["cosmoshub-4", "osmosis-1"],
    denom: "uatom",
    bech32Address: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
  });

  const cosmosBalance = balances?.["cosmoshub-4"];
  const osmosisBalance = balances?.["osmosis-1"];

  return (
    <div>
      {isLoading ? (
        "Loading..."
      ) : (
        <>
          <div>Cosmos Hub: {cosmosBalance?.amount} {cosmosBalance?.denom}</div>
          <div>Osmosis: {osmosisBalance?.amount} {osmosisBalance?.denom}</div>
        </>
      )}
      <button onClick={() => void refetch()}>Refresh</button>
    </div>
  );
}
```

### Connected Account

```tsx
import { useBalance, useAccount } from "graz";

function MyBalance() {
  const { data: accounts } = useAccount({ chainId: ["cosmoshub-4"] });
  const account = accounts?.["cosmoshub-4"];

  // bech32Address is optional - uses connected account if not provided
  const { data: balances } = useBalance({
    chainId: ["cosmoshub-4"],
    denom: "uatom",
  });

  const balance = balances?.["cosmoshub-4"];

  return <div>{balance?.amount} ATOM</div>;
}
```

## Hook Params

```ts
{
  chainId?: string[]; // Array of chain IDs
  denom: string; // Asset denom to search
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
