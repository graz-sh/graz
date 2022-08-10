# useBalances

Hook for accesing account balances based on active chain's currencies.

#### Usage

`useBalances` accepts an optional receiving address. If the address is empty it will fetch the connected account based on the active chain.

```tsx
import { useBalances } from "graz";
function App() {
  const address = "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430";
  const { data, isFetching } = useBalances(address);

  return (
    <div>
      Balances:
      {isFetching ? (
        "Fetching balances..."
      ) : (
        <ul>
          {data?.map((coin) => (
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

#### Return Value

```tsx
{
  data: Coin[] | null; // from @cosmjs/proto-signing
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  isSuccess: boolean;
  refetch: (options: {
    throwOnError: boolean
    cancelRefetch: boolean
  }) => Promise<Coin[]>
  status: "error" | "loading" | "success"
}
```
