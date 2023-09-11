# useRecentChainIds

hook to retrieve last connected chainIds

#### Usage

```tsx
import { useRecentChainIds } from "graz";

function App() {
  const recentChainIds = useRecentChainIds();

  return (
    <div>
      <span>Connected to {recentChainIds.map((id) => id).join("; ")}</span>
    </div>
  );
}
```

#### Return Value

```tsx
string[] | undefined; // @keplr-wallet/types
```
