# useActiveChainValidators

hook to retrieve active chain validators with given query client and optional bond status

#### Usage

```tsx
import { useQueryClient, useActiveChainValidators } from "graz";
import { setupStakingExtension } from "@cosmjs/stargate";

function App() {
  const queryClient = useQueryClient(setupStakingExtension);
  const { data: response } = useActiveChainValidators("juno");
}
```

#### Params

Object params

- queryClient: `T & StakingExtension` = @cosmjs/stargate query client object with `StakingExtension`
- status?: `"BOND_STATUS_BONDED" | "BOND_STATUS_UNBONDED" | "BOND_STATUS_UNBONDING"` = Validator bond status string (defaults to `BOND_STATUS_BONDED`)

#### Return Value

```tsx
{
    data?: QueryValidatorsResponse; // cosmjs-types/cosmos/staking/v1beta1/query
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
    refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<QueryValidatorsResponse, unknown>>;
    remove: () => void;
    status: 'loading' | 'error' | 'success';
    fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
