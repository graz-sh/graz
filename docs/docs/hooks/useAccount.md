# useAccount

Hook to retrieve account data with optional arguments to invoke given function on connect/disconnect.

`useAccount` retrieves connected/active chains if there's no `chainId` passed to the hook param. All accounts are returned in a `Record<chainId, Key>` format.

## Usage

```tsx
import { useAccount } from "graz";

// Single or multiple chains
const { data: accounts, isConnecting, isConnected } = useAccount({
  chainId: ["cosmoshub-4", "osmosis-1"],
});

// Extract account for specific chain
const cosmosAccount = accounts?.["cosmoshub-4"];
const osmosisAccount = accounts?.["osmosis-1"];

console.log(cosmosAccount?.bech32Address);
```

### All Active Chains

```tsx
import { useAccount } from "graz";

// Without chainId, uses all active chains from session
const { data: accounts } = useAccount();

// Iterate over all connected chains
{accounts && Object.entries(accounts).map(([chainId, account]) => (
  <div key={chainId}>
    {chainId}: {account.bech32Address}
  </div>
))}
```

### With Event Arguments

```tsx
useAccount({
  chainId: ["cosmoshub-4"],
  onConnect: ({ accounts, isReconnect }) => {
    console.log("Connected to chains:", Object.keys(accounts));
  },
  onDisconnect: () => {
    console.log("Disconnected");
  },
});
```

## Hook Params

```ts
{
  chainId?: string[]; // Array of chain IDs, defaults to active chains
  onConnect?: (ConnectResult & { isReconnect: boolean }) => void;
  onDisconnect?: () => void;
}
```

### `ConnectResult`

```tsx
{
  accounts: Record<string, Key>;
  walletType: WalletType;
  chains: ChainInfo[];
}
```

## Return Value

```ts
{
  data?: Record<string, Key>; // Key from @keplr-wallet/types
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  isReconnecting: boolean;
  reconnect: (args?: ConnectArgs) => Promise<ConnectResult>;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
  walletType?: WalletType;
}
```
