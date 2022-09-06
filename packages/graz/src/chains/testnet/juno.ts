import { Bech32Address } from "@keplr-wallet/cosmos";
import type { AppCurrency, ChainInfo } from "@keplr-wallet/types";

const JUNO: AppCurrency = {
  coinDenom: "junox",
  coinMinimalDenom: "ujunox",
  coinDecimals: 6,
  coinGeckoId: "juno-network",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png",
};

const currencies: AppCurrency[] = [JUNO];

export const junoTestnet: ChainInfo = {
  rpc: "https://rpc.uni.junonetwork.io",
  rest: "https://api.uni.junonetwork.io",
  chainId: "uni-3",
  chainName: "Juno Testnet",
  stakeCurrency: JUNO,
  bip44: {
    coinType: 118,
  },
  bech32Config: Bech32Address.defaultBech32Config("juno"),
  currencies,
  feeCurrencies: [JUNO],
  coinType: 118,
};
