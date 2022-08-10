# defineChains

The `defineChains` function allows you to standarized your chains info/config to interact with `graz` except `useSuggestChain` hook. `graz` use own `ChainInfo` config that called `GrazChain`

<details><summary>GrazChain</summary>
<p>

```tsx
interface GrazChain {
  chainId: string;
  currencies: any[];
  rest: string;
  rpc: string;
  rpcHeaders?: Dictionary<string>;
  gas?: { price: string; denom: string };
}
```

</p>
</details>

<details><summary>Where do I need GrazChain</summary>
<p>

- [useConnect](../hooks/useConnect.md)
- [useBalances](../hooks/useBalances.md)

</p>
</details>

#### Usage

to create your chains is simply create a record that filled with `GrazChain`

```tsx
import { defineChains, connect } from "graz";

export const myCustomChains = defineChains({
  cosmos: {
    chainId: "cosmoshub-4",
    currencies: [
      {
        coinDenom: "atom",
        coinMinimalDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
        coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
      },
    ],
    rpc: "https://rpc.cosmoshub.strange.love",
    rest: "https://api.cosmoshub.strange.love",
  },
});

connect(myCustomChains.cosmos);
```

#### Return Value

return a records that typed as your defined

```tsx
{
  string: GrazChain;
}
```
