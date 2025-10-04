# Multi Chain

Graz provides first-class support for connecting to and interacting with multiple chains simultaneously. All hooks now return data in a consistent `Record<chainId, T>` format for seamless multi-chain development.

## Setup

Configure your `chains` in the `grazOptions` object in the `GrazProvider` component.

```tsx
import { GrazProvider } from "graz";

const cosmoshub = {
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
  // ... rest of cosmoshub ChainInfo
};

const osmosis = {
  chainId: "osmosis-1",
  chainName: "Osmosis",
  // ... rest of osmosis ChainInfo
};

const App = () => {
  return (
    <GrazProvider
      grazOptions={{
        chains: [cosmoshub, osmosis],
      }}
    >
      <YourApp />
    </GrazProvider>
  );
};
```

### Chain-Specific Configuration

You can configure `ChainsConfig` for every specific chain:

```tsx
const App = () => {
  return (
    <GrazProvider
      grazOptions={{
        chains: [cosmoshub, osmosis],
        chainsConfig: {
          "cosmoshub-4": {
            gas: {
              price: "0.025",
              denom: "uatom",
            },
          },
          "osmosis-1": {
            gas: {
              price: "0.0025",
              denom: "uosmo",
            },
          },
        },
      }}
    >
      <YourApp />
    </GrazProvider>
  );
};
```

## Connecting to Chains

### Connect to a Single Chain

```tsx
import { useConnect } from "graz";

const Connect = () => {
  const { connect } = useConnect();
  return (
    <button onClick={() => connect({ chainId: ["cosmoshub-4"] })}>
      Connect to Cosmos Hub
    </button>
  );
};
```

### Connect to Multiple Chains

```tsx
import { useConnect } from "graz";

const Connect = () => {
  const { connect } = useConnect();
  return (
    <button onClick={() => connect({ chainId: ["cosmoshub-4", "osmosis-1"] })}>
      Connect to Multiple Chains
    </button>
  );
};
```

## Multi-Chain Data Pattern

All query hooks in Graz now consistently return data in a `Record<chainId, T>` format:

### Hooks with Multi-Chain Support

- [useAccount](/docs/hooks/useAccount)
- [useBalance](/docs/hooks/useBalance)
- [useBalances](/docs/hooks/useBalances)
- [useBalanceStaked](/docs/hooks/useBalanceStaked)
- [useOfflineSigners](/docs/hooks/useOfflineSigners)
- [useCosmWasmClient](/docs/hooks/useCosmWasmClient)
- [useCosmWasmSigningClient](/docs/hooks/useCosmWasmSigningClient)
- [useStargateClient](/docs/hooks/useStargateClient)
- [useStargateSigningClient](/docs/hooks/useStargateSigningClient)

### Understanding the Pattern

All hooks accept a `chainId` parameter as an array of chain IDs:

```ts
{
  chainId?: string[]; // Array of chain IDs
}
```

**Key behaviors:**

- Hooks always return `Record<chainId, T>` format
- If `chainId` is not provided, hooks use all active chains from the current session

## Examples

### Single Chain Query

```tsx
import { useAccount } from "graz";

function SingleChainAccount() {
  const { data: accounts } = useAccount({
    chainId: ["cosmoshub-4"]
  });

  // TypeScript knows this is Record<"cosmoshub-4", Key>
  const account = accounts?.["cosmoshub-4"];

  return (
    <div>
      Connected to: {account?.bech32Address}
    </div>
  );
}
```

### Multi-Chain Query

```tsx
import { useBalanceStaked } from "graz";

function MultiChainStakedBalances() {
  const { data: stakedBalances, isLoading } = useBalanceStaked({
    bech32Address: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
    chainId: ["cosmoshub-4", "osmosis-1"],
  });

  return (
    <div>
      <h3>Staked Balances</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        stakedBalances && Object.entries(stakedBalances).map(([chainId, coin]) => (
          <div key={chainId}>
            <strong>{chainId}</strong>: {coin.amount} {coin.denom}
          </div>
        ))
      )}
    </div>
  );
}
```

### Query All Active Chains

```tsx
import { useBalance } from "graz";

function AllChainsBalances() {
  // When chainId is not provided, uses all active chains
  const { data: balances } = useBalance({
    bech32Address: "cosmos1...",
    denom: "uatom",
  });

  return (
    <div>
      {balances && Object.entries(balances).map(([chainId, balance]) => (
        <div key={chainId}>
          {chainId}: {balance.amount} {balance.denom}
        </div>
      ))}
    </div>
  );
}
```

### Multi-Chain Signing Clients

```tsx
import { useStargateSigningClient, useSendTokens } from "graz";

function MultiChainTransfer() {
  const { data: signingClients } = useStargateSigningClient({
    chainId: ["cosmoshub-4", "osmosis-1"],
  });

  const { data: accounts } = useAccount({
    chainId: ["cosmoshub-4", "osmosis-1"],
  });

  const { sendTokensAsync } = useSendTokens();

  const handleSendOnCosmosHub = async () => {
    const cosmosClient = signingClients?.["cosmoshub-4"];
    const cosmosAccount = accounts?.["cosmoshub-4"];

    if (!cosmosClient || !cosmosAccount) return;

    await sendTokensAsync({
      signingClient: cosmosClient,
      senderAddress: cosmosAccount.bech32Address,
      recipientAddress: "cosmos1...",
      amount: [{ denom: "uatom", amount: "1000" }],
      fee: "auto",
    });
  };

  return (
    <button onClick={handleSendOnCosmosHub}>
      Send Tokens on Cosmos Hub
    </button>
  );
}
```

## Per-Chain Options

Some hooks (like signing client hooks) support per-chain options:

```tsx
import { useStargateSigningClient } from "graz";

function PerChainOptions() {
  const { data: signingClients } = useStargateSigningClient({
    chainId: ["cosmoshub-4", "osmosis-1"],
    opts: {
      "cosmoshub-4": {
        // Options specific to Cosmos Hub
        gasPrice: "0.025uatom",
      },
      "osmosis-1": {
        // Options specific to Osmosis
        gasPrice: "0.0025uosmo",
      },
    },
  });

  return <div>...</div>;
}
```

## Migration Notes

If you're upgrading from an older version of Graz:

- The `multiChain` parameter has been removed - all hooks now consistently return `Record<chainId, T>`
- `chainId` is now always an array (use `["cosmoshub-4"]` instead of `"cosmoshub-4"`)
- Method mutation hooks (like `useSendTokens`) now require explicit `senderAddress` parameter

See the [Migration Guide](/docs/migration-guide) for detailed upgrade instructions.
