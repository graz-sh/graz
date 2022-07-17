import { SkipNavLink } from "@reach/skip-nav";
import Document, { Head, Html, Main, NextScript } from "next/document";
import React from "react";
import { FaviconsMetaTags } from "ui/seo/favicons-meta-tags";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <FaviconsMetaTags />
        </Head>
        <body>
          <SkipNavLink />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
