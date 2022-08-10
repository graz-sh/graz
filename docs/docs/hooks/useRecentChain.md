# useRecentChain

hook to retrieve last connected chain info

#### Usage

```tsx
import { useRecentChain, connect, mainnetChains } from "graz";
const recentChain = useRecentChain();
try {
  connect(mainnetChains.cosmos);
} catch {
  connect(recentChain);
}
```

#### Return Value

```tsx
{
  chainId: string;
  currencies: AppCurrency[];
  rest: string;
  rpc: string;
  rpcHeaders?: Dictionary;
  gas?: {
    price: string;
    denom: string;
  };
} | null
```
