---
sidebar_position: 4
---

# WalletConnect

To integrate your DAPP with wallet connect using `graz` you need to have `projectId` from https://cloud.walletconnect.com/

### Configuration

```tsx
import { GrazProvider, WalletType } from "graz";

// example next.js application in _app.tsx
export default function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <GrazProvider
      grazOptions={{
        // ...
        walletConnect: {
          options: {
            projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
          },
        },
      }}
    >
      <Component {...pageProps} />
    </GrazProvider>
  );
}
```

`projectId` is required to interact with WalletConnect

For advance configuration see [`WalletConnectStore`](./types/WalletConnectStore.md)

### Usage

```tsx
import { getAvailableWallets, useConnect } from "graz";

export const AvailableWallets = () => {
  const { connect } = useConnect();
  const wallets = getAvailableWallets();

  return (
    <>
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

- if `walletConnect.options.projectId` not provided on `GrazProvider`, `WalletType.WALLETCONNECT` | `WalletType.WC_KEPLR_MOBILE` | `WalletType.WC_LEAP_MOBILE`| `WalletType.WC_COSMOSTATION_MOBILE` will return false
- `WalletType.WALLETCONNECT` is using `web3modal` for the modal, it will only shows the qr code. To connect and have deep linking to wallet mobile apps, use `WalletType.WC_KEPLR_MOBILE` |
  `WalletType.WC_LEAP_MOBILE`|
  `WalletType.WC_COSMOSTATION_MOBILE`
- `WalletType.WC_KEPLR_MOBILE` |
  `WalletType.WC_LEAP_MOBILE`|
  `WalletType.WC_COSMOSTATION_MOBILE` only returns true on mobile, `WalletType.WALLETCONNECT` will shows on anywhere
