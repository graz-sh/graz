# useQueryClient

Hook to create and use @cosmjs/stargate's `QueryClient`

Note: `useQueryClient` returns @cosmjs/stargate's `QueryClient`
**NOT to be confused with @tanstack/react-query useQueryClient**

#### Usage

```tsx
import { useQueryClient } from "graz";
import { setupAuthExtension, setupIbcExtension } from "@cosmjs/stargate";

function App() {
  // without extensions
  const queryClient = useQueryClient();
  // with extensions
  const queryClientWithExtensions = useQueryClient(setupAuthExtension, setupIbcExtension);
}
```

#### Params

- extensionSetups?: `ExtensionSetup[]` = Optional extension setup for creating the @cosmjs/stargate's `QueryClient`

#### Return Value

```tsx
{
  data: any;
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<any, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
