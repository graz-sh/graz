# useSuggestChainAndConnect

mutation hook for [Suggesting a chain](useSuggestChain.md) and [connect](./useConnect.md) to a wallet in one hook.

#### Usage

```tsx
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useSuggestChainAndConnect } from "graz";

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
    });
  }

  return (
    <div>
      <button onClick={handleSuggestAndConnect}>Suggest and Connect to Osmosis Testnet</button>
    </div>
  );
}
```

#### Types

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

#### Params

Object params

- onError?: `(error: unknown, data: ChainInfo) => void`
- onMutate?: `(data: chainInfo) => void`
- onSuccess?:
  ```tsx
  (data: {
    account: Key;
    walletType: WalletType;
    chain: ChainInfo;
  }) => void
  ```

#### Return Value

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
