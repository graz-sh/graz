# useIbcDomainToChainAddress

Hook to retrieve an address from given IBC domain and prefix.

#### Usage

```tsx
import { useIbcDomainToAddresses } from "graz";

// basic example
const { data, isFetching, refetch, ... } = useIbcDomainToAddresses({
 ibcDomain: "kikiding.cosmos",
 prefix: "osmo"
});

```

#### Params

- ibcDomain?: `string` - Optional ibc domain
- prefix? - `string` Optional string or bech32 prefix of the destination chain, for instance "cosmos", "somm", etc
- isTestnet?: `boolean` - Optional for pointing to testnet

Note: it will initiate if `ibcDomain` and `prefix` are there

#### Return Value

```tsx
{
  data: string | undefined | null;
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<string | undefined | null, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
