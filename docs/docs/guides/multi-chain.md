# Multi Chain

You can connect to multiple chains with Graz.

### Setup

Configure your `chains` in the `grazOptions` object in the `GrazProvider` component.

```tsx
import { GrazProvider, WalletType } from "graz";

const cosmoshub = {
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
  // ... rest of cosmoshub ChainInfo
};

const sommelier = {
  chainId: "sommelier-1",
  chainName: "Sommelier",
  // ... rest of sommelier ChainInfo
};

const App = () => {
  return (
    <GrazProvider
      grazOptions={{
        chains: [cosmoshub, sommelier],
      }}
    >
      <Connect />
    </GrazProvider>
  );
};
```

You can configure the `ChainsConfig` for every specific chain.

```tsx
const App = () => {
  return (
    <GrazProvider
      grazOptions={{
        chains: [cosmoshub, sommelier],
        chainsConfig: {
          "cosmoshub-4": {
            gas: {
              price: "",
              denom: "",
            },
          },
          "sommelier-1": {
            gas: {
              price: "",
              denom: "",
            },
          },
        },
      }}
    >
      <Connect />
    </GrazProvider>
  );
};
```

### Connect to a specific chain

```tsx
import { useConnect } from "graz";

const Connect = () => {
  const { connect } = useConnect();
  return <button onClick={() => connect({ chainId: "cosmoshub-4" })}>Connect</button>;
};
```

### Connect to multiple chains

```tsx
import { useConnect } from "graz";

const Connect = () => {
  const { connect } = useConnect();
  return <button onClick={() => connect({ chainId: ["cosmoshub-4", "sommelier-1"] })}>Connect</button>;
};
```

### Concepts

Query Hooks that have multi chain data support:

- [useAccount](/docs/hooks/useAccount)
- [useBalance](/docs/hooks/useBalance)
- [useBalances](/docs/hooks/useBalances)
- [useBalanceStaked](/docs/hooks/useBalanceStaked)
- [useCosmWasmClient](/docs/hooks/useCosmWasmClient)
- [useCosmWasmSigningClient](/docs/hooks/useCosmWasmSigningClient)
- [useCosmWasmTmSigningClient](/docs/hooks/useCosmWasmTmSigningClient)
- [useStargateClient](/docs/hooks/useStargateClient)
- [useStargateSigningClient](/docs/hooks/useStargateSigningClient)
- [useStargateTmSigningClient](/docs/hooks/useStargateTmSigningClient)
- [useTendermintClient](/docs/hooks/useTendermintClient)

Our hooks have a special pattern to handle multiple chains. In every hooks above have this param

```ts
{
  multiChain?: boolean;
  chainId?: string | string[];
}
```

We use `multiChain?:boolean` in the hook param to handle multiple chains. If you want to use the hook for multiple chains, you need to pass `multiChain:true` in the hook param.

- if `multiChain` set to **true**, the hook return `data` type will be `Record<string, TData>` it won't care if `chainId` is a `string` or `string.length === 1`.
- if `multiChain` set to **false**, the hook return `data` type will be `TData`.

`chainId` is an optional hook param, so if you don't pass `chainId` in the hook param the `chains` is used from the `GrazProvider` component.

### Example

```tsx
import { useBalanceStaked } from "graz";
function App() {
  const { data: balanceStaked, isLoading } = useBalanceStaked({
    bech32Address: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
    chainId: ["cosmoshub-4", "sommelier-1"],
    multiChain: true,
  });

  return (
    <div>
      Balances:
      {isLoading ? (
        "Fetching staked balance..."
      ) : balanceStaked && Object.entries(balanceStaked).map([chainId, coin] => {
          return(
            <div>
              <p>{chainId} balance staked : {coin.amount} {coin.denom}</p>
            </div>
          );
        })
      }
    </div>
  );
}
```
