# useActiveChainIds

hook to retrieve connected account's active chainIds

#### Usage

```tsx
import { useActiveChainIds } from "graz";

function App() {
  const activeChainIds = useActiveChainIds();

  return (
    <div>
      <span>Connected to {activeChainIds.map((id) => id).join("; ")}</span>
    </div>
  );
}
```

#### Return Value

```tsx
string[] | undefined; // @keplr-wallet/types
```
