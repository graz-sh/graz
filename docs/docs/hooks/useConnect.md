# useConnect

Mutation hook to execute wallet connection with optional arguments to invoke given functions on error, loading, or success event

#### Usage

```tsx
import { useAccount, useConnect, mainnetChains } from "graz";

function App() {
  const { connect } = useConnect();
  const { isConnected, account } = useAccount();

  return (
    <div>
      {isConnected ? account.bech32Address : <button onClick={() => connect(mainnetChains.cosmos)}>Connect</button>}
    </div>
  );
}
```

#### Types

- `ConnectArgs`
  ```tsx
  {
    chain?: {
      chainId: string;
      currencies: AppCurrency[];
      path?: string;
      rest: string;
      rpc: string;
      rpcHeaders?: Dictionary;
      gas?: {
        price: string;
        denom: string;
      }
    }
    signerOpts?: SigningCosmWasmClientOptions;
    walletType?: WalletType;
  }
  ```

#### Params

Object params

- onError?: `(error: unknown, data: ConnectArgs) => void`
- onMutate?: `(data: ConnectArgs) => void`
- onSuccess?: `(data: ConnectArgs) => void`

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
