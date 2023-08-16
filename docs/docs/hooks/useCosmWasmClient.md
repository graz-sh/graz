# useClients

Hook to retrieve a useCosmWasmClient.

#### Usage

```tsx
import { useCosmWasmClient } from "graz";

function App() {
  const { data: client, isFetching, refetch, ... } = useCosmWasmClient();

  async function getAccountFromClient() {
    return await client.getAccount("address")
  }
}
```

#### Return Value

```tsx
{
  data: CosmWasmClient
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<CosmWasmClient | null, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
