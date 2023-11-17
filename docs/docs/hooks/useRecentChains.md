# useRecentChains

hook to retrieve last connected `ChainInfo`s

#### Usage

```tsx
import { useRecentChains } from "graz";

function App() {
  const recentChains = useRecentChains();

  return (
    <div>
      <span>Last Connected : {recentChains.map((chain) => chain.chainName).join("; ")}</span>
    </div>
  );
}
```

#### Return Value

```tsx
ChainInfo[] | undefined; // @keplr-wallet/types
```
