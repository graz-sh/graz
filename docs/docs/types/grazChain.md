# GrazChain

`graz` uses a dedicated `ChainInfo` config called `GrazChain`

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
