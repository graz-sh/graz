import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { GrazProvider } from "graz";
import { getChainData } from "graz/chains";
import type { AppProps } from "next/app";
import { Layout } from "src/ui/layout";

const theme = extendTheme();

const MyApp = ({ Component, pageProps }: AppProps) => {
  const { cosmoshub } = getChainData("cosmoshub");
  return (
    <GrazProvider
      grazOptions={{
        defaultChain: cosmoshub.chainInfo,
        walletConnect: {
          options: {
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
          },
        },
      }}
    >
      <ChakraProvider resetCSS theme={theme}>
        <Layout>
          {/* @ts-expect-error typing mismatch */}
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </GrazProvider>
  );
};

export default MyApp;
