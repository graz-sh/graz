# getKeplr

Function to return `Keplr` object and throws and error if it does not exist on window

#### Usage

```tsx
import { getKeplr } from "graz";

try {
  const keplr = getKeplr();
} catch (error: Error) {
  console.error(error.message);
}
```
