# useCosmWasmClient

Hook to retrieve a CosmWasmClient. Returns clients in a `Record<chainId, CosmWasmClient>` format.

## Usage

```tsx
import { useCosmWasmClient } from "graz";

function App() {
  const { data: clients, isFetching } = useCosmWasmClient({
    chainId: ["juno-1", "stargaze-1"],
  });

  async function queryContracts() {
    const junoClient = clients?.["juno-1"];
    const stargazeClient = clients?.["stargaze-1"];

    if (!junoClient || !stargazeClient) return;

    const junoData = await junoClient.queryContractSmart("juno1...", { query: {} });
    const stargazeData = await stargazeClient.queryContractSmart("stars1...", { query: {} });

    return { junoData, stargazeData };
  }

  return <div>...</div>;
}
```

### All Active Chains

```tsx
import { useCosmWasmClient } from "graz";

function App() {
  // Without chainId, uses all active chains
  const { data: clients } = useCosmWasmClient();

  return (
    <div>
      {clients && Object.entries(clients).map(([chainId, client]) => (
        <div key={chainId}>
          CosmWasm client ready for {chainId}
        </div>
      ))}
    </div>
  );
}
```

## Hook Params

```tsx
{
  chainId?: string[]; // Array of chain IDs, defaults to active chains
}
```

## Return Value

```tsx
{
  data?: Record<string, CosmWasmClient>; // CosmWasmClient from @cosmjs/cosmwasm-stargate
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
  isRefetchError: boolean;
  isRefetching: boolean;
  isStale: boolean;
  isSuccess: boolean;
  refetch: (options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<Record<string, CosmWasmClient>, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
