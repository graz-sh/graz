# getLeap

Function to return the `window.leap` which is a `Keplr` object and throw an error if it does not exist.

Leap Docs: https://docs.leapwallet.io/cosmos/for-dapps-connect-to-leap/add-leap-to-existing-keplr-integration

#### Usage

```tsx
import { getLeap } from "graz";

try {
  const leap = getLeap();
} catch (error: Error) {
  console.error(error.message);
}
```
