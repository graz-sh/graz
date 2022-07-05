import { Bech32Address } from "@keplr-wallet/cosmos";
import type { AppCurrency, ChainInfo } from "@keplr-wallet/types";

const JUNO: AppCurrency = {
  coinDenom: "juno",
  coinMinimalDenom: "ujuno",
  coinDecimals: 6,
  coinGeckoId: "juno-network",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png",
};

const NETA: AppCurrency = {
  coinDenom: "neta",
  coinMinimalDenom: "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
  coinDecimals: 6,
  coinGeckoId: "neta",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/neta.png",
};

const MARBLE: AppCurrency = {
  coinDenom: "marble",
  coinMinimalDenom: "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
  coinDecimals: 3,
  coinGeckoId: "marble",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/marble.png",
};

const HOPE: AppCurrency = {
  coinDenom: "hope",
  coinMinimalDenom: "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
  coinDecimals: 6,
  coinGeckoId: "hope-galaxy",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hope.png",
};

const RAC: AppCurrency = {
  coinDenom: "rac",
  coinMinimalDenom: "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
  coinDecimals: 6,
  coinGeckoId: "racoon",
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/rac.png",
};

const BLOCK: AppCurrency = {
  coinDenom: "block",
  coinMinimalDenom: "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
  coinDecimals: 6,
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/block.png",
};

const DHK: AppCurrency = {
  coinDenom: "dhk",
  coinMinimalDenom: "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
  coinDecimals: 0,
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dhk.png",
};

const RAW: AppCurrency = {
  coinDenom: "raw",
  coinMinimalDenom: "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
  coinDecimals: 6,
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/raw.png",
  coinGeckoId: "junoswap-raw-dao",
};

const ASVT: AppCurrency = {
  coinDenom: "asvt",
  coinMinimalDenom: "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
  coinDecimals: 6,
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/asvt.png",
};

const HNS: AppCurrency = {
  coinDenom: "hns",
  coinMinimalDenom: "cw20:juno1ur4jx0sxchdevahep7fwq28yk4tqsrhshdtylz46yka3uf6kky5qllqp4k",
  coinDecimals: 6,
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hns.svg",
};

const JOE: AppCurrency = {
  coinDenom: "joe",
  coinMinimalDenom: "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
  coinDecimals: 6,
  coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/joe.png",
};

/**
 *  @see https://github.com/cosmos/chain-registry/blob/master/juno/assetlist.json
 */
const currencies: AppCurrency[] = [JUNO, NETA, MARBLE, HOPE, RAC, BLOCK, DHK, RAW, ASVT, HNS, JOE];

/**
 * @see https://github.com/cosmos/chain-registry/blob/master/juno/chain.json
 */
export const juno: ChainInfo = {
  rpc: "https://rpc.juno.strange.love",
  rest: "https://api.juno.strange.love",
  chainId: "juno-1",
  chainName: "Juno",
  stakeCurrency: JUNO,
  bip44: {
    coinType: 118,
  },
  bech32Config: Bech32Address.defaultBech32Config("juno"),
  currencies,
  feeCurrencies: currencies,
};
