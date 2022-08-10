# useSuggestChainAndConnect

[Suggesting a chain](useSuggestChain.md) and [connect](./useConnect.md) to keplr wallet in one hook.

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
    suggestAndConnect(osmosisTestnet);
  }

  return (
    <div>
      <button onClick={handleSuggestAndConnect}>Suggest and Connect to Osmosis Testnet</button>
    </div>
  );
}
```

#### Return Value

```tsx
{
  error: unknown;
  isLoading: boolean;
  isSuccess: boolean;
  isSupported: boolean;
  status: "idle" | "error" | "loading" | "success";
  suggestAndConnect: (chain: ChainInfo) => ChainInfo;
  suggestAndConnectAsync: (chain: ChainInfo) => Promise<{ chain: ChainInfo; account: Key }>;
}
```
