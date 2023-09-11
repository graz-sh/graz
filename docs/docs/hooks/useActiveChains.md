# useActiveChains

hook to retrieve connected account's active `ChainInfo`s

#### Usage

```tsx
import { useActiveChains } from "graz";

function App() {
  const activeChains = useActiveChains();

  return (
    <div>
      <span>Connected to {activeChains.map((chain) => chain.chainName).join("; ")}</span>
    </div>
  );
}
```

#### Return Value

```tsx
ChainInfo[] | undefined; // @keplr-wallet/types
```
