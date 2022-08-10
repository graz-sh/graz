# defineChains

`graz` uses a lighter-weight implementation of Keplr's `ChainInfo` config called `GrazChain`. The `defineChains` function allows you to set default chain info configurations for `graz`. The [`useSuggestChain`](../hooks/useSuggestChain.md) and [`useSuggestChainAndConnect`](../hooks/useSuggestChainAndConnect.md) hooks do not use these defaults, as they require the full Keplr `ChainInfo` spec. 

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

- [`useConnect`](../hooks/useConnect.md)
- [`useBalances`](../hooks/useBalances.md)

</p>
</details>

#### Usage

define your chain by populating a `GrazChain` record

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

```tsx
{
  string: GrazChain;
}
```
