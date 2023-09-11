# useConnect

Mutation hook to execute wallet connection with optional arguments to invoke given functions on error, loading, or success event

#### Usage

#### Single Chain

```tsx
import { useAccount, useConnect, WalletType } from "graz";

function App() {
  const { connect } = useConnect();
  const { isConnected, account } = useAccount();

  return (
    <div>
      {isConnected ? account.bech32Address : <button onClick={() => connect({ chainId: "cosmoshub-4", walletType: WalletType.KEPLR })>Connect</button>}
    </div>
  );
}
```

#### Multi Chain

```tsx
import { useAccount, useConnect, WalletType } from "graz";

function App() {
  const { connect } = useConnect();
  const { isConnected, data: account } = useAccount({
    chainId: ["cosmoshub-4", "sommelier-1"],
    multiChain: true
  });

  return (
    <div>
      {isConnected ? <p>Connected</p> : <button onClick={() => connect({ chainId: ["cosmoshub-4", "sommelier-1"], walletType: WalletType.KEPLR })>Connect</button>}
      <p>Cosmos hub address: {account?.["cosmoshub-4"].bech32Address}</p>
      <p>Sommelier address: {account?.["sommelier-1"].bech32Address}</p>
    </div>
  );
}
```

#### Types

- `ConnectArgs`
  ```tsx
  {
    chainId: string | string[];
    walletType?: WalletType;
    autoReconnect?: boolean;
  }
  ```

#### Hook Params

````ts
{
  onError?: (error: unknown, data: ConnectArgs) => void;
  onMutate?: (data: ConnectArgs) => void;
  onSuccess?: (data: ConnectResult) => void;
}
```

##### `ConnectResult`

```tsx
{
  account: Key;
  walletType: WalletType;
  chain: GrazChain;
}
````

#### Return Value

```tsx
{
  connect:  (args?: ConnectArgs) => void;
  connectAsync: (args?: ConnectArgs) => Promise<Key>;
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  isSupported: boolean;
  status: "error" | "idle" | "loading" | "success"
}
```
