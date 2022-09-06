import { Bech32Address } from "@keplr-wallet/cosmos";
import type { AppCurrency, ChainInfo } from "@keplr-wallet/types";

const CRE: AppCurrency = {
  coinDenom: "CRE",
  coinMinimalDenom: "ucre",
  coinDecimals: 6,
  coinGeckoId: "crescent",
  coinImageUrl: "https://raw.githubusercontent.com/crescent-network/asset/main/images/coin/CRE.png",
};

const currencies: AppCurrency[] = [CRE];

export const crescentTestnet: ChainInfo = {
  rpc: "https://testnet-endpoint.crescent.network/rpc/crescent",
  rest: "https://testnet-endpoint.crescent.network/api/crescent",
  chainId: "mooncat-1-1",
  chainName: "Crescent Testnet",
  bip44: {
    coinType: 118,
  },
  bech32Config: Bech32Address.defaultBech32Config("CRE"),
  currencies,
  feeCurrencies: currencies,
  stakeCurrency: CRE,
  coinType: 118,
};
