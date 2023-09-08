import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { GrazProvider } from "graz";
import type { AppProps } from "next/app";
import { Layout } from "src/ui/layout";
import { mainnetChains } from "src/utils/chains";

const theme = extendTheme();

// export const osmosis = defineChainInfo({
//   chainId: "osmosis-1",
//   currencies: [
//     {
//       coinDenom: "osmo",
//       coinMinimalDenom: "uosmo",
//       coinDecimals: 6,
//       coinGeckoId: "osmosis",
//     },
//     {
//       coinDenom: "ion",
//       coinMinimalDenom: "uion",
//       coinDecimals: 6,
//       coinGeckoId: "ion",
//     },
//     {
//       coinDenom: "ibcx",
//       coinMinimalDenom: "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
//       coinDecimals: 6,
//     },
//     {
//       coinDenom: "stibcx",
//       coinMinimalDenom: "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
//       coinDecimals: 6,
//     },
//     {
//       coinDenom: "usdc",
//       coinMinimalDenom: "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
//       coinDecimals: 6,
//     },
//     {
//       coinDenom: "stosmo",
//       coinMinimalDenom: "ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC",
//       coinDecimals: 6,
//     },
//     {
//       coinDenom: "atom",
//       coinMinimalDenom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
//       coinDecimals: 6,
//     },
//     {
//       coinDenom: "statom",
//       coinMinimalDenom: "ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901",
//       coinDecimals: 6,
//     },
//     {
//       coinDenom: "weth",
//       coinMinimalDenom: "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
//       coinDecimals: 18,
//     },
//     {
//       coinDenom: "wbtc",
//       coinMinimalDenom: "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
//       coinDecimals: 8,
//     },
//     {
//       coinDenom: "ampOSMO",
//       coinMinimalDenom: "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
//       coinDecimals: 6,
//     },
//     {
//       coinDenom: "usdt",
//       coinMinimalDenom: "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
//       coinDecimals: 6,
//     },
//   ],
//   rest: "https://lcd.osmosis.zone/",
//   rpc: "https://rpc.osmosis.zone/",
//   bech32Config: {
//     bech32PrefixAccAddr: "osmo",
//     bech32PrefixAccPub: "osmopub",
//     bech32PrefixValAddr: "osmovaloper",
//     bech32PrefixValPub: "osmovaloperpub",
//     bech32PrefixConsAddr: "osmovalcons",
//     bech32PrefixConsPub: "osmovalconspub",
//   },
//   chainName: "osmosis",
//   feeCurrencies: [
//     {
//       coinDenom: "osmo",
//       coinMinimalDenom: "uosmo",
//       coinDecimals: 6,
//       coinGeckoId: "osmosis",
//     },
//   ],
//   stakeCurrency: {
//     coinDenom: "osmo",
//     coinMinimalDenom: "uosmo",
//     coinDecimals: 6,
//     coinGeckoId: "osmosis",
//   },
//   bip44: {
//     coinType: 118,
//   },
// });

