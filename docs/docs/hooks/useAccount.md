# useAccount

Hook to retrieve account data with optional arguments to invoke given function on connect/disconnect.

`useAccount` only retrieve connected/active chains if there's no `chainId` passed to the hook param.

#### Usage

##### Basic

```tsx
import { useAccount } from "graz";

const { data: account, isConnecting, isConnected, ... } = useAccount();
account.bech32Address
```

##### Multichain

```tsx
import { useAccount } from "graz";

const { data: accounts, isConnecting, isConnected, ... } = useAccount({
  chainId: ["cosmoshub-4", "sommelier-3"],
  multiChain: true
});
accounts['cosmoshub-4'].bech32Address
```

##### With event arguments

```tsx
useAccount({
  onConnect: ({ account, isReconnect }) => { ... },
  onDisconnect: () => { ... },
});
```

#### Hook Params

```ts
<TMultiChain extends boolean>{
  chainId?: string | string[];
  multiChain?: TMultiChain; // boolean
  onConnect?: ( ConnectResult & { isReconnect: boolean; }) => void;
  onDisconnect?: () => void;
}
```

##### `ConnectResult`

```tsx
{
  accounts: Record<string, Key>;
  walletType: WalletType;
  chains: ChainInfo[];
}
```

#### Return Value

```ts
{
  data?: TMultiChain extends true ? Record<string, Key> : Key; // from @keplr-wallet/types
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  isReconnecting: boolean;
  reconnect: () => void;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
  walletType?: WalletType;
}
```
