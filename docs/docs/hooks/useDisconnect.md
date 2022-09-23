# useDisconnect

Mutation hook to execute wallet disconnection with optional arguments to invoke given functions on error, loading, or success event.

#### Usage

```tsx
import { useAccount, useDisconnect } from "graz";

function App() {
  // pass `true` on disconnect to clear recent connected chain
  const { disconnect } = useDisconnect();
  const { isConnected, account, status } = useAccount();

  return (
    <div>
      {isConnected ? `Connected to ${account?.bech32Address}` : status}
      {isConnected && <button onClick={() => disconnect(true)}>Disconnect</button>}
    </div>
  );
}
```

#### Params

Object params

- onError?: `(error: unknown, data: boolean) => void`
- onMutate?: `(data: boolean) => void`
- onSuccess?: `(data: boolean) => void`

#### Return Value

```tsx
{
  disconnect: (forget?: boolean) => void;
  disconnectAsync: (forget?: boolean) => Promise<void>;
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  status: "error" | "idle" | "loading" | "success";
}
```
