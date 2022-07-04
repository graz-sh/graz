import type { ChainInfo } from "@keplr-wallet/types";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import { useWadestaStore } from "../store";
import { WadestaSubscription } from "../store/subscription";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      notifyOnChangeProps: "tracked",
    },
  },
});

/**
 * WadestaProvider
 * @param chains - You can pass your custom ChainInfo, wadesta already provide default chain info that you can use
 * @see https://github.com/strangelove-ventures/wadesta/blob/dev/packages/wadesta/src/chains/index.ts
 */
export function WadestaProvider({ children, chains }: { children: ReactNode; chains?: ChainInfo[] }) {
  useEffect(() => {
    useWadestaStore.setState({ chains });
  }, [chains]);
  return (
    <QueryClientProvider key="wadesta-query-client" client={queryClient}>
      <WadestaSubscription />
      {children}
    </QueryClientProvider>
  );
}
