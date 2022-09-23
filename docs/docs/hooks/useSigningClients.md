# useSigningClients

Hook to retrieve a SigningCosmWasmClient and SigningStargateClient.

#### Usage

```tsx
import { useSigningClients } from "graz";

function App() {
  const { data } = useSigningClients();
  const { cosmWasm, stargate } = data;

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
- offlineSignerAuto: `OfflineSigner | OfflineDirectSigner`;
- cosmWasmSignerOptions?: `SigningCosmWasmClientOptions`;
- stargateSignerOptions?: `SigningStargateClientOptions`;

##### Usage with given params

```tsx
useSigningClients({
  rpc: "https://rpc.cosmoshub.strange.love",
  offlineSigner: customOfflineSigner,
});
```

#### Return Value

```ts
{
  data: {
    cosmWasm: SigningCosmWasmClient, // from @cosmjs/cosmwasm-stargate
    stargate: SigningStargateClient, // from @cosmjs/stargate
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<{
    cosmWasm: SigningCosmWasmClient, // from @cosmjs/cosmwasm-stargate
    stargate: SigningStargateClient, // from @cosmjs/stargate
 } | null, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
