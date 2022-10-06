import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { configureGraz, GrazProvider, mainnetChains } from "graz";
import type { NextPage } from "next";
import type { AppProps } from "next/app";

const theme = extendTheme();

configureGraz({
  defaultChain: mainnetChains.cosmoshub,
});

const CustomApp: NextPage<AppProps> = ({ Component, pageProps }) => {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <GrazProvider>
        <Component {...pageProps} />
      </GrazProvider>
    </ChakraProvider>
  );
};

export default CustomApp;
