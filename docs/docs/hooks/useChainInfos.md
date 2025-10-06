# useChainInfos

Hook to retrieve `ChainInfo` objects from `GrazProvider`. Can optionally filter by `chainId` array.

## Usage

### Get All Chains

```tsx
import { useChainInfos } from "graz";

function App() {
  // Returns all configured chains
  const allChains = useChainInfos();

  return (
    <div>
      {allChains?.map((chain) => (
        <div key={chain.chainId}>{chain.chainName}</div>
      ))}
    </div>
  );
}
```

### Get Specific Chains

```tsx
import { useChainInfos } from "graz";

function App() {
  // Returns only specified chains
  const chainInfos = useChainInfos({ chainId: ["cosmoshub-4", "osmosis-1"] });

  return (
    <div>
      {chainInfos?.map((chain) => (
        <div key={chain.chainId}>{chain.chainName}</div>
      ))}
    </div>
  );
}
```

## Parameters

| Name    | Type       | Required | Description                                                    |
| ------- | ---------- | -------- | -------------------------------------------------------------- |
| chainId | `string[]` | No       | Array of chain IDs to filter. If not provided, returns all chains. |

## Return Value

```tsx
ChainInfo[] | undefined; // @keplr-wallet/types
```

Returns an array of `ChainInfo` objects. If `chainId` parameter is provided, returns only the matching chains. If no `chainId` is provided, returns all configured chains.
