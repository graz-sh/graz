# useStargateSigningClient

Hook to retrieve a SigningStargateClient. Returns signing clients in a `Record<chainId, SigningStargateClient | null>` format.

## Usage

```tsx
import { useStargateSigningClient } from "graz";

function App() {
  const { data: signingClients, isFetching } = useStargateSigningClient({
    chainId: ["cosmoshub-4", "osmosis-1"],
  });

  async function sendOnMultipleChains() {
    const cosmosClient = signingClients?.["cosmoshub-4"];
    const osmosisClient = signingClients?.["osmosis-1"];

    if (!cosmosClient || !osmosisClient) return;

    const cosmosTx = await cosmosClient.sendTokens(...);
    const osmosisTx = await osmosisClient.sendTokens(...);

    return { cosmosTx, osmosisTx };
  }

  return <div>...</div>;
}
```

### With Per-Chain Options

```tsx
import { useStargateSigningClient } from "graz";

function App() {
  const { data: signingClients } = useStargateSigningClient({
    chainId: ["cosmoshub-4", "osmosis-1"],
    opts: {
      "cosmoshub-4": {
        gasPrice: "0.025uatom",
      },
      "osmosis-1": {
        gasPrice: "0.0025uosmo",
      },
    },
  });

  return <div>...</div>;
}
```

## Hook Params

```tsx
{
  chainId?: string[]; // Array of chain IDs, defaults to active chains
  opts?: Record<string, StargateClientOptions>; // Per-chain options
}
```

## Return Value

```tsx
{
  data?: Record<string, SigningStargateClient | null>; // SigningStargateClient from @cosmjs/stargate
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
  refetch: (options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<Record<string, SigningStargateClient | null>, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
