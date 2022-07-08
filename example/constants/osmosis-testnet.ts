const OSMO = {
  coinDenom: "osmo",
  coinMinimalDenom: "uosmo",
  coinDecimals: 6,
  coinGeckoId: "osmosis",
  coinImageUrl: "https://dhj8dql1kzq2v.cloudfront.net/white/osmo.png",
};

export const OSMOSIS_TESTNET = {
  rpc: "https://testnet-rpc.osmosis.zone",
  rest: "https://testnet-rest.osmosis.zone",
  chainId: "osmo-test-4",
  chainName: "Osmosis Testnet",
  stakeCurrency: OSMO,
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: "osmo",
    bech32PrefixAccPub: "osmopub",
    bech32PrefixValAddr: "osmovaloper",
    bech32PrefixValPub: "osmovaloperpub",
    bech32PrefixConsAddr: "osmovalcons",
    bech32PrefixConsPub: "osmovalconspub",
  },
  currencies: [OSMO],
  feeCurrencies: [OSMO],
  coinType: 118,
};
