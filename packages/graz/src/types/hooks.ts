import type { UseQueryResult } from "@tanstack/react-query";

import type { MultiChainHookArgs } from "../utils/multi-chain";

export interface MutationEventArgs<TInitial = unknown, TSuccess = TInitial> {
  onError?: (error: unknown, data: TInitial) => unknown;
  onLoading?: (data: TInitial) => unknown;
  onSuccess?: (data: TSuccess) => unknown;
}

type ChainId = string;

export type UseMultiChainQueryResult<TMulti extends MultiChainHookArgs, TData> = UseQueryResult<
  TMulti["multiChain"] extends true ? Record<ChainId, TData> : TData
>;

export interface QueryConfig {
  enabled?: boolean;
}
