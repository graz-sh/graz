# useBalances

Hook for accesing account balances based on active chain's currencies.

#### Usage

`useBalances` receiving address, but not required. if the address empty it will fetching connected account based on active chain.

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
