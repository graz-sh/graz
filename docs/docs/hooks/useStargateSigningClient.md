# useStargateSigningClient

Hook to retrieve a SigningStargateClient.

#### Usage

```tsx
import { useStargateSigningClient } from "graz";

function App() {
  const { data: signingClient, isFetching, refetch, ... } = useStargateSigningClient();

  async function getAccountFromClient() {
    return await client.getAccount("address")
  }
}
```

#### Params

```tsx
args?: { opts?: SigningStargateClientOptions }
```

#### Return Value

```tsx
{
  data: SigningStargateClient
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<SigningStargateClient | null, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
