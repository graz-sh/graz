# useActiveChain

hook for accessing the `GrazChain` info based on connected chain/account

#### Usage

```tsx
import { useActiveChain } from "graz";

function App() {
  const activeChain = useActiveChain();

  return (
    <div>
      <span>Connected to {activeChain.chainId}</span>
    </div>
  );
}
```

#### Return Value

```tsx
{
  chainId: string;
  currencies: AppCurrency[]; // from @keplr-wallet/types
  rest: string;
  rpc: string;
}
```
