# getLeap

Function to return the `Leap` object and throw an error if it does not exist

#### Usage

```tsx
import { getLeap } from "graz";

try {
  const leap = getLeap();
} catch (error: Error) {
  console.error(error.message);
}
```
