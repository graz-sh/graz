# useAccount

Hook for accesing account data and connection status.

#### Usage

```tsx
import { useAccount } from "graz";
function App() {
  const { data, status } = useAccount();

  return <div>{data ? data.bech32Address : status}</div>;
}
```

#### Return Value

```tsx
{
  data: Key | null; // from @keplr-wallet/types
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  isReconnecting: boolean;
  reconnect: reconnect: () => void;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
}
```
