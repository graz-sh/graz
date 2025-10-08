# WalletType

`graz` supports 12+ wallet integrations. Use the `WalletType` enum to specify which wallet to connect.

<details>
<summary>Where do I need WalletType</summary>

- [`useConnect`](../hooks/useConnect.md)
- [`useCheckWallet`](../hooks/useCheckWallet.md)
- [`useSuggestChainAndConnect`](../hooks/useSuggestChainAndConnect.md)
- [`GrazProvider`](../provider/grazProvider.md)

</details>

## Usage

```tsx
import { useAccount, useConnect, WalletType } from "graz";

function App() {
  const { connect } = useConnect();
  const { isConnected, account } = useAccount();

  return (
    <div>
      {isConnected ? (
        account.bech32Address
      ) : (
        <button onClick={() => connect({ chainId: "cosmoshub-4", walletType: WalletType.LEAP })}>Connect</button>
      )}
    </div>
  );
}
```

```tsx
enum WalletType {
  // Browser Extension Wallets
  KEPLR = "keplr",
  LEAP = "leap",
  COSMOSTATION = "cosmostation",
  COMPASS = "compass",
  XDEFI = "xdefi",
  STATION = "station",
  OKX = "okx",
  INITIA = "initia",
  CACTUSCOSMOS = "cactuscosmos",

  // Embedded & Smart Contract Wallets
  VECTIS = "vectis",
  PARA = "para",
  COSMIFRAME = "cosmiframe",

  // WalletConnect Integrations
  WALLETCONNECT = "walletconnect",
  WC_KEPLR_MOBILE = "wc_keplr_mobile",
  WC_LEAP_MOBILE = "wc_leap_mobile",
  WC_COSMOSTATION_MOBILE = "wc_cosmostation_mobile",
  WC_CLOT_MOBILE = "wc_clot_mobile",

  // Metamask Snap Integrations
  METAMASK_SNAP_LEAP = "metamask_snap_leap",
  METAMASK_SNAP_COSMOS = "metamask_snap_cosmos",
}
```

## Wallet Categories

### Browser Extensions

Standard browser extension wallets that inject into the `window` object.

### Embedded Wallets

- **PARA**: Embedded wallet with authentication via Para
- **VECTIS**: Smart contract wallet
- **COSMIFRAME**: Iframe-based integration for embedded contexts

### Mobile via WalletConnect

Mobile wallet connections using the WalletConnect protocol. Requires WalletConnect configuration in `GrazProvider`.

### Metamask Snap

Cosmos support through Metamask Snap extensions.

## See Also

- [useConnect](../hooks/useConnect.md) - Connect to wallets
- [GrazProvider](../provider/grazProvider.md) - Configure wallet options
- [WalletConnect Guide](../wallet-connect.md) - WalletConnect setup
