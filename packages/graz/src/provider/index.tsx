import type { QueryClientProviderProps } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { ConfigureGrazArgs } from "../actions/configure";
import { configureGraz } from "../actions/configure";
import { GrazEvents } from "./events";

const queryClient = new QueryClient({
  //
});

export type GrazProviderProps = Partial<QueryClientProviderProps> & {
  grazOptions?: ConfigureGrazArgs;
};

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
export function GrazProvider({ children, grazOptions, ...props }: GrazProviderProps): JSX.Element {
  if (grazOptions) {
    configureGraz(grazOptions);
  }
  return (
    <QueryClientProvider client={queryClient} {...props}>
      <GrazEvents />
      {children}
    </QueryClientProvider>
  );
}
