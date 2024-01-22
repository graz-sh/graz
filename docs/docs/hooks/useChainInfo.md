# useActiveChains

hook to retrieve `ChainInfo` object from `GrazProvider` with given `chainId`

#### Usage

```tsx
import { useChainInfo } from "graz";

function App() {
  const chainInfo = useChainInfo({ chainId: "cosmoshub-4" });

  return (
    <div>
      <span>{chainInfo.chainName}</span>
    </div>
  );
}
```

#### Return Value

```tsx
ChainInfo | undefined; // @keplr-wallet/types
```
