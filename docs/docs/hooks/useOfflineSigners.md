# useOfflineSigners

Hook to retrieve offline signer objects (default, amino enabled, and auto). Returns signers in a `Record<chainId, OfflineSigners>` format.

## Usage

```tsx
import { useOfflineSigners } from "graz";

function App() {
  const { data: signers } = useOfflineSigners({
    chainId: ["cosmoshub-4", "osmosis-1"],
  });

  const cosmoshubSigner = signers?.["cosmoshub-4"]?.offlineSignerAuto;
  const osmosisSigner = signers?.["osmosis-1"]?.offlineSignerAuto;

  return <div>Signers ready for {Object.keys(signers || {}).length} chains</div>;
}
```

### All Active Chains

```tsx
import { useOfflineSigners } from "graz";

function App() {
  // Without chainId, uses all active chains
  const { data: signers } = useOfflineSigners();

  return (
    <div>
      {signers && Object.entries(signers).map(([chainId, signer]) => (
        <div key={chainId}>
          {chainId} signer ready
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

## Types

```ts
interface OfflineSigners {
  offlineSigner: OfflineAminoSigner & OfflineDirectSigner;
  offlineSignerAmino: OfflineAminoSigner;
  offlineSignerAuto: OfflineAminoSigner | OfflineDirectSigner;
}
```

## Return Value

```tsx
{
  data?: Record<string, OfflineSigners>; // From @cosmjs/proto-signing
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
  refetch: (options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<Record<string, OfflineSigners>, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
