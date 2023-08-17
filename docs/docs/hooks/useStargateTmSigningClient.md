# useStargateTmSigningClient

Hook to retrieve a SigningStargateClient with tendermint client.

#### Usage

```tsx
import { useStargateTmSigningClient } from "graz";

function App() {
  const { data: signingClient, isFetching, refetch, ... } = useStargateTmSigningClient({ type: "tm34" });

  async function getAccountFromClient() {
    return await client.getAccount("address")
  }
}
```

#### Params

```tsx
args?: {
  type: "tm34" | "tm37";
  opts?: SigningCosmWasmClientOptions;
  offlineSigner?: "offlineSigner" | "offlineSignerAuto" | "offlineSignerOnlyAmino";
}
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
