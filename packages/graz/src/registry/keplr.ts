import { Bech32Address } from "@keplr-wallet/cosmos";
import type { ChainInfo, Currency, FeeCurrency, WithGasPriceStep } from "@keplr-wallet/types";
import { satisfies } from "semver";

import type { Asset, AssetList, Chain } from "../types/registry";
import { invariant } from "../utils/invariant";
import { cleanVer } from "../utils/registry";

/**
 * Function to convert chain object from registry to Keplr's {@link ChainInfo} object.
 *
 * Note that every chain generated in `graz/chains` already has {@link ChainInfo}.
 * (e.g. `import chainInfo from "graz/chains/cosmoshub"`).
 *
 * @example
 * ```ts
 * import { registryToChainInfo } from "graz";
 *
 * import chain from "graz/chains/cosmoshub/chain";
 * import assetlist from "graz/chains/cosmoshub/assetlist";
 *
 * const chainInfo = registryToChainInfo({ chain, assetlist });
 * const chainInfoFromAsset = registryToChainInfo({ chain, assets: assetlist.assets });
 * ```
 *
 */
export const registryToChainInfo = (args: RegistryToChainInfoArgs): ChainInfo => {
  const {
    chain,
    getRestEndpoint = ({ apis }) => apis?.rest?.[0]?.address ?? "",
    getRpcEndpoint = ({ apis }) => apis?.rpc?.[0]?.address ?? "",
  } = args;

  const features = [];
  // if not specified, we assume stargate
  const sdkVer = cleanVer(chain.codebase?.cosmos_sdk_version ?? "0.4");
  // stargate
  if (satisfies(sdkVer, ">=0.4")) features.push("stargate");
  // no-legacy-stdTx
  if (satisfies(sdkVer, ">=0.43")) features.push("no-legacy-stdTx");
  // until further notice, assume 'ibc-transfer'
  features.push("ibc-transfer");

  // ibc-go
  if (satisfies(sdkVer, ">=0.45")) features.push("ibc-go");

  if (chain.codebase?.cosmwasm_enabled) {
    features.push("cosmwasm");
    const wasmVer = cleanVer(chain.codebase.cosmwasm_version ?? "0.24");
    if (satisfies(wasmVer, ">=0.24")) features.push("wasmd_0.24+");
  }

  let assets: Asset[] = [];
  if ("assetlists" in args && Array.isArray(args.assetlists)) {
    assets = args.assetlists.find((asset) => asset.chain_name === chain.chain_name)?.assets || [];
  }
  if ("assetlist" in args && Array.isArray(args.assetlist.assets)) {
    assets = args.assetlist.assets;
  }
  if ("assets" in args && Array.isArray(args.assets)) {
    assets = args.assets;
  }
  const feeDenoms = chain.fees?.fee_tokens.map<string>((feeToken) => feeToken.denom) || [];

  /**
   * from keplr chain-info.d.ts:
   * this is used to set the fee of the transaction. if this field is empty, it just use the default gas price step
   * (low: 0.01, average: 0.025, high: 0.04). and, set field's type as primitive number because it is hard to restore
   * the prototype after deserialzing if field's type is `dec`.
   */
  const gasPriceSteps: Record<string, WithGasPriceStep<object>["gasPriceStep"]> = {};
  for (const feeToken of chain.fees?.fee_tokens || []) {
    gasPriceSteps[feeToken.denom] = {
      low: feeToken.low_gas_price ?? 0.01,
      average: feeToken.average_gas_price ?? 0.025,
      high: feeToken.high_gas_price ?? 0.04,
    };
  }

  const stakingDenoms = chain.staking?.staking_tokens.map<string>((stakingToken) => stakingToken.denom) || [];

  const currencies = assets.map<Currency>((currency) => {
    const denomUnit = currency.denom_units.reduce((acc, val) => (val.exponent > acc.exponent ? val : acc));
    return {
      coinDenom: currency.symbol,
      coinMinimalDenom: currency.base,
      coinDecimals: denomUnit.exponent,
      coinGeckoId: currency.coingecko_id,
      coinImageUrl: currency.logo_URIs?.svg ?? currency.logo_URIs?.png,
    };
  });

  const firstCurrency = currencies[0];
  invariant(firstCurrency, `chain '${chain.chain_name}' has no assets`);

  const stakeCurrency = currencies.find((currency) => stakingDenoms.includes(currency.coinDenom)) ?? firstCurrency;

  const feeCurrencies = currencies
    // use the fee denoms
    .filter((currency) => feeDenoms.includes(currency.coinMinimalDenom))
    .map<FeeCurrency>((feeCurrency) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!gasPriceSteps.hasOwnProperty(feeCurrency.coinMinimalDenom)) return feeCurrency;
      // has gas
      const gasPriceStep = gasPriceSteps[feeCurrency.coinMinimalDenom];
      return { ...feeCurrency, gasPriceStep };
    });

  const feeCurrenciesDefault: FeeCurrency[] = currencies
    // use the stake currency
    .filter((currency) => stakeCurrency.coinDenom === currency.coinDenom)
    .map((feeCurrency) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!gasPriceSteps.hasOwnProperty(feeCurrency.coinMinimalDenom)) return feeCurrency;
      // has gas
      const gasPriceStep = gasPriceSteps[feeCurrency.coinMinimalDenom];
      return { ...feeCurrency, gasPriceStep };
    });

  const chainInfo: ChainInfo = {
    rpc: getRpcEndpoint(chain),
    rest: getRestEndpoint(chain),
    chainId: chain.chain_id,
    chainName: chain.pretty_name || "",
    bip44: {
      coinType: chain.slip44 || 118,
    },
    bech32Config: Bech32Address.defaultBech32Config(chain.bech32_prefix),
    currencies,
    stakeCurrency,
    feeCurrencies: feeCurrencies.length !== 0 ? feeCurrencies : feeCurrenciesDefault,
    features,
  };

  return chainInfo;
};

type MapEndpointGetters<T extends string> = Record<`get${Capitalize<T>}Endpoint`, (chain: Chain) => string>;

type RegistryToChainInfoArgs = Partial<MapEndpointGetters<"rpc" | "rest">> &
  (
    | { chain: Chain; assetlists: AssetList[] }
    | { chain: Chain; assetlist: AssetList }
    | { chain: Chain; assets: Asset[] }
  );
