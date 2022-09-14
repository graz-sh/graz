import type { DeliverTxResponse } from "@cosmjs/stargate";
import { useMutation } from "@tanstack/react-query";

import { sendIbcTokens, sendTokens } from "../actions/methods";
import type { MutationEventArgs } from "../types/hooks";
import type { SendIbcTokensProps, SendTokensProps } from "../types/methods";
import { useAccount } from "./account";

/**
 * graz mutation hook to send tokens with optional arguments to invoke given functions on error, loading, or success event.
 *
 *
 * @example
 * ```ts
 * import { useSendTokens } from "graz";
 *
 * // basic example
 * const { sendTokens } = useSendTokens();
 *
 * sendTokens({
 * // ...args
 * })
 * ```
 */
export function useSendTokens({ onError, onLoading, onSuccess }: MutationEventArgs = {}) {
  const { data: account } = useAccount();
  const accountAddress = account?.bech32Address;

  const queryKey = ["USE_SEND_TOKENS", onError, onLoading, onSuccess, accountAddress];
  const mutation = useMutation<DeliverTxResponse, unknown, SendTokensProps>(
    queryKey,
    ({ senderAddress, ...rest }) =>
      sendTokens({
        senderAddress: senderAddress || accountAddress,
        ...rest,
      }),
    {
      onError: (err, txResponse) => Promise.resolve(onError?.(err, txResponse)),
      onMutate: onLoading,
      onSuccess: (txResponse) => Promise.resolve(onSuccess?.(txResponse)),
    },
  );

  return {
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    /**
     * if senderAddress undefined, it will use current connected account address
     */
    sendTokens: mutation.mutate,
    /**
     * if senderAddress undefined, it will use current connected account address
     */
    sendTokensAsync: mutation.mutateAsync,
    status: mutation.status,
  };
}
/**
 * graz mutation hook to send IBC tokens with optional arguments to invoke given functions on error, loading, or success event.
 *
 *
 * @example
 * ```ts
 * import { useSendIbcTokens } from "graz";
 *
 * // basic example
 * const { sendIbcTokens } = useSendIbcTokens();
 *
 * sendIbcTokens({
 * // ...args
 * })
 * ```
 */
export function useSendIbcTokens({ onError, onLoading, onSuccess }: MutationEventArgs = {}) {
  const { data: account } = useAccount();
  const accountAddress = account?.bech32Address;

  const queryKey = ["USE_SEND_IBC_TOKENS", onError, onLoading, onSuccess, accountAddress];
  const mutation = useMutation<DeliverTxResponse, unknown, SendIbcTokensProps>(
    queryKey,
    ({ senderAddress, ...rest }) =>
      sendIbcTokens({
        senderAddress: senderAddress || accountAddress,
        ...rest,
      }),
    {
      onError: (err, txResponse) => Promise.resolve(onError?.(err, txResponse)),
      onMutate: onLoading,
      onSuccess: (txResponse) => Promise.resolve(onSuccess?.(txResponse)),
    },
  );

  return {
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    /**
     * if senderAddress undefined, it will use current connected account address
     */
    sendIbcTokens: mutation.mutate,
    /**
     * if senderAddress undefined, it will use current connected account address
     */
    sendIbcTokensAsync: mutation.mutateAsync,
    status: mutation.status,
  };
}
