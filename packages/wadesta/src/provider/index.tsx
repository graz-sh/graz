import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import { WadestaSubscription } from "../store/subscription";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      notifyOnChangeProps: "tracked",
    },
  },
});

export function WadestaProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient} key="wadesta-query-client">
      <WadestaSubscription />
      {children}
    </QueryClientProvider>
  );
}
