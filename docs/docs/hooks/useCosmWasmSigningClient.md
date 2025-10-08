# useCosmWasmSigningClient

Hook to retrieve a SigningCosmWasmClient. Returns signing clients in a `Record<chainId, SigningCosmWasmClient | null>` format.

## Usage

```tsx
import { useCosmWasmSigningClient } from "graz";

function App() {
  const { data: signingClients, isFetching } = useCosmWasmSigningClient({
    chainId: ["juno-1", "stargaze-1"],
  });

  async function executeOnMultipleChains() {
    const junoClient = signingClients?.["juno-1"];
    const stargazeClient = signingClients?.["stargaze-1"];

    if (!junoClient || !stargazeClient) return;

    const junoResult = await junoClient.execute(...);
    const stargazeResult = await stargazeClient.execute(...);

    return { junoResult, stargazeResult };
  }

  return <div>...</div>;
}
```

### With Per-Chain Options

```tsx
import { useCosmWasmSigningClient } from "graz";

function App() {
  const { data: signingClients } = useCosmWasmSigningClient({
    chainId: ["juno-1", "stargaze-1"],
    opts: {
      "juno-1": {
        gasPrice: "0.075ujuno",
      },
      "stargaze-1": {
        gasPrice: "1ustars",
      },
    },
  });

  return <div>...</div>;
}
```

### Instantiate Contract

```tsx
import { useCosmWasmSigningClient, useAccount } from "graz";

function InstantiateContract() {
  const { data: signingClients } = useCosmWasmSigningClient({
    chainId: ["juno-1"],
  });
  const { data: accounts } = useAccount({ chainId: ["juno-1"] });

  const signingClient = signingClients?.["juno-1"];
  const account = accounts?.["juno-1"];

  async function instantiate() {
    if (!signingClient || !account) return;

    const result = await signingClient.instantiate(
      account.bech32Address,
      1234, // codeId
      { count: 0 }, // init message
      "My Contract",
      "auto"
    );

    return result;
  }

  return <button onClick={instantiate}>Instantiate</button>;
}
```

## Hook Params

```tsx
{
  chainId?: string[]; // Array of chain IDs, defaults to active chains
  opts?: Record<string, SigningCosmWasmClientOptions>; // Per-chain options
}
```

## Return Value

```tsx
{
  data?: Record<string, SigningCosmWasmClient | null>; // SigningCosmWasmClient from @cosmjs/cosmwasm-stargate
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
  refetch: (options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<Record<string, SigningCosmWasmClient | null>, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
