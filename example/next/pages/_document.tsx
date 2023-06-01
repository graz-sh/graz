import { ColorModeScript } from "@chakra-ui/react";
import type { NextPage } from "next";
import { Head, Html, Main, NextScript } from "next/document";

const CustomDocument: NextPage = () => {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta content="ie=edge" httpEquiv="X-UA-Compatible" />
      </Head>
      <body>
        <ColorModeScript initialColorMode="system" />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default CustomDocument;
