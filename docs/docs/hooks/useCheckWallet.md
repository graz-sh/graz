# useCheckWallet

Hook to check whether given {@link WalletType} or default configured wallet is supported

#### Usage

```tsx
import { useCheckWallet, WalletType } from "graz";

const { data: isSupported } = useCheckWallet(WalletType.KEPLR);
const { data: isKeplrSupported } = useCheckWallet(WalletType.KEPLR);
```

#### Enum

- WalletType
  ```ts
  {
    KEPLR = "keplr",
    LEAP = "leap",
    VECTIS = "vectis",
    COSMOSTATION = "cosmostation",
    WALLETCONNECT = "walletconnect",
    WC_KEPLR_MOBILE = "wc_keplr_mobile",
    WC_LEAP_MOBILE = "wc_leap_mobile",
    WC_COSMOSTATION_MOBILE = "wc_cosmostation_mobile",
    METAMASK_SNAP_LEAP = "metamask_snap_leap",
  }
  ```

#### Types

- `WALLET_TYPES`
  ```ts
  {
    WalletType.KEPLR,
    WalletType.LEAP,
    WalletTyoe.VECTIS,
    WalletTyoe.WALLETCONNECT,
    WalletTyoe.WC_KEPLR_MOBILE,
    WalletTyoe.WC_LEAP_MOBILE,
    WalletTyoe.WC_COSMOSTATION_MOBILE,
    WalletTyoe.METAMASK_SNAP_LEAP,
  }
  ```

#### Hook Params

```ts
type?: WalletType // you can check specific supported wallet
```

##### Usage

const { data: isKeplrSupported } = useCheckWallet("keplr");

#### Return Value

```tsx
{
  data?: boolean;
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
