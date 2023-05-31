import type { QueryClientProviderProps } from "@tanstack/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { FC } from "react";

import type { ConfigureGrazArgs } from "../actions/configure";
import { configureGraz } from "../actions/configure";
import { ClientOnly } from "./client-only";
import { GrazEvents } from "./events";

const queryClient = new QueryClient({
  //
});

export type GrazProviderProps = Partial<QueryClientProviderProps> & {
  grazOptions?: ConfigureGrazArgs;
  debug?: boolean;
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
export const GrazProvider: FC<GrazProviderProps> = ({ children, grazOptions, debug, ...props }) => {
  if (grazOptions) {
    configureGraz(grazOptions);
  }
  return (
    <QueryClientProvider client={queryClient} {...props}>
      <ClientOnly>
        <GrazEvents />
        {children}
      </ClientOnly>
      {debug ? <ReactQueryDevtools initialIsOpen={false} position="bottom-right" /> : null}
    </QueryClientProvider>
  );
};
