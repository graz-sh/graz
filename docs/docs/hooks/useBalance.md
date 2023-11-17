# useBalance

Hook to retrieve specific asset balance from current account or given address

#### Usage

```tsx
import { useBalance } from "graz";
function App() {
  const {
    data: balance,
    isLoading,
    refetch,
  } = useBalance({
    denom: "uatom",
    bech32Address: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
  });

  return (
    <div>
      Balance:
      {isLoading ? (
        "Fetching balances..."
      ) : (
        <span>
          {balance.amount} {balance.denom}
        </span>
      )}
      <button
        onClick={() => {
          void refetch();
        }}
      >
        Refresh
      </button>
    </div>
  );
}
```

#### Hook Params

```ts
{
  denom: string // Asset denom to search
  chainId: string
  bech32Address?: string // Optional bech32 account address, defaults to connected account address

}
```

#### Return Value

```tsx
{
  data: Coin | null; // from @cosmjs/proto-signing
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
  isPreviousData: boolean;
  isRefetchError: boolean;
  isRefetching: boolean;
  isStale: boolean;
  isSuccess: boolean;
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<Coin, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
