# useDisconnect

Mutation hook to execute wallet disconnection with optional arguments to invoke given functions on error, loading, or success event.

#### Usage

```tsx
import { useAccount, useDisconnect } from "graz";

function App() {
  const { disconnect } = useDisconnect();

  return (
    <div>
      <button onClick={() => disconnect()}>Disconnect</button>}
    </div>
  );
}
```

##### Disconnect a specific chain

```tsx
import { useAccount, useDisconnect } from "graz";

function App() {
  const { disconnect } = useDisconnect();

  return (
    <div>
       <button onClick={() => disconnect({chainId?: ["cosmoshub-4"] })}>Disconnect</button>
    </div>
  );
}
```

#### Hook Params

```ts
{
  onError?: (error: unknown, data: boolean) => void
  onMutate?: (data: boolean) => void
  onSuccess?: (data: boolean) => void
}
```

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
