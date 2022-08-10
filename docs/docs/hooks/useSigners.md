# useSigners

hook for accessing signers based on connected account

#### Usage

```tsx
import { useSigners } from "graz";

function App() {
  const { signer } = useSigners();

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
