import { Bech32Address } from "@keplr-wallet/cosmos";
import type { AppCurrency, ChainInfo } from "@keplr-wallet/types";

const SOMM: AppCurrency = {
  coinDenom: "somm",
  coinMinimalDenom: "usomm",
  coinDecimals: 6,
  coinGeckoId: "sommelier",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.png",
};

/**
 *  @see https://github.com/cosmos/chain-registry/blob/master/sommelier/assetlist.json
 */
const currencies: AppCurrency[] = [SOMM];

/**
 * @see https://github.com/cosmos/chain-registry/blob/master/sommelier/chain.json
 */
export const sommelier: ChainInfo = {
  rpc: "https://rpc.sommelier.strange.love",
  rest: "https://api.sommelier.strange.love",
  chainId: "sommelier-3",
  chainName: "Sommelier",
  stakeCurrency: SOMM,
  bip44: {
    coinType: 118,
  },
  bech32Config: Bech32Address.defaultBech32Config("somm"),
  currencies,
  feeCurrencies: currencies,
};
