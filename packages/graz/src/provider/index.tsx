import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { GrazSubscription } from "./subscription";

const queryClient = new QueryClient({
  //
});

export interface GrazProviderProps {
  children: ReactNode;
}

/**
 * Provider component which wraps `@tanstack/react-query`'s {@link QueryClientProvider} and various `graz` side effects
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
 * @see https://tanstack.com/query
 */
export function GrazProvider({ children }: GrazProviderProps): JSX.Element {
  return (
    <QueryClientProvider key={GRAZ_PROVIDER_COMPONENT_KEY} client={queryClient}>
      <GrazSubscription />
      {children}
    </QueryClientProvider>
  );
}

export const GRAZ_PROVIDER_COMPONENT_KEY = "graz-query-client";
