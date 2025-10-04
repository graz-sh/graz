# useQueryRaw

Query hook for dispatching a "raw" query to a CosmWasm smart contract's storage.

This hook uses the first active chain's CosmWasm client. For multi-chain raw queries, use `useCosmWasmClient` directly.

## Usage

### Basic Raw Query

```tsx
import { useQueryRaw } from "graz";

function QueryRawStorage() {
  const { data, isLoading, error } = useQueryRaw({
    address: "juno1contractaddress...",
    key: "config",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // data is Uint8Array, decode as needed
  const decoded = data ? new TextDecoder().decode(data) : null;

  return <div>Raw Data: {decoded}</div>;
}
```

### Decoding Binary Data

```tsx
import { useQueryRaw } from "graz";
import { fromUtf8 } from "@cosmjs/encoding";

function QueryWithDecoding() {
  const { data } = useQueryRaw({
    address: "juno1contract...",
    key: "state",
  });

  const decodedString = data ? fromUtf8(data) : null;
  const parsedData = decodedString ? JSON.parse(decodedString) : null;

  return <div>{parsedData && <pre>{JSON.stringify(parsedData, null, 2)}</pre>}</div>;
}
```

### Conditional Query

```tsx
import { useQueryRaw } from "graz";

function ConditionalRawQuery({ contractAddress, storageKey }: {
  contractAddress?: string;
  storageKey?: string;
}) {
  const { data, isLoading } = useQueryRaw({
    address: contractAddress, // Query only runs when both are defined
    key: storageKey,
  });

  return <div>{data && `Data length: ${data.length} bytes`}</div>;
}
```

## Multi-Chain Raw Queries

For raw queries on multiple chains, use `useCosmWasmClient` directly:

```tsx
import { useCosmWasmClient } from "graz";
import { useQuery } from "@tanstack/react-query";
import { toUtf8 } from "@cosmjs/encoding";

function MultiChainRawQuery() {
  const { data: clients } = useCosmWasmClient({
    chainId: ["juno-1", "stargaze-1"],
  });

  const { data: results } = useQuery({
    queryKey: ["multi-chain-raw-query", clients],
    queryFn: async () => {
      const junoClient = clients?.["juno-1"];
      const stargazeClient = clients?.["stargaze-1"];

      if (!junoClient || !stargazeClient) return null;

      const [junoRaw, stargazeRaw] = await Promise.all([
        junoClient.queryContractRaw("juno1contract...", toUtf8("config")),
        stargazeClient.queryContractRaw("stars1contract...", toUtf8("config")),
      ]);

      return {
        "juno-1": junoRaw,
        "stargaze-1": stargazeRaw,
      };
    },
    enabled: Boolean(clients?.["juno-1"] && clients?.["stargaze-1"]),
  });

  return (
    <div>
      {results && Object.entries(results).map(([chainId, data]) => (
        <div key={chainId}>
          {chainId}: {data ? `${data.length} bytes` : "No data"}
        </div>
      ))}
    </div>
  );
}
```

## Hook Params

```ts
{
  address?: string; // The address of the contract to query
  key?: string; // The key to lookup in the contract storage
}
```

**Note**: Query only executes when both `address` and `key` are defined.

## Return Value

```tsx
{
  data?: Uint8Array | null; // Raw binary data from contract storage
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
  refetch: (options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<Uint8Array | null, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```

## Working with Raw Data

Raw queries return `Uint8Array` data. Here are common ways to work with it:

### Decode as UTF-8 String

```tsx
import { fromUtf8 } from "@cosmjs/encoding";

const decodedString = data ? fromUtf8(data) : null;
```

### Decode as JSON

```tsx
import { fromUtf8 } from "@cosmjs/encoding";

const jsonData = data ? JSON.parse(fromUtf8(data)) : null;
```

### Use Native TextDecoder

```tsx
const decoded = data ? new TextDecoder().decode(data) : null;
```

## Difference from useQuerySmart

- **`useQueryRaw`**: Queries raw contract storage by key, returns `Uint8Array`
- **`useQuerySmart`**: Executes a smart contract query message, returns decoded JSON

Use `useQueryRaw` for direct storage access and `useQuerySmart` for standard contract queries.
