# useCheckWallet

Hook to check whether given `WalletType` or default configured wallet is supported

## Usage

```tsx
import { useCheckWallet, WalletType } from "graz";

const { data: isSupported } = useCheckWallet(WalletType.KEPLR);
const { data: isKeplrSupported } = useCheckWallet(WalletType.KEPLR);
```

## Enum

- WalletType
  ```ts
  {
    KEPLR = "keplr",
    VECTIS = "vectis",
    COSMOSTATION = "cosmostation",
    WALLETCONNECT = "walletconnect",
    WC_KEPLR_MOBILE = "wc_keplr_mobile",
    WC_COSMOSTATION_MOBILE = "wc_cosmostation_mobile",
    METAMASK_SNAP_COSMOS = "metamask_snap_cosmos",
    COSMIFRAME = "cosmiframe",
  }
  ```

## Types

- `WALLET_TYPES`
  ```ts
  {
    WalletType.KEPLR,
    WalletType.VECTIS,
    WalletType.WALLETCONNECT,
    WalletType.WC_KEPLR_MOBILE,
    WalletType.WC_COSMOSTATION_MOBILE,
    WalletType.METAMASK_SNAP_COSMOS,
    WalletType.COSMIFRAME,
  }
  ```

## Hook Params

```ts
type?: WalletType // you can check specific supported wallet
```

### Usage

```tsx
const { data: isKeplrSupported } = useCheckWallet("keplr");
```

## Return Value

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
