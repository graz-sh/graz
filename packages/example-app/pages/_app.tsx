import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { WadestaProvider } from "wadesta/src";

export default function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS theme={extendTheme({ config: { initialColorMode: "light" } })}>
      <WadestaProvider>
        <Component {...pageProps} />
      </WadestaProvider>
    </ChakraProvider>
  );
}
