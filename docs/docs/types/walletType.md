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

```tsx
enum WalletType {
  KEPLR = "keplr",
  LEAP = "leap",
}
```
