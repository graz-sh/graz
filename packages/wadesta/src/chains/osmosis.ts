import { Bech32Address } from "@keplr-wallet/cosmos";
import type { AppCurrency, ChainInfo } from "@keplr-wallet/types";

const OSMO: AppCurrency = {
  coinDenom: "osmo",
  coinMinimalDenom: "uosmo",
  coinDecimals: 6,
  coinGeckoId: "osmosis",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
};

const ION: AppCurrency = {
  coinDenom: "ion",
  coinMinimalDenom: "uion",
  coinDecimals: 6,
  coinGeckoId: "ion",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ion.png",
};

/**
 *  @see https://github.com/cosmos/chain-registry/blob/master/osmosis/assetlist.json
 */
const currencies: AppCurrency[] = [OSMO, ION];

/**
 * @see https://github.com/cosmos/chain-registry/blob/master/osmosis/chain.json
 */
export const osmosis: ChainInfo = {
  rpc: "https://rpc.osmosis.strange.love",
  rest: "https://api.osmosis.strange.love",
  chainId: "osmosis-1",
  chainName: "Osmosis",
  stakeCurrency: OSMO,
  bip44: {
    coinType: 118,
  },
  bech32Config: Bech32Address.defaultBech32Config("osmo"),
  currencies,
  feeCurrencies: currencies,
};
