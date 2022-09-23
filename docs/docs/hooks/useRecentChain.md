# useRecentChain

hook to retrieve last connected chain info

#### Usage

```tsx
import { useRecentChain, connect, mainnetChains } from "graz";
const { data: recentChain, clear } = useRecentChain();

try {
  connect(mainnetChains.cosmos);
} catch {
  connect(recentChain);
}
```

#### Return Value

```tsx
{
  data: {
          chainId: string;
          currencies: AppCurrency[];
          rest: string;
          rpc: string;
          rpcHeaders?: Dictionary;
          gas?: {
            price: string;
            denom: string;
          };
        } | null,
clear: () => void // clear recent chain
}
```
