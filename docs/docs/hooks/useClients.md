# useClients

Hook to retrieve a CosmWasmClient, StargateClient and Tendermint34Client.

#### Usage

```tsx
import { useClients } from "graz";

function App() {
  const { data } = useClients();
  const { cosmWasm, stargate, tendermint } = data;

  async function getAccountFromClient() {
    return await cosmWasm.getAccount();
  }
}
```

#### Params

Object params(Optional)
If there's no given arguments it will be using the current connected client

- rpc: `string`
- rpcHeaders?: `Dictionary<string> | undefined`

##### Usage with given params

```tsx
useSigningClients({
  rpc: "https://rpc.cosmoshub.strange.love",
});
```

#### Return Value

```tsx
{
  data: {
    cosmWasm: CosmWasmClient, // from @cosmjs/cosmwasm-stargate
    stargate: StargateClient, // from @cosmjs/stargate
    tendermint: Tendermint34Client // from "@cosmjs/tendermint-rpc
 };
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<Coin | null, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
