import { type FC, type ReactNode, useEffect } from "react";

import type { ConfigureGrazArgs } from "../actions/configure";
import { configureGraz } from "../actions/configure";
import { ClientOnly } from "./client-only";
import { GrazEvents } from "./events";

export interface GrazProviderProps {
  grazOptions: ConfigureGrazArgs;
  children: ReactNode;
}

/**
 * Provider component configures various `graz` side effects.
 * Graz uses `@tanstack/react-query`'s features under the hood, hence you need to wrap `GrazProvider` with `QueryClientProvider`.
 * @example
 * ```tsx
 * import { GrazProvider, LogLevel } from "graz";
 *
 * // example next.js application in _app.tsx
 * export default function CustomApp({ Component, pageProps }: AppProps) {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <GrazProvider grazOptions={{
 *         chains: [cosmoshubChainInfo, osmosisChainInfo],
 *         logger: {
 *           enabled: true,
 *           level: LogLevel.DEBUG,
 *           categories: ['wallet', 'transaction'],
 *         }
 *       }}>
 *         <Component {...pageProps} />
 *       </GrazProvider>
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 *
 * @see https://tanstack.com/query
 */
export const GrazProvider: FC<GrazProviderProps> = ({ children, grazOptions }) => {
  useEffect(() => {
    configureGraz(grazOptions);
  }, [grazOptions]);

  return (
    <ClientOnly>
      {children}
      <GrazEvents />
    </ClientOnly>
  );
};
