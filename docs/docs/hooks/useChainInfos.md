# useActiveChains

hook to retrieve `ChainInfo` objects from `GrazProvider` with given `chainId`

#### Usage

```tsx
import { useChainInfos } from "graz";

function App() {
  const chainInfos = useChainInfos({ chainId: ["cosmoshub-4", "osmosis-1"] });
}
```

#### Return Value

```tsx
ChainInfo[] | undefined; // @keplr-wallet/types
```
