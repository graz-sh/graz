# useActiveWalletType

hook to retrieve current active [`WalletType`](../types/walletType.md)

#### Usage

```tsx
import { useActiveWalletType } from "graz";

function App() {
  const { walletType } = useActiveWalletType();

  return (
    <div>
      <span>Connected to {walletType}</span>
    </div>
  );
}
```

#### Return Value

```tsx
{
  walletType: boolean;
  isCosmostation: boolean;
  isCosmostationMobile: boolean;
  isKeplr: boolean;
  isKeplrMobile: boolean;
  isLeap: boolean;
  isLeapMobile: boolean;
  isWalletConnect: boolean;
}
```
