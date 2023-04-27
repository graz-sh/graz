import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { GrazProvider, mainnetChains } from "graz";
import type { NextPage } from "next";
import type { AppProps } from "next/app";

const theme = extendTheme();

const CustomApp: NextPage<AppProps> = ({ Component, pageProps }) => {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <GrazProvider
        grazOptions={{
          defaultChain: mainnetChains.cosmoshub,
          onReconnectFailed: () => {
            console.log("reconnect failed");
          },
          autoReconnect: false,
        }}
      >
        <Component {...pageProps} />
      </GrazProvider>
    </ChakraProvider>
  );
};

export default CustomApp;
