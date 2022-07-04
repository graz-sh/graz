import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { osmosisTestnet } from "constants/chains";
import type { AppProps } from "next/app";
import { WadestaProvider } from "wadesta";

export default function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS theme={extendTheme({ config: { initialColorMode: "light" } })}>
      <WadestaProvider chains={[osmosisTestnet]}>
        <Component {...pageProps} />
      </WadestaProvider>
    </ChakraProvider>
  );
}
