import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { GrazProvider } from "graz";
import type { AppProps } from "next/app";
import { Layout } from "src/ui/layout";
import { mainnetChains } from "src/utils/graz";

const theme = extendTheme({
  semanticTokens: {
    colors: {
      baseBackground: {
        default: "blackAlpha.100",
        _dark: "whiteAlpha.100",
      },
      baseHoverBackground: {
        default: "blackAlpha.200",
        _dark: "whiteAlpha.200",
      },
    },
  },
});

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
