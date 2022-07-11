import { Bech32Address } from "@keplr-wallet/cosmos";
import type { AppCurrency, ChainInfo } from "@keplr-wallet/types";

const AXL: AppCurrency = {
  coinDenom: "axl",
  coinMinimalDenom: "uaxl",
  coinDecimals: 6,
  coinGeckoId: "axelar-network",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.png",
};

const USDC: AppCurrency = {
  coinDenom: "usdc",
  coinMinimalDenom: "uusdc",
  coinDecimals: 6,
  coinGeckoId: "usd-coin",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdc.png",
};

const FRAX: AppCurrency = {
  coinDenom: "dai",
  coinMinimalDenom: "dai-wei",
  coinDecimals: 18,
  coinGeckoId: "dai",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/dai.png",
};

const USDT: AppCurrency = {
  coinDenom: "usdt",
  coinMinimalDenom: "uusdt",
  coinDecimals: 6,
  coinGeckoId: "tether",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdt.png",
};

const WETH: AppCurrency = {
  coinDenom: "weth-wei",
  coinMinimalDenom: "weth",
  coinDecimals: 18,
  coinGeckoId: "weth",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/weth.png",
};

const WBTC: AppCurrency = {
  coinDenom: "wbtc-satoshi",
  coinMinimalDenom: "wbtc",
  coinDecimals: 8,
  coinGeckoId: "wrapped-bitcoin",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/wbtc.png",
};

/**
 *  @see https://github.com/cosmos/chain-registry/blob/master/axelar/assetlist.json
 */
const currencies: AppCurrency[] = [AXL, USDC, FRAX, USDT, WETH, WBTC];

/**
 * @see https://github.com/cosmos/chain-registry/blob/master/axelar/chain.json
 */
export const axelar: ChainInfo = {
  rpc: "https://rpc.axelar.strange.love",
  rest: "https://api.axelar.strange.love",
  chainId: "axelar-dojo-1",
  chainName: "Axelar",
  stakeCurrency: AXL,
  bip44: {
    coinType: 118,
  },
  bech32Config: Bech32Address.defaultBech32Config("axelar"),
  currencies,
  feeCurrencies: currencies,
};
