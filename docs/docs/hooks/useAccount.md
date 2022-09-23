# useAccount

Hook to retrieve account data with optional arguments to invoke given function on connect/disconnect.

#### Usage

```tsx
import { useAccount } from "graz";
function App() {
  const { data, status } = useAccount();

  return <div>{data ? data.bech32Address : status}</div>;
}
```

#### Params

Object params

- onConnect?: `({ account: Key; isReconnect: boolean; }) => void`
- onDisconnec?t: `() => void`

#### Return Value

```tsx
{
  data?: Key | null; // from @keplr-wallet/types
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  isReconnecting: boolean;
  reconnect: () => void;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
}
```
