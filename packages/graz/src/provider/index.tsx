import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

import { GrazSubscription } from "./subscription";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      notifyOnChangeProps: "tracked",
    },
  },
});

export interface GrazProviderProps {
  children: ReactNode;
}

export function GrazProvider({ children }: GrazProviderProps): JSX.Element {
  return (
    <QueryClientProvider key="graz-query-client" client={queryClient}>
      <GrazSubscription />
      {children}
    </QueryClientProvider>
  );
}
