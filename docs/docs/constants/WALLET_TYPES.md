# WALLET_TYPES

`graz` support multiple wallets, we have an array that contains our supported wallets

### Usage

```tsx
import { WALLET_TYPES, useConnect, mainnetChains } from "graz";

export const SupportedWallet = () => {
  const { connect } = useConnect();
  return (
    <div>
      {WALLET_TYPES.map((item) => (
        <button onClick={connect({ chain: mainnetChains.cosmoshub, walletType: item })} key={item}>
          {item}
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
