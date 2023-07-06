import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import type { AppCurrency } from "@keplr-wallet/types";
import type { GrazChain } from "graz";
import { GrazProvider, WalletType } from "graz";
import type { NextPage } from "next";
import type { AppProps } from "next/app";

const theme = extendTheme();

const CustomApp: NextPage<AppProps> = ({ Component, pageProps }) => {
  const ATOM: AppCurrency = {
    coinDenom: "atom",
    coinMinimalDenom: "uatom",
    coinDecimals: 6,
    coinGeckoId: "cosmos",
    coinImageUrl: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
  };
  const currencies: AppCurrency[] = [ATOM];
  const cosmoshub: GrazChain = {
    rpc: "https://rpc.cosmoshub.strange.love",
    rest: "https://api.cosmoshub.strange.love",
    chainId: "cosmoshub-4",
    currencies,
  };
  return (
    <ChakraProvider resetCSS theme={theme}>
      <GrazProvider
        grazOptions={{
          defaultClient: "stargate",
          defaultSigningClient: "stargate",
          defaultWallet: WalletType.KEPLR,
          chains: [cosmoshub],
          onReconnectFailed: () => {
            console.log("reconnect failed");
          },
          autoReconnect: false,
          walletConnect: {
            options: {
              projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
            },
          },
        }}
      >
        <Component {...pageProps} />
      </GrazProvider>
    </ChakraProvider>
  );
};

export default CustomApp;
