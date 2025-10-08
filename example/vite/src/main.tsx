import "./index.css";
import "@getpara/react-sdk-lite/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GrazProvider, type ParaGrazConfig } from "graz";
import { cosmoshub } from "graz/chains";
import * as React from "react";
import * as ReactDOM from "react-dom/client";

import App from "./App";
import ParaWeb, { Environment } from "@getpara/react-sdk-lite";

const queryClient = new QueryClient();

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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          chains: [cosmoshub],
          paraConfig: paraConfig,
        }}
      >
        <App />
      </GrazProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
