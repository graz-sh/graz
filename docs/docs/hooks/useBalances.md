# useBalances

Hook to retrieve all balances from current account or given address

#### Usage

`useBalances` accepts an optional receiving address. If the address is empty it will fetch the connected account based on the active chain.

```tsx
import { useBalances } from "graz";
function App() {
  const address = "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430";
  const { data, isLoading } = useBalances(address);

  return (
    <div>
      Balances:
      {isLoading ? (
        "Fetching balances..."
      ) : (
        <ul>
          {data?.map((coin) => (
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

#### Params

- bech32Address?: `string` = Optional bech32 account address, defaults to connected account address

#### Return Value

```tsx
{
  data: Coin[] | null; // from @cosmjs/proto-signing
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<Coin[], unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
