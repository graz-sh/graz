import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import { WadestaSubscription } from "./subscription";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      notifyOnChangeProps: "tracked",
    },
  },
});

export function WadestaProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider key="wadesta-query-client" client={queryClient}>
      <WadestaSubscription />
      {children}
    </QueryClientProvider>
  );
}
