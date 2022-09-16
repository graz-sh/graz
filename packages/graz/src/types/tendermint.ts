import type { QueryClient } from "@cosmjs/stargate";

export type ExtensionSetup<P extends object = object> = (queryClient: QueryClient) => P;
