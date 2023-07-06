# WalletType

`graz` supports multiple wallets, to choose a wallet we have an enum

<details><summary>Where do I need WalletType</summary>
<p>

- [`useConnect`](../hooks/useConnect.md)
- [`useCheckWallet`](../hooks/useCheckWallet.md)
- [`useSuggestChainAndConnect`](../hooks/useSuggestChainAndConnect.md)
- [`GrazProvider`](../provider/grazProvider.md)

</p>
</details>

#### Usage

```tsx
import { useAccount, useConnect, mainnetChains, WalletType } from "graz";

function App() {
  const { connect } = useConnect();
  const { isConnected, account } = useAccount();

  return (
    <div>
      {isConnected ? (
        account.bech32Address
      ) : (
        <button onClick={() => connect({ chain: mainnetChains.cosmoshub, walletType: WalletType.LEAP })}>
          Connect
        </button>
      )}
    </div>
  );
}
```

```tsx
enum WalletType {
  KEPLR = "keplr",
  LEAP = "leap",
  VECTIS = "vectis",
  COSMOSTATION = "cosmostation",
  WALLETCONNECT = "walletconnect",
  WC_KEPLR_MOBILE = "wc_keplr_mobile",
  WC_LEAP_MOBILE = "wc_leap_mobile",
  WC_COSMOSTATION_MOBILE = "wc_cosmostation_mobile",
}
```
