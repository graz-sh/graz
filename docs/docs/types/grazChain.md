# GrazChain

`graz` uses a lighter-weight implementation of Keplr's `ChainInfo` config called `GrazChain`.

`GrazChain` can't be passed to [`useSuggestChain`](../hooks/useSuggestChain.md) and [`useSuggestChainAndConnect`](../hooks/useSuggestChainAndConnect.md) hooks, because they require the full Keplr `ChainInfo` spec.

<details><summary>Where do I need GrazChain</summary>
<p>

- [`useConnect`](../hooks/useConnect.md)
- [`useBalances`](../hooks/useBalances.md)

</p>
</details>

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
