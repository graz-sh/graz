import "@getpara/react-sdk-lite/styles.css";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider } from "graz";
import type { AppProps } from "next/app";
import { Layout } from "src/ui/layout";
import { mainnetChains } from "src/utils/graz";
import { ParaGrazConfig } from "@getpara/graz-integration";
import ParaWeb, { Environment } from "@getpara/react-sdk-lite";

const queryClient = new QueryClient();

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

// Get an API key at https://developer.getpara.com
// Modal will open with fake key but will not authenticate
// Only initialize Para if API key is provided
export const para = process.env.NEXT_PUBLIC_PARA_API_KEY
  ? new ParaWeb(Environment.BETA, process.env.NEXT_PUBLIC_PARA_API_KEY)
  : null;

const paraConfig: ParaGrazConfig | undefined = para
  ? {
      paraWeb: para,
      modalProps: { appName: "MyApp" },
      queryClient: queryClient,
    }
  : undefined;

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: mainnetChains,
          paraConfig,
          walletConnect: {
            options: {
              projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
            },
          },
          walletDefaultOptions: {
            sign: {
              preferNoSetFee: true,
            },
          },
          iframeOptions: {
            allowedIframeParentOrigins: ["https://daodao.zone", "https://dao.daodao.zone"],
          },
        }}
      >
        <ChakraProvider resetCSS theme={theme}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ChakraProvider>
      </GrazProvider>
    </QueryClientProvider>
  );
};

export default MyApp;
