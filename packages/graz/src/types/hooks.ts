import type { UseQueryResult } from "@tanstack/react-query";

export interface MutationEventArgs<TInitial = unknown, TSuccess = TInitial> {
  onError?: (error: unknown, data: TInitial) => unknown;
  onLoading?: (data: TInitial) => unknown;
  onSuccess?: (data: TSuccess) => unknown;
}

export type UseMultiChainQueryResult<TMulti extends boolean, TData> = UseQueryResult<
  TMulti extends true ? Record<string, TData> : TData
>;

export interface QueryConfig {
  enabled?: boolean;
}
