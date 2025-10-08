# WALLET_TYPES

`graz` supports 13+ wallet integrations. We provide a constant array that contains all supported wallet types.

## Supported Wallets

- **Keplr** - Browser extension and mobile (via WalletConnect)
- **Leap** - Browser extension, mobile (via WalletConnect), and Metamask Snap
- **Cosmostation** - Browser extension and mobile (via WalletConnect)
- **Vectis** - Smart contract wallet
- **Station** - Terra Station wallet
- **XDefi** - Multi-chain wallet
- **Compass** - Compass wallet
- **Initia** - Initia wallet
- **OKX** - OKX wallet
- **Cactus Cosmos** - Cactus link Cosmos wallet
- **Para** - Para embedded wallet
- **Cosmiframe** - Iframe-based wallet integration
- **WalletConnect** - Generic WalletConnect integration
- **Metamask Snap** - Cosmos support via Metamask Snap

### Usage

```tsx
import { WALLET_TYPES, useConnect } from "graz";

export const SupportedWallet = () => {
  const { connect } = useConnect();
  return (
    <div>
      {WALLET_TYPES.map((name) => (
        <button onClick={connect({ chain: cosmoshub, walletType: name })} key={name}>
          {name}
        </button>
      ))}
    </div>
  );
};
```

## Return Value

```tsx
WALLET_TYPES: string[]
```
