# useClients

Hook to retrieve a TendermintClient.

#### Usage

```tsx
import { useTendermintClient } from "graz";

function App() {
  const { data: client, isFetching, refetch, ... } = useTendermintClient("tm34");

  async function getAccountFromClient() {
    return await client.getAccount("address")
  }
}
```

#### Params

```tsx
{
  type: "tm34" | "tm37";
}
```

#### Return Value

```tsx
{
  data: TendermintClient
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<TendermintClient | null, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
