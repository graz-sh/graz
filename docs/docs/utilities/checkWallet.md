# checkWallet

Function to return a `boolean` whether a wallet is available or not

#### Usage

```tsx
import { checkWallet, WalletType } from "graz";

const isKeplrReady = checkWallet(WalletType.KEPLR);

isKeplrReady && (
  <button onClick={() => connect({ chainId: "cosmoshub-4", walletType: WalletType.KEPLR })}>Connect with Keplr</button>
);
```
