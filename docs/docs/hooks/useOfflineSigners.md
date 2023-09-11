# useOfflineSigners

Hook to retrieve offline signer objects (default, amino enabled, and auto)

#### Usage

##### Single Chain

```tsx
import { useOfflineSigners } from "graz";

function App() {
  const { data } = useOfflineSigners();
  data.offlineSigner;
  data.offlineSignerAmino;
  data.offlineSignerAuto;
}
```

##### Multi Chain

```tsx
import { useOfflineSigners } from "graz";

function App() {
  const { data } = useOfflineSigners({
    chainId: ["cosmoshub-4", "sommelier-1"],
    multiChain: true,
  });
  const cosmoshubSigner = data?.["cosmoshub-4"].offlineSignerAuto;
  const sommSigner = data?.["sommelier-1"].offlineSignerAuto;
}
```

#### Hook Params

```tsx
<TMultiChain extends boolean>{
  chainId?: string | string[];
  multiChain?: TMultiChain; // boolean
}
```

#### Types

```ts
interface OfflineSigners {
  offlineSigner: OfflineAminoSigner & OfflineDirectSigner;
  offlineSignerAmino: OfflineAminoSigner;
  offlineSignerAuto: OfflineAminoSigner | OfflineDirectSigner;
}
```

#### Return Value

```tsx
{
  data: TMultiChain extends true ? Record<string,  OfflineSigners> :  OfflineSigners; // from @cosmjs/proto-signing
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<TMultiChain extends true ? Record<string,  OfflineSigners> :  OfflineSigners, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
