# useConnect

hook for connecting to an account with keplr wallet

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

#### Return Value

```tsx
{
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  isSupported: boolean;
  connect: (chain: GrazChain) => void;
  connectAsync: (chain: GrazChain) => Promise<Key>;
  status: "idle" | "error" | "loading" | "success";
}
```
