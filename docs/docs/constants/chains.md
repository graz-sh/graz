# Chains

`graz` provides the following mainnet and testnet chains.

### Mainnet

- axelar
- cosmoshub
- juno
- osmosis
- sommelier

### Testnet

- crescent
- juno
- osmosis

### Usage

```tsx
import { useSuggestAndConnect, useConnect, mainnetChains, testnetChains } from "graz";

function App() {
  // ...
  const { connect } = useConnect();
  const { suggestAndConnect } = useSuggestAndConnect();

  connect(mainnetChains.cosmos);
  suggestAndConnect(testnetChains.osmosis);
  // ...
}
```
