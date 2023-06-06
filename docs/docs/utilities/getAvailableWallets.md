# getAvailableWallets

Function to return wallets object based on wallet availability.

#### Usage

```tsx
import { getAvailableWallets, useConnect } from "graz";

export const AvailableWallets = () => {
  const wallets = getAvailableWallets();
  const { connect } = useConnect();

  return (
    <>
      {wallets.keplr && <button onClick={() => connect({ walletType: WalletType.KEPLR })}>Keplr</button>}
      {wallets.leap && <button onClick={() => connect({ walletType: WalletType.LEAP })}>Leap</button>}
      {wallets.cosmostation && (
        <button onClick={() => connect({ walletType: WalletType.COSMOSTATION })}>Cosmostation</button>
      )}
      {wallets.walletconnect && (
        <button onClick={() => connect({ walletType: WalletType.WALLETCONNECT })}>WalletConnect</button>
      )}
      {wallets.wc_keplr_mobile && (
        <button onClick={() => connect({ walletType: WalletType.WC_KEPLR_MOBILE })}>Keplr Mobile</button>
      )}
      {wallets.wc_leap_mobile && (
        <button onClick={() => connect({ walletType: WalletType.WC_LEAP_MOBILE })}>Leap Mobile</button>
      )}
      {wallets.wc_cosmostation_mobile && (
        <button onClick={() => connect({ walletType: WalletType.WC_COSMOSTATION_MOBILE })}>Cosmostation Mobile</button>
      )}
    </>
  );
};
```

#### Note:

- if `walletConnect.options.projectId` not provided `WalletType.WALLETCONNECT` | `WalletType.WC_KEPLR_MOBILE` | `WalletType.WC_LEAP_MOBILE`| `WalletType.WC_COSMOSTATION_MOBILE` will return false
- `wallet.WalletType.WALLETCONNECT` is using `web3modal` for the modal, it will only shows the qr code. To connect and have deep linking to wallet mobile apps, use `WalletType.WC_KEPLR_MOBILE` |
  `WalletType.WC_LEAP_MOBILE`|
  `WalletType.WC_COSMOSTATION_MOBILE`
- `WalletType.WC_KEPLR_MOBILE` |
  `WalletType.WC_LEAP_MOBILE`|
  `WalletType.WC_COSMOSTATION_MOBILE` only returns true on mobile