// export const sommelier = defineChainInfo({
//   chainId: "sommelier-3",
//   currencies: [
//     {
//       coinDenom: "somm",
//       coinMinimalDenom: "usomm",
//       coinDecimals: 6,
//       coinGeckoId: "sommelier",
//     },
//   ],
//   rest: "https://api-sommelier.pupmos.network",
//   rpc: "https://sommelier-rpc.polkachu.com",
//   bech32Config: {
//     bech32PrefixAccAddr: "somm",
//     bech32PrefixAccPub: "sommpub",
//     bech32PrefixValAddr: "sommvaloper",
//     bech32PrefixValPub: "sommvaloperpub",
//     bech32PrefixConsAddr: "sommvalcons",
//     bech32PrefixConsPub: "sommvalconspub",
//   },
//   chainName: "sommelier",
//   feeCurrencies: [
//     {
//       coinDenom: "somm",
//       coinMinimalDenom: "usomm",
//       coinDecimals: 6,
//       coinGeckoId: "sommelier",
//     },
//   ],
//   stakeCurrency: {
//     coinDenom: "somm",
//     coinMinimalDenom: "usomm",
//     coinDecimals: 6,
//     coinGeckoId: "sommelier",
//   },
//   bip44: {
//     coinType: 118,
//   },
// });
// export const stargaze = defineChainInfo({
//   chainId: "stargaze-1",
//   currencies: [
//     {
//       coinDenom: "stars",
//       coinMinimalDenom: "ustars",
//       coinDecimals: 6,
//       coinGeckoId: "stargaze",
//     },
//     {
//       coinDenom: "strdst",
//       coinMinimalDenom: "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/dust",
//       coinDecimals: 6,
//       coinGeckoId: "",
//     },
//     {
//       coinDenom: "GAZE",
//       coinMinimalDenom: "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/mGAZE",
//       coinDecimals: 6,
//       coinGeckoId: "",
//     },
//     {
//       coinDenom: "BRNCH",
//       coinMinimalDenom: "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uBRNCH",
//       coinDecimals: 6,
//       coinGeckoId: "",
//     },
//     {
//       coinDenom: "OHH",
//       coinMinimalDenom: "factory/stars16da2uus9zrsy83h23ur42v3lglg5rmyrpqnju4/uOHH",
//       coinDecimals: 6,
//       coinGeckoId: "",
//     },
//   ],
//   rest: "https://rest.stargaze-apis.com/",
//   rpc: "https://rpc.stargaze-apis.com/",
//   bech32Config: {
//     bech32PrefixAccAddr: "stars",
//     bech32PrefixAccPub: "starspub",
//     bech32PrefixValAddr: "starsvaloper",
//     bech32PrefixValPub: "starsvaloperpub",
//     bech32PrefixConsAddr: "starsvalcons",
//     bech32PrefixConsPub: "starsvalconspub",
//   },
//   chainName: "stargaze",
//   feeCurrencies: [
//     {
//       coinDenom: "stars",
//       coinMinimalDenom: "ustars",
//       coinDecimals: 6,
//       coinGeckoId: "stargaze",
//     },
//   ],
//   stakeCurrency: {
//     coinDenom: "stars",
//     coinMinimalDenom: "ustars",
//     coinDecimals: 6,
//     coinGeckoId: "stargaze",
//   },
//   bip44: {
//     coinType: 118,
//   },
// });

// export const cosmoshub = defineChainInfo({
//   chainId: "cosmoshub-4",
//   currencies: [
//     {
//       coinDenom: "atom",
//       coinMinimalDenom: "uatom",
//       coinDecimals: 6,
//       coinGeckoId: "cosmos",
//     },
//     {
//       coinDenom: "usdt",
//       coinMinimalDenom: "ibc/F04D72CF9B5D9C849BB278B691CDFA2241813327430EC9CDC83F8F4CA4CDC2B0",
//       coinDecimals: 6,
//     },
//     {
//       coinDenom: "ibc/4925E6ABA571A44D2BE0286D2D29AF42A294D0FF2BB16490149A1B26EAD33729",
//       coinMinimalDenom: "ibc/4925E6ABA571A44D2BE0286D2D29AF42A294D0FF2BB16490149A1B26EAD33729",
//       coinDecimals: 0,
//     },
//   ],
//   rest: "https://lcd-cosmoshub.blockapsis.com",
//   rpc: "https://rpc-cosmoshub.blockapsis.com",
//   bech32Config: {
//     bech32PrefixAccAddr: "cosmos",
//     bech32PrefixAccPub: "cosmospub",
//     bech32PrefixValAddr: "cosmosvaloper",
//     bech32PrefixValPub: "cosmosvaloperpub",
//     bech32PrefixConsAddr: "cosmosvalcons",
//     bech32PrefixConsPub: "cosmosvalconspub",
//   },
//   chainName: "cosmoshub",
//   feeCurrencies: [
//     {
//       coinDenom: "atom",
//       coinMinimalDenom: "uatom",
//       coinDecimals: 6,
//       coinGeckoId: "cosmos",
//     },
//   ],
//   stakeCurrency: {
//     coinDenom: "atom",
//     coinMinimalDenom: "uatom",
//     coinDecimals: 6,
//     coinGeckoId: "cosmos",
//   },
//   bip44: {
//     coinType: 118,
//   },
// });

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <GrazProvider
      grazOptions={{
        chains: mainnetChains,
        walletConnect: {
          options: {
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
          },
        },
      }}
    >
      <ChakraProvider resetCSS theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </GrazProvider>
  );
};

export default MyApp;
