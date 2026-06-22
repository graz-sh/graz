import { Providers } from "./providers";
import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.EXPORT_DOCS ? "/examples/playground" : "";

export const metadata: Metadata = {
  title: "Graz Playground - App Router",
  description: "Graz example using Next.js App Router",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href={`${basePath}/para-styles.css`} />
      </head>
      <body className="min-h-screen bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
