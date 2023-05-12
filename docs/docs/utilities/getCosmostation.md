# getCosmostation

Function to return the `window.cosmostation.providers.keplr` which is a `Keplr` object and throw an error if it does not exist

Cosmostation Docs: https://docs.cosmostation.io/integration-extension/cosmos/integrate-keplr

#### Usage

```tsx
import { getCosmostation } from "graz";

try {
  const cosmostation = getCosmostation();
} catch (error: Error) {
  console.error(error.message);
}
```
