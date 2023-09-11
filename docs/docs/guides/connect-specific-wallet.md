# Connect a specific wallet

`graz` support multiple wallets, we have an array that contains our supported wallets

### Usage

```tsx
import { WALLET_TYPES, useConnect } from "graz";

export const SupportedWallet = () => {
  const { connect } = useConnect();
  return (
    <div>
      {WALLET_TYPES.map((name) => (
        <button onClick={connect({ chainId: "cosmoshub-4", walletType: name })} key={name}>
          {name}
        </button>
      ))}
    </div>
  );
};
```

#### Return Value

```tsx
WALLET_TYPES: string[]
```
