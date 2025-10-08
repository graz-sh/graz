# useAddChain

Hook to add a new chain to graz's internal store without suggesting it to the wallet.

This is useful when you want to dynamically add chains to your application at runtime without requiring wallet interaction. Unlike `useSuggestChain`, this hook only updates the internal store and doesn't communicate with the user's wallet.

## Usage

### Basic Usage

```tsx
import { useAddChain } from "graz";

function App() {
  const { addChain, isLoading, isSuccess, error } = useAddChain();

  return (
    <button
      onClick={() => {
        addChain({
          chainInfo: {
            chainId: "osmosis-1",
            chainName: "Osmosis",
            rpc: "https://rpc.osmosis.zone",
            rest: "https://lcd.osmosis.zone",
            bip44: {
              coinType: 118,
            },
            bech32Config: {
              bech32PrefixAccAddr: "osmo",
              bech32PrefixAccPub: "osmopub",
              bech32PrefixValAddr: "osmovaloper",
              bech32PrefixValPub: "osmovaloperpub",
              bech32PrefixConsAddr: "osmovalcons",
              bech32PrefixConsPub: "osmovalconspub",
            },
            currencies: [
              {
                coinDenom: "OSMO",
                coinMinimalDenom: "uosmo",
                coinDecimals: 6,
              },
            ],
            feeCurrencies: [
              {
                coinDenom: "OSMO",
                coinMinimalDenom: "uosmo",
                coinDecimals: 6,
                gasPriceStep: {
                  low: 0.01,
                  average: 0.025,
                  high: 0.04,
                },
              },
            ],
            stakeCurrency: {
              coinDenom: "OSMO",
              coinMinimalDenom: "uosmo",
              coinDecimals: 6,
            },
          },
        });
      }}
    >
      Add Osmosis Chain
    </button>
  );
}
```

### With Event Callbacks

```tsx
import { useAddChain } from "graz";

function App() {
  const { addChain } = useAddChain({
    onSuccess: (chainInfo) => {
      console.log(`Successfully added ${chainInfo.chainName}`);
    },
    onError: (error) => {
      console.error("Failed to add chain:", error);
    },
    onLoading: (chainInfo) => {
      console.log(`Adding ${chainInfo.chainName}...`);
    },
  });

  return (
    <button onClick={() => addChain({ chainInfo: myChainInfo })}>
      Add Chain
    </button>
  );
}
```

### Using Async Version

```tsx
import { useAddChain } from "graz";

function App() {
  const { addChainAsync } = useAddChain();

  const handleAddChain = async () => {
    try {
      const result = await addChainAsync({
        chainInfo: myChainInfo,
      });
      console.log("Chain added:", result);
    } catch (error) {
      console.error("Error adding chain:", error);
    }
  };

  return <button onClick={handleAddChain}>Add Chain</button>;
}
```

## Parameters

### Hook Arguments

| Name       | Type                                      | Required | Description                                       |
| ---------- | ----------------------------------------- | -------- | ------------------------------------------------- |
| onSuccess  | `(chainInfo: ChainInfo) => void`          | No       | Callback function executed on successful addition |
| onError    | `(error: Error, chainInfo: ChainInfo) => void` | No       | Callback function executed on error               |
| onLoading  | `(chainInfo: ChainInfo) => void`          | No       | Callback function executed when mutation starts   |

### Mutation Arguments

The `addChain` and `addChainAsync` functions accept an object with the following properties:

| Name      | Type        | Required | Description                           |
| --------- | ----------- | -------- | ------------------------------------- |
| chainInfo | `ChainInfo` | Yes      | Chain information object from @keplr-wallet/types |

## Return Values

| Name           | Type                                          | Description                                     |
| -------------- | --------------------------------------------- | ----------------------------------------------- |
| addChain       | `(args: AddChainArgs) => void`                | Function to trigger chain addition              |
| addChainAsync  | `(args: AddChainArgs) => Promise<ChainInfo>`  | Async function to trigger chain addition        |
| error          | `Error \| null`                               | Error object if mutation failed                 |
| isLoading      | `boolean`                                     | Whether the mutation is in progress             |
| isSuccess      | `boolean`                                     | Whether the mutation was successful             |
| status         | `"idle" \| "pending" \| "success" \| "error"` | Current status of the mutation                  |

## ChainInfo Structure

The `ChainInfo` object follows the Keplr wallet type definition. Here's a minimal example:

```typescript
import type { ChainInfo } from "@keplr-wallet/types";

const chainInfo: ChainInfo = {
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
  rpc: "https://rpc.cosmos.network",
  rest: "https://lcd.cosmos.network",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "cosmos",
    bech32PrefixAccPub: "cosmospub",
    bech32PrefixValAddr: "cosmosvaloper",
    bech32PrefixValPub: "cosmosvaloperpub",
    bech32PrefixConsAddr: "cosmosvalcons",
    bech32PrefixConsPub: "cosmosvalconspub",
  },
  currencies: [
    {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
      gasPriceStep: {
        low: 0.01,
        average: 0.025,
        high: 0.03,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "ATOM",
    coinMinimalDenom: "uatom",
    coinDecimals: 6,
  },
};
```

## Notes

- This hook only adds the chain to graz's internal store. It does not suggest the chain to the user's wallet.
- If a chain with the same `chainId` already exists, the mutation will throw an error.
- After adding a chain, it becomes available for connection via `useConnect`.
- For suggesting a chain to the wallet, use `useSuggestChain` instead.
- To add a chain and suggest it to the wallet in one step, use `useSuggestChainAndConnect`.

## Related Hooks

- [`useSuggestChain`](/docs/hooks/useSuggestChain) - Suggest a chain to the wallet and add it to the store
- [`useSuggestChainAndConnect`](/docs/hooks/useSuggestChainAndConnect) - Suggest a chain and connect in one step
- [`useChainInfo`](/docs/hooks/useChainInfo) - Retrieve chain information
- [`useConnect`](/docs/hooks/useConnect) - Connect to a chain

## See Also

- [Chain Information Guide](/docs/guides/multi-chain)
- [Adding Custom Chains](/docs/getting-started#custom-chains)
