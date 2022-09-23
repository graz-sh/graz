# useCheckWallet

Hook to check whether given {@link WalletType} or default configured wallet is supported

#### Usage

```tsx
import { useCheckWallet } from "graz";

const { data: isSupported } = useCheckWallet();
const { data: isKeplrSupported } = useCheckWallet("keplr");
```

#### Enum

- WalletType
  ```ts
  {
    KEPLR = "keplr",
    LEAP = "leap",
  }
  ```

#### Types

- `WALLET_TYPES`
  ```ts
  {
    WalletType.KEPLR,
    WalletType.LEAP,
  }
  ```

#### Params

- type?: `WalletType` = you can check specific supported wallet

##### Usage

const { data: isKeplrSupported } = useCheckWallet("keplr");

#### Return Value

```tsx
{
  data: boolean;
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<boolean, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
