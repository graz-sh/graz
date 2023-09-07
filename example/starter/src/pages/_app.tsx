import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { testnetChainsArray } from "graz";
import { GrazProvider, mainnetChainsArray } from "graz";
import type { AppProps } from "next/app";
import { Layout } from "src/ui/layout";

const theme = extendTheme();

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <GrazProvider
      grazOptions={{
        chains: [...mainnetChainsArray, ...testnetChainsArray],
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
