# useActiveChainCurrency

hook to retrieve specific connected chains currency

#### Usage

```tsx
import { useActiveChainCurrency } from "graz";

function App() {
  const { data: currency, ... } = useActiveChainCurrency({ denom: "juno" });
}
```

#### Hook Params

```ts
denom: string; //Currency denom to search
```

#### Return Value

```tsx
{
    data?: AppCurrency; // @keplr-wallet/types
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
    refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<AppCurrency, unknown>>;
    remove: () => void;
    status: 'loading' | 'error' | 'success';
    fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
