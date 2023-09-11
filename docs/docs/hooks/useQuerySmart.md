# useQuerySmart

Query hook for dispatching a "smart" query to a CosmWasm smart contract.
Note: it will initiate if `address` and `key` are there

#### Usage

```ts
import { useQuerySmart } from "graz";

interface TData {
  // ...
}

const { data, isLoading } = useQuerySmart<TData>({ address, queryMsg });
console.log(data);
```

#### Hook Params

```ts
<TData>{
  address?: string // The address of the contract to query
  queryMsg?: string // The key to lookup in the contract storage
}
```

#### Return Value

```tsx
{
  data: TData | unknown;
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<unknown, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
