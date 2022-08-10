# useSuggestChain

hook for suggesting a chain to keplr wallet

:::info

Keplr's 'suggest chain' feature allows front-ends to request the addition of a Cosmos-SDK-based blockchain that isn't already integrated into the Keplr extension. If the same chain is already supported by Keplr, nothing will happen. If the user rejects the request, an error will be thrown.

This allows all Cosmos-SDK blockchains to have permissionless, instant wallet and transaction signing support for front-ends.
https://docs.keplr.app/api/suggest-chain.html

:::

#### Usage

You need to populate a full `ChainInfo` record to use `suggest` on `useSuggestChain`

<details><summary>ChainInfo</summary>
<p>

https://docs.keplr.app/api/suggest-chain.html

```tsx
interface ChainInfo {
  readonly rpc: string;
  readonly rest: string;
  readonly chainId: string;
  readonly chainName: string;
  /**
   * This indicates the type of coin that can be used for stake.
   * You can get actual currency information from Currencies.
   */
  readonly stakeCurrency: Currency;
  readonly walletUrlForStaking?: string;
  readonly bip44: {
    coinType: number;
  };
  readonly alternativeBIP44s?: BIP44[];
  readonly bech32Config: Bech32Config;

  readonly currencies: AppCurrency[];
  /**
   * This indicates which coin or token can be used for fee to send transaction.
   * You can get actual currency information from Currencies.
   */
  readonly feeCurrencies: Currency[];

  /**
   * This is used to set the fee of the transaction.
   * If this field is empty, it just use the default gas price step (low: 0.01, average: 0.025, high: 0.04).
   * And, set field's type as primitive number because it is hard to restore the prototype after deserialzing if field's type is `Dec`.
   */
  readonly gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };

  /**
   * Indicate the features supported by this chain. Ex) cosmwasm, secretwasm ...
   */
  readonly features?: string[];
}
```

</p>
</details>

```tsx
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useSuggestChain } from "graz";

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
  const { suggest } = useSuggestChain();

  function handleSuggestChain() {
    suggest(osmosisTestnet);
  }

  return (
    <div>
      <button onClick={handleSuggestChain}>Suggest Osmosis Testnet to Keplr Wallet</button>
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
  suggest: (chain: ChainInfo) => ChainInfo;
  suggestAsync: (chain: ChainInfo) => Promise<ChainInfo>;
  status: "idle" | "error" | "loading" | "success";
}
```
