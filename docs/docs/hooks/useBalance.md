# useBalance

Hook to retrieve specific asset balance from current account or given address

#### Usage

```tsx
import { useBalance } from "graz";
function App() {
  const { data: atomBalance, isLoading, refetch } = useBalance("atom");

  // with custom bech32 address
  const userBalance = useBalance("atom", "cosmos1kpzxx2lxg05xxn8mfygrerhmkj0ypn8edmu2pu");

  return (
    <div>
      Atom Balance:
      {isLoading ? (
        "Fetching balances..."
      ) : (
        <span>
          {atomBalance.amount} {atomBalance.denom}
        </span>
      )}
    </div>
  );
}
```

#### Params

- denom: `string` = Asset denom to search
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
