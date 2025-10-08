import type { UseQueryResult } from "@tanstack/react-query";

export interface MutationEventArgs<TInitial = unknown, TSuccess = TInitial> {
  onError?: (error: unknown, data: TInitial) => unknown;
  onLoading?: (data: TInitial) => unknown;
  onSuccess?: (data: TSuccess) => unknown;
}

/**
 * Type utility to convert a readonly array of chain IDs to a mapped record type.
 * This enables type inference for chainId arrays.
 *
 * @example
 * ```ts
 * type Result = ChainIdToRecord<readonly ["cosmoshub-4", "osmosis-1"], Key>;
 * // Result: { "cosmoshub-4": Key, "osmosis-1": Key }
 * ```
 */
export type ChainIdToRecord<T extends readonly string[], TData> = {
  [K in T[number]]: TData;
};

/**
 * Query result type for multi-chain hooks with type inference.
 *
 * - When `chainId` is provided as a readonly array, returns a Record with exact keys
 * - When `chainId` is undefined, returns a generic Record<string, TData>
 *
 * @example
 * ```ts
 * // Type inference with chainId array
 * const result: UseMultiChainQueryResult<readonly ["cosmoshub-4"], Key>;
 * // result.data?: { "cosmoshub-4": Key }
 *
 * // Generic type when chainId is undefined
 * const result: UseMultiChainQueryResult<undefined, Key>;
 * // result.data?: Record<string, Key>
 * ```
 */
export type UseMultiChainQueryResult<TChainIds extends readonly string[] | undefined, TData> = UseQueryResult<
  TChainIds extends readonly string[] ? ChainIdToRecord<TChainIds, TData> : Record<string, TData>
>;

export interface QueryConfig {
  enabled?: boolean;
}
