# useBalanceStaked

Hook to retrieve staked balance for a specific chain and address. Returns a single `Coin`, or `null` when the address has no staked balance.

## Usage

```tsx
import { useBalanceStaked, useAccount } from "graz";

function App() {
  const { data: accounts } = useAccount();
  const account = accounts?.["cosmoshub-4"];

  const { data: stakedBalance, isLoading } = useBalanceStaked({
    chainId: "cosmoshub-4",
    bech32Address: account?.bech32Address || "",
    enabled: Boolean(account?.bech32Address),
  });

  return (
    <div>
      <h3>Staked Balance</h3>
      {isLoading ? (
        "Loading..."
      ) : (
        <p>{stakedBalance?.amount} {stakedBalance?.denom}</p>
      )}
    </div>
  );
}
```

### With Custom Address

```tsx
import { useBalanceStaked } from "graz";

function StakedBalanceViewer() {
  const { data: stakedBalance } = useBalanceStaked({
    chainId: "cosmoshub-4",
    bech32Address: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
  });

  return (
    <div>
      {stakedBalance ? (
        <span>{stakedBalance.amount} {stakedBalance.denom}</span>
      ) : (
        <span>No staked balance</span>
      )}
    </div>
  );
}
```

### Multiple Chains

To fetch staked balances for multiple chains, call `useBalanceStaked` for each chain:

```tsx
import { useBalanceStaked, useAccount } from "graz";

function MultiChainStakedBalances() {
  const { data: accounts } = useAccount();

  const { data: cosmosStaked } = useBalanceStaked({
    chainId: "cosmoshub-4",
    bech32Address: accounts?.["cosmoshub-4"]?.bech32Address || "",
    enabled: Boolean(accounts?.["cosmoshub-4"]?.bech32Address),
  });

  const { data: osmosisStaked } = useBalanceStaked({
    chainId: "osmosis-1",
    bech32Address: accounts?.["osmosis-1"]?.bech32Address || "",
    enabled: Boolean(accounts?.["osmosis-1"]?.bech32Address),
  });

  return (
    <div>
      <h4>Cosmos Hub Staked</h4>
      {cosmosStaked && <div>{cosmosStaked.amount} {cosmosStaked.denom}</div>}

      <h4>Osmosis Staked</h4>
      {osmosisStaked && <div>{osmosisStaked.amount} {osmosisStaked.denom}</div>}
    </div>
  );
}
```

## Hook Params

```tsx
{
  chainId: string; // Single chain ID (required)
  bech32Address: string; // Address to query staked balance for (required)
  enabled?: boolean; // Optional, defaults to true
  // ... other react-query options
}
```

## Return Value

```tsx
{
  data?: Coin | null; // Coin from @cosmjs/proto-signing, or null when there is no staked balance
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
  refetch: (options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<Coin | null, unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
