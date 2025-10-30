"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider } from "graz";
import { chains } from "@/utils/graz";
import { useState, useMemo } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import ParaWeb, { Environment } from "@getpara/react-sdk-lite";
import { ParaGrazConnector } from "@getpara/graz-integration";
import type { ParaGrazConfig } from "graz";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Initialize Para if API key is provided
  const para = useMemo(() => {
    const apiKey = process.env.NEXT_PUBLIC_PARA_API_KEY;
    if (!apiKey) {
      console.info("Para: No API key provided. Get one at https://developer.getpara.com");
      return null;
    }
    return new ParaWeb(Environment.BETA, apiKey);
  }, []);

  const paraConfig: ParaGrazConfig | undefined = useMemo(
    () =>
      para
        ? {
            paraWeb: para,
            modalProps: { appName: "Graz Playground" },
            queryClient: queryClient,
            connectorClass: ParaGrazConnector,
          }
        : undefined,
    [para, queryClient],
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <GrazProvider
          grazOptions={{
            chains,
            autoReconnect: true,
            paraConfig,
            walletConnect: {
              options: {
                projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
              },
            },
            logger: {
              enabled: true,
            },
          }}
        >
          {children}
        </GrazProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
