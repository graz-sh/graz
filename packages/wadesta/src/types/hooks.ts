export interface MutationEventArgs<TInitial = unknown, TSuccess = TInitial> {
  onError?: (error?: unknown, data?: TInitial) => unknown;
  onLoading?: (data?: TInitial) => unknown;
  onSuccess?: (data?: TSuccess, initial?: TInitial) => unknown;
}
