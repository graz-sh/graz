# getWallet

Function to return wallet object based on given `WalletType` or from store and throws an error if it does not exist on `window` or unknown wallet type

#### Usage

```tsx
import { getWallet } from "graz";

try {
  const wallet = getWallet();
  const keplr = getWallet("keplr");
} catch (error: Error) {
  console.error(error.message);
}
```
