import { Bech32Address } from "@keplr-wallet/cosmos";
import type { AppCurrency, ChainInfo } from "@keplr-wallet/types";

const OSMO: AppCurrency = {
  coinDenom: "osmo",
  coinMinimalDenom: "uosmo",
  coinDecimals: 6,
  coinGeckoId: "osmosis",
  coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png",
};

const currencies: AppCurrency[] = [OSMO];

export const osmosisTestnet: ChainInfo = {
  rpc: "https://testnet-rpc.osmosis.zone",
  rest: "https://testnet-rest.osmosis.zone",
  chainId: "osmo-test-4",
  chainName: "Osmosis Testnet",
  stakeCurrency: OSMO,
  bip44: {
    coinType: 118,
  },
  bech32Config: Bech32Address.defaultBech32Config("osmo"),
  currencies,
  feeCurrencies: [OSMO],
  coinType: 118,
};
