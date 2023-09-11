# useBalances

Hook to retrieve all balances from current account or given address

#### Usage

##### Single chain

```tsx
import { useBalances } from "graz";
function App() {
  const { data: balances, isLoading } = useBalances({
    bech32Address: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
  });

  return (
    <div>
      Balances:
      {isLoading ? (
        "Fetching balances..."
      ) : (
        <ul>
          {balances?.map((coin) => (
            <li key={coin.denom}>
              {coin.amount} {coin.denom}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

##### Multi chain

`useBalances` address handles multi chain addresses, so you need only to pass 1 chain address it will automatically convert address in other chain

```tsx
import { useBalances } from "graz";
function App() {
  const { data: balances, isLoading } = useBalances({
    bech32Address: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
    chainId: ["cosmoshub-4", "sommelier-1"],
    multiChain: true,
  });

  return (
    <div>
      Balances:
      {isLoading ? (
        "Fetching balances..."
      ) : balances && Object.entries(balances).map([chainId, coins] => {
          return(
            <div>
              <p>{chainId} balances</p>
              <ul>
                {coins?.map((coin) => (
                  <li key={coin.denom}>
                    {coin.amount} {coin.denom}
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      }
    </div>
  );
}
```

#### Hook Params

```tsx
<TMultiChain extends boolean>{
  chainId?: string | string[];
  multiChain?: TMultiChain; // boolean
  bech32Address?: string // Optional bech32 account address, defaults to connected account address
}
```

#### Return Value

```tsx
{
  data: TMultiChain extends true ? Record<string,  Coin[]> :  Coin[]; // from @cosmjs/proto-signing
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
  refetch:(options?: RefetchOptions & RefetchQueryFilters) => Promise<QueryObserverResult<TMultiChain extends true ? Record<string,  Coin[]> :  Coin[], unknown>>;
  remove: () => void;
  status: 'loading' | 'error' | 'success';
  fetchStatus: 'fetching' | 'paused' | 'idle';
}
```
