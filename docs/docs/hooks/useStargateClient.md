# useStargateClient

Hook to retrieve a StargateClient. Returns clients in a `Record<chainId, StargateClient>` format.

## Usage

```tsx
import { useStargateClient } from "graz";

function App() {
  const { data: clients, isFetching, refetch } = useStargateClient({
    chainId: ["cosmoshub-4", "osmosis-1"],
  });

  async function getAccountsFromClients() {
    const cosmosClient = clients?.["cosmoshub-4"];
    const osmosisClient = clients?.["osmosis-1"];

    if (!cosmosClient || !osmosisClient) return;

    const cosmosAccount = await cosmosClient.getAccount("cosmos1...");
    const osmosisAccount = await osmosisClient.getAccount("osmo1...");

    return { cosmosAccount, osmosisAccount };
  }

  return <div>...</div>;
}
```

### All Active Chains

```tsx
import { useStargateClient } from "graz";

function App() {
  // Without chainId, uses all active chains
  const { data: clients } = useStargateClient();

  return (
    <div>
      {clients && Object.entries(clients).map(([chainId, client]) => (
        <div key={chainId}>
          Client ready for {chainId}
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
  data?: Record<string, StargateClient>; // StargateClient from @cosmjs/stargate
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
  refetch: (options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<Record<string, StargateClient>, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
