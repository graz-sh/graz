import "@getpara/react-sdk-lite/styles.css";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import type { ParaGrazConfig } from "@getpara/graz-integration";
import { Environment, ParaWeb } from "@getpara/react-sdk-lite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider } from "graz";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { chains } from "utils/graz";

const queryClient = new QueryClient();

const theme = extendTheme();

// Get an API key at https://developer.getpara.com
// Modal will open with fake key but will not authenticate
export const para = new ParaWeb(Environment.BETA, process.env.NEXT_PUBLIC_PARA_API_KEY || "");

const paraConfig: ParaGrazConfig = {
  paraWeb: para,
  modalProps: { appName: "MyApp" },
  queryClient,
};

const CustomApp: NextPage<AppProps> = ({ Component, pageProps }) => {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <QueryClientProvider client={queryClient}>
        <GrazProvider
          grazOptions={{
            chains,
            paraConfig,
            onReconnectFailed: () => {
              console.log("reconnect failed");
            },
            autoReconnect: false,
            walletConnect: {
              options: {
                projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
              },
            },
            iframeOptions: {
              allowedIframeParentOrigins: ["https://daodao.zone", "https://dao.daodao.zone", "http://localhost:3000"],
            },
          }}
        >
          <Component {...pageProps} />
        </GrazProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
};

export default CustomApp;
