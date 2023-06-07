import { Bech32Address } from "@keplr-wallet/cosmos";
import type { AppCurrency, ChainInfo } from "@keplr-wallet/types";

const STARS: AppCurrency = {
  coinDenom: "STARS",
  coinMinimalDenom: "ustars",
  coinDecimals: 6,
  coinGeckoId: "stargaze",
  coinImageUrl: "https://stargaze.zone/logo.png",
};

/**
 *  @see https://github.com/cosmos/chain-registry/blob/master/stargaze/assetlist.json
 */
const currencies: AppCurrency[] = [STARS];

/**
 * @see https://github.com/cosmos/chain-registry/blob/master/stargaze/chain.json
 */

export const stargaze: ChainInfo = {
  rpc: "https://rpc.stargaze-apis.com/",
  rest: "https://rest.stargaze-apis.com/",
  chainId: "stargaze-1",
  chainName: "Stargaze",
  stakeCurrency: STARS,
  bip44: {
    coinType: 118,
  },
  bech32Config: Bech32Address.defaultBech32Config("stargaze"),
  feeCurrencies: currencies,
  currencies,
};
