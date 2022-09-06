import type { QueryClientProviderProps } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { GrazSubscription } from "./subscription";

const queryClient = new QueryClient({
  //
});

export type GrazProviderProps = Partial<QueryClientProviderProps>;

/**
 * Provider component which extends `@tanstack/react-query`'s {@link QueryClientProvider} with built-in query client
 * and various `graz` side effects
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
export function GrazProvider({ children, ...props }: GrazProviderProps): JSX.Element {
  return (
    <QueryClientProvider client={queryClient} {...props}>
      <GrazSubscription />
      {children}
    </QueryClientProvider>
  );
}
