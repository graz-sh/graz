# useSuggestChainAndConnect

mutation hook for [Suggesting a chain](useSuggestChain.md) and [connect](./useConnect.md) to a wallet in one hook.

:::tip Dynamic Chain Addition & Persistence

This hook allows you to suggest and connect to chains that are **not provided in `GrazProvider`**. When you suggest a chain, Graz automatically adds it to the internal store and **persists it to localStorage**, making it available even after page refreshes. This eliminates the need to pre-configure all chains in your provider.

Perfect for:
- Dynamic chain discovery and connection
- Supporting custom chains or testnets
- Building dApps that work with any Cosmos chain

**Persistence behavior:**
- Suggested chains persist across page refreshes
- Users can reconnect to suggested chains automatically
- Provider chains always take precedence over persisted chains

:::

## Usage

```tsx
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useSuggestChainAndConnect, WalletType } from "graz";

const OSMO = {
  coinDenom: "osmo",
  coinMinimalDenom: "uosmo",
  coinDecimals: 6,
  coinGeckoId: "osmosis",
  coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png",
};

const osmosisTestnet = {
  rpc: "https://testnet-rpc.osmosis.zone",
  rest: "https://testnet-rest.osmosis.zone",
  chainId: "osmo-test-4",
  chainName: "Osmosis Testnet",
  stakeCurrency: OSMO,
  bip44: {
    coinType: 118,
  },
  bech32Config: Bech32Address.defaultBech32Config("osmo"),
  currencies: [OSMO],
  feeCurrencies: [OSMO],
  coinType: 118,
};

function App() {
  const { suggestAndConnect } = useSuggestChainAndConnect();

  function handleSuggestAndConnect() {
    suggestAndConnect({
      chainInfo: osmosisTestnet,
      walletType: WalletType.KEPLR,
    });
  }

  return (
    <div>
      <button onClick={handleSuggestAndConnect}>Suggest and Connect to Osmosis Testnet</button>
    </div>
  );
}
```

## Types

- `SuggestChainAndConnectArgs`
  ```tsx
  {
    chainInfo: ChainInfo;
    walletType?: WalletType;
    gas?: {
      price: string;
      denom: string;
    };
    rpcHeaders?: Dictionary;
    path?: string;
  }
  ```

## Hook Params

```ts
{
  onError?: (error: unknown, data: ChainInfo) => void
  onMutate?: (data: chainInfo) => void
  onSuccess?: (data: {
                account: Key;
                walletType: WalletType;
                chain: ChainInfo;
              }) => void}
```

## Types

```ts
interface SuggestChainAndConnectArgs {
  chainInfo: ChainInfo;
  walletType?: WalletType;
  autoReconnect?: boolean;
}
```

## Return Value

```tsx
{
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  isSupported: boolean;
  status: "idle" | "error" | "loading" | "success";
  suggestAndConnect: (args: SuggestChainAndConnectArgs) => void
  suggestAndConnectAsync: (args: SuggestChainAndConnectArgs) =>
    Promise<{
      chain: ChainInfo;
      account: Key;
    }>;
}
```
