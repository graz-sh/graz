import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { GrazProvider } from "graz";
import type { AppProps } from "next/app";

export default function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS theme={extendTheme({ config: { initialColorMode: "light" } })}>
      <GrazProvider>
        <Component {...pageProps} />
      </GrazProvider>
    </ChakraProvider>
  );
}
