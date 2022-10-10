import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { configureGraz, GrazProvider, mainnetChains } from "graz";
import type { AppProps } from "next/app";
import { Layout } from "src/ui/layout";

const theme = extendTheme();

configureGraz({
  defaultChain: mainnetChains.cosmoshub,
});

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <GrazProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </GrazProvider>
    </ChakraProvider>
  );
};

export default MyApp;
