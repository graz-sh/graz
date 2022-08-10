# useCheckKeplr

hook which returns boolean whether Keplr Wallet is supported

#### Usage

```tsx
import { useCheckKeplr } from "graz";
// basic example
const isSupported = useCheckKeplr();
if (isSupported) {
  // do something...
}
```

#### Return Value

```tsx
function useCheckKeplr(): boolean;
```
