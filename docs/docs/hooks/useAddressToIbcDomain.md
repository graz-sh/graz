# useAddressToIbcDomain

Hook to retrieve an IBC domain from given address.

#### Usage

```tsx
  import { useAddressToIbcDomain } from "graz";

  // basic example
  const { data, isFetching, refetch, ... } = useAddressToIbcDomain({
    address: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
  });

```

#### Params

Object params

- address?: `string` - Optional, if `address` undefined this hook won't run
- isTestnet?: `boolean` - Optional for pointing to testnet

Note: it will initiate if `address` is there

#### Types

- `AddressToIbcDomainReturnValue`
  ```ts
  {
    domain: string;
    domainFull: string;
  }
  ```

#### Return Value

```tsx
{
  data: AddressToIbcDomainReturnValue | undefined | null;
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<AddressToIbcDomainReturnValue | undefined | null, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
