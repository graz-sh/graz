import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { configureGraz, GrazProvider, mainnetChains } from "graz";
import type { AppProps } from "next/app";

const theme = extendTheme();

configureGraz({
  defaultChain: mainnetChains.cosmoshub,
});

export default function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <GrazProvider>
        <Component {...pageProps} />
      </GrazProvider>
    </ChakraProvider>
  );
}
