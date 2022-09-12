import type { QueryClient } from "@cosmjs/stargate";

export type ExtensionSetup<P> = (queryClient: QueryClient) => P;
