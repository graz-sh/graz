# Connect wallet

You can connect to a specific wallet by using the `useConnect` hook. You can connect to a specific wallet by passing the `walletType` parameter to the `connect` function.

Read more about [wallet types](../types/walletType.md).

### Set default wallet

You can set a default wallet type by passing the `defaultWalletType` parameter into `grazProvider` in `<GrazProvider/>`.

```tsx
import { GrazProvider, WalletType } from "graz";

const App = () => {
  return (
    <GrazProvider
      grazOptions={{
        chains: [...]
        defaultWalletType: WalletType.KEPLR,
      }}
    >
      <Connect />
    </GrazProvider>
  );
};
```

You don't need to pass the walletType parameter to the connect function, it will use the default wallet type.

```tsx
const Connect = () => {
  const { connect } = useConnect();
  return <button onClick={() => connect({ chainId: "cosmoshub-4" })}>Connect</button>;
};
```

### Connect to a specific wallet

```tsx
import { WalletType } from "graz";
const Connect = () => {
  const { connect } = useConnect();
  return <button onClick={() => connect({ chainId: "cosmoshub-4", walletType: WalletType.LEAP })}>Connect</button>;
};
```

### Check if wallet supported

```tsx
import { WalletType, checkWallet } from "graz";

const isKeplrSupported = checkWallet(WalletType.KEPLR);

return (
  <>
    {isKeplrSupported && (
      <button onClick={() => connect({ chainId: "cosmoshub-4", walletType: WalletType.KEPLR })}>Connect</button>
    )}
  </>
);
```

### List all wallet

We have `WALLET_TYPES` it's an array of WalletType.

```tsx
WALLET_TYPES: WalletType[]
```

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

### List all wallets but show only supported wallet

You can combine `WALLET_TYPES` and `checkWallet` to show only supported wallets.

```tsx
import { WALLET_TYPES, checkWallet, useConnect } from "graz";

export const SupportedWallet = () => {
  const { connect } = useConnect();
  return (
    <div>
      {WALLET_TYPES.filter((name) => checkWallet(name)).map((name) => (
        <button onClick={connect({ chainId: "cosmoshub-4", walletType: name })} key={name}>
          {name}
        </button>
      ))}
    </div>
  );
};
```
