# useDisconnect

hook for disconnecting an account

#### Usage

```tsx
import { useAccount, useDisconnect } from "graz";

function App() {
  const { disconnect } = useDisconnect();
  const { isConnected, account, status } = useAccount();

  return (
    <div>
      {isConnected ? `Connected to ${account?.bech32Address}` : status}
      {isConnected && <button onClick={() => disconnect(undefined)}>Disconnect</button>}
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
  disconnect: () => void;
  disconnectAsync: () => Promise<void>;
  status: "idle" | "error" | "loading" | "success";
}
```
