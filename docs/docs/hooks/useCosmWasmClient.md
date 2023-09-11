# useCosmWasmClient

Hook to retrieve a CosmWasmClient.

#### Usage

##### Single Chain

```tsx
import { useCosmWasmClient } from "graz";

function App() {
  const { data: client, isFetching, refetch, ... } = useCosmWasmClient();

  async function getAccountFromClient() {
    return await client.getAccount("address")
  }
}
```

##### Multi Chain

```tsx
import { useCosmWasmClient } from "graz";

function App() {
  const { data: client, isFetching, refetch, ... } = useCosmWasmClient({
    chainId: ["cosmoshub-4", "sommelier-1"],
    multiChain: true
  });

  async function getAccountFromClient() {
    return await client["cosmoshub-4"].getAccount("address")
  }
}
```

#### Hook Params

```tsx
<TMultiChain extends boolean>{
  chainId?: string | string[];
  multiChain?: TMultiChain; // boolean
}
```

#### Return Value

```tsx
{
  data?: TMultiChain extends true ? Record<string, CosmWasmClient> : CosmWasmClient;
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<TMultiChain extends true ? Record<string, CosmWasmClient> : CosmWasmClient;, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
