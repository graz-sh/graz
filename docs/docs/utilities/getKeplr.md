# getKeplr

Function to return the `Keplr` object and throw an error if it does not exist

#### Usage

```tsx
import { getKeplr } from "graz";

try {
  const keplr = getKeplr();
} catch (error: Error) {
  console.error(error.message);
}
```
