import { Bech32Address } from "@keplr-wallet/cosmos";
import type { AppCurrency, ChainInfo } from "@keplr-wallet/types";

const currency: AppCurrency = {
  coinDenom: "ATOM",
  coinMinimalDenom: "uatom",
  coinDecimals: 6,
  coinGeckoId: "cosmos",
};

/**
 * @see https://github.com/cosmos/chain-registry/blob/master/cosmoshub/assetlist.json
 * @see https://github.com/cosmos/chain-registry/blob/master/cosmoshub/chain.json
 */
export const cosmoshub: ChainInfo = {
  rpc: "https://rpc.cosmoshub.strange.love",
  rest: "https://api.cosmoshub.strange.love",
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
  stakeCurrency: currency,
  bip44: {
    coinType: 118,
  },
  bech32Config: Bech32Address.defaultBech32Config("cosmos"),
  currencies: [currency],
  feeCurrencies: [currency],
};
