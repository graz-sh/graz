# useOfflineSigners

Hook to retrieve offline signer objects (default, amino enabled, and auto)

Note: signer objects is initialized after connecting an account.

#### Usage

```tsx
import { useOfflineSigners } from "graz";

function App() {
  const { signer, signerAmino, signerAuto } = useOfflineSigners();

  async function getAccountFromSigner() {
    return await signer.getAccount();
  }
}
```

#### Return Value

```tsx
{
  signer: (OfflineSigner & OfflineDirectSigner) | null;
  signerAmino: OfflineSigner | null;
  signerAuto: OfflineSigner | OfflineDirectSigner | null;
}
```
