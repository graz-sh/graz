# useIbcDomainDetails

Hook to retrieve a ibc domain details from given ibc domain.

#### Usage

```tsx
import { useIbcDomainDetails } from "graz";

// basic example
const { data, isFetching, refetch, ... } = useIbcDomainDetails({
 ibcDomain: "kikiding.cosmos",
});

```

#### Params

Object params

- ibcDomain?: `string` - Optional ibc domain, if `ibcDomain` undefined this hook won't run
- isTestnet?: `boolean` - Optional for pointing to testnet

Note: it will initiate if `ibcDomain` is there

#### Types

- `DomainDetails`
  ```ts
  {
    expiration: string | null;
    imageData: string | null;
    twitterId: string | null;
    discordId: string | null;
    telegramId: string | null;
    keybaseId: string | null;
    pgpPublicKey: string | null;
  }
  ```

#### Return Value

```tsx
{
  data: DomainDetails | undefined | null;
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<DomainDetails | undefined | null, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
