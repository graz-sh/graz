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

/**
 * Provider component which wraps `react-query`'s {@link QueryClientProvider} and various `graz` side effects
 *
 * @example
 * ```tsx
 * // example next.js application in _app.tsx
 * export default function CustomApp({ Component, pageProps }: AppProps) {
 *   return (
 *     <GrazProvider>
 *       <Component {...pageProps} />
 *     </GrazProvider>
 *   );
 * }
 * ```
 *
 * @see https://react-query-v3.tanstack.com/reference/QueryClientProvider
 */
export function GrazProvider({ children }: GrazProviderProps): JSX.Element {
  return (
    <QueryClientProvider key="graz-query-client" client={queryClient}>
      <GrazSubscription />
      {children}
    </QueryClientProvider>
  );
}
