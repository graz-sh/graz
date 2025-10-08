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

Most query hooks in Graz return data in a `Record<chainId, T>` format for multi-chain support:

### Hooks with Multi-Chain Support

- [useAccount](/docs/hooks/useAccount) - Returns `Record<chainId, Key>`
- [useOfflineSigners](/docs/hooks/useOfflineSigners) - Returns `Record<chainId, OfflineSigner>`
- [useCosmWasmClient](/docs/hooks/useCosmWasmClient) - Returns `Record<chainId, CosmWasmClient>`
- [useCosmWasmSigningClient](/docs/hooks/useCosmWasmSigningClient) - Returns `Record<chainId, SigningCosmWasmClient>`
- [useStargateClient](/docs/hooks/useStargateClient) - Returns `Record<chainId, StargateClient>`
- [useStargateSigningClient](/docs/hooks/useStargateSigningClient) - Returns `Record<chainId, SigningStargateClient>`

### Single-Chain Hooks

Some hooks are designed for single-chain queries and require explicit parameters:

- [useBalance](/docs/hooks/useBalance) - Requires `chainId: string`, `bech32Address: string`, `denom: string`
- [useBalances](/docs/hooks/useBalances) - Requires `chainId: string`, `bech32Address: string`
- [useBalanceStaked](/docs/hooks/useBalanceStaked) - Requires `chainId: string`, `bech32Address: string`

**For multi-chain balance queries**, call these hooks multiple times:

```tsx
const cosmosAccount = accounts?.["cosmoshub-4"];
const osmosisAccount = accounts?.["osmosis-1"];

const { data: cosmosBalance } = useBalance({
  chainId: "cosmoshub-4",
  bech32Address: cosmosAccount?.bech32Address || "",
  denom: "uatom",
  enabled: Boolean(cosmosAccount?.bech32Address),
});

const { data: osmosisBalance } = useBalance({
  chainId: "osmosis-1",
  bech32Address: osmosisAccount?.bech32Address || "",
  denom: "uosmo",
  enabled: Boolean(osmosisAccount?.bech32Address),
});
```

### Understanding the Pattern

Multi-chain hooks accept a `chainId` parameter as an array of chain IDs:

```ts
{
  chainId?: string[]; // Array of chain IDs
}
```

**Key behaviors:**

- Multi-chain hooks always return `Record<chainId, T>` format
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
import { useAccount } from "graz";

function MultiChainAccounts() {
  const { data: accounts, isLoading } = useAccount({
    chainId: ["cosmoshub-4", "osmosis-1"],
  });

  return (
    <div>
      <h3>Connected Accounts</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        accounts && Object.entries(accounts).map(([chainId, account]) => (
          <div key={chainId}>
            <strong>{chainId}</strong>: {account.bech32Address}
          </div>
        ))
      )}
    </div>
  );
}
```

### Query All Active Chains

```tsx
import { useAccount, useBalance } from "graz";

function AllChainsBalances() {
  const { data: accounts } = useAccount();

  // Get balances for multiple chains by calling useBalance for each chain
  const chainIds = ["cosmoshub-4", "osmosis-1", "neutron-1"];

  return (
    <div>
      {chainIds.map((chainId) => {
        const account = accounts?.[chainId];
        const { data: balance } = useBalance({
          chainId,
          bech32Address: account?.bech32Address || "",
          denom: "uatom",
          enabled: Boolean(account?.bech32Address),
        });

        return (
          <div key={chainId}>
            {chainId}: {balance?.amount} {balance?.denom}
          </div>
        );
      })}
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

- The `multiChain` parameter has been removed from most hooks
- Multi-chain hooks (like `useAccount`, `useStargateClient`) consistently return `Record<chainId, T>`
- `chainId` is an array for multi-chain hooks: use `["cosmoshub-4"]` instead of `"cosmoshub-4"`
- **NEW**: Balance hooks (`useBalance`, `useBalances`, `useBalanceStaked`) now require single `chainId: string` and `bech32Address: string` parameters
- Method mutation hooks (like `useSendTokens`) now require explicit `senderAddress` parameter

See the [Migration Guide](/docs/migration-guide) for detailed upgrade instructions.
