# useQuerySmart

Query hook for dispatching a "smart" query to a CosmWasm smart contract.

This hook uses the first active chain's CosmWasm client. For multi-chain contract queries, use `useCosmWasmClient` directly.

## Usage

### Basic Query

```tsx
import { useQuerySmart } from "graz";

interface CountResponse {
  count: number;
}

function QueryContract() {
  const { data, isLoading, error } = useQuerySmart<CountResponse>({
    address: "juno1contractaddress...",
    queryMsg: { get_count: {} },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Count: {data?.count}</div>;
}
```

### Conditional Query

```tsx
import { useQuerySmart } from "graz";

function ConditionalQuery({ contractAddress }: { contractAddress?: string }) {
  const { data, isLoading } = useQuerySmart({
    address: contractAddress, // Query only runs when address is defined
    queryMsg: { get_data: {} },
  });

  return <div>{data && JSON.stringify(data)}</div>;
}
```

### With Polling/Refetching

```tsx
import { useQuerySmart } from "graz";

function PollingQuery() {
  const { data, refetch } = useQuerySmart({
    address: "juno1contract...",
    queryMsg: { get_price: {} },
  });

  return (
    <div>
      <div>Price: {data?.price}</div>
      <button onClick={() => refetch()}>Refresh Price</button>
    </div>
  );
}
```

## Multi-Chain Contract Queries

For querying contracts on multiple chains, use `useCosmWasmClient` directly:

```tsx
import { useCosmWasmClient } from "graz";
import { useQuery } from "@tanstack/react-query";

function MultiChainContractQuery() {
  const { data: clients } = useCosmWasmClient({
    chainId: ["juno-1", "stargaze-1"],
  });

  const { data: results } = useQuery({
    queryKey: ["multi-chain-contract-query", clients],
    queryFn: async () => {
      const junoClient = clients?.["juno-1"];
      const stargazeClient = clients?.["stargaze-1"];

      if (!junoClient || !stargazeClient) return null;

      const [junoData, stargazeData] = await Promise.all([
        junoClient.queryContractSmart("juno1contract...", { get_count: {} }),
        stargazeClient.queryContractSmart("stars1contract...", { get_count: {} }),
      ]);

      return {
        "juno-1": junoData,
        "stargaze-1": stargazeData,
      };
    },
    enabled: Boolean(clients?.["juno-1"] && clients?.["stargaze-1"]),
  });

  return (
    <div>
      {results && Object.entries(results).map(([chainId, data]) => (
        <div key={chainId}>
          {chainId}: {JSON.stringify(data)}
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
  queryMsg?: Record<string, unknown>; // The query message object
}
```

**Note**: Query only executes when both `address` and `queryMsg` are defined.

## Return Value

```tsx
{
  data?: TData; // Query result (generic type)
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
  refetch: (options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<TData, TError>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```

## Type Safety

For better type safety, define your query message and response types:

```tsx
interface CountQueryMsg {
  get_count: {};
}

interface CountResponse {
  count: number;
}

function TypeSafeQuery() {
  const { data } = useQuerySmart<CountResponse>({
    address: "juno1contract...",
    queryMsg: { get_count: {} } as CountQueryMsg,
  });

  // data is strongly typed as CountResponse
  return <div>{data?.count}</div>;
}
```
