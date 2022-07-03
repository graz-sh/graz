export interface EventableHooksArgs<TInitial = unknown, TSuccess = TInitial> {
  onError?: (error?: unknown, data?: TInitial) => unknown;
  onLoading?: (data?: TInitial) => unknown;
  onSuccess?: (data?: TSuccess, initial?: TInitial) => unknown;
}
