import { useMutation } from "@tanstack/react-query";

import type { SendIbcTokensArgs, SendTokensArgs } from "../actions/methods";
import { sendIbcTokens, sendTokens } from "../actions/methods";
import type { MutationEventArgs } from "../types/hooks";
import { useAccount } from "./account";

/**
 * graz mutation hook to send tokens. Note: if `senderAddress` undefined, it will use current connected account address.
 *
 * @example
 * ```ts
 * import { useSendTokens } from "graz";
 *
 * // basic example
 * const { sendTokens } = useSendTokens();
 *
 * sendTokens({
 *    recipientAddress: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430";
 *    amount: [coin];
 *    ...
 * })
 * ```
 *
 * @see {@link sendTokens}
 */
export function useSendTokens({ onError, onLoading, onSuccess }: MutationEventArgs = {}) {
  const { data: account } = useAccount();
  const accountAddress = account?.bech32Address;

  const queryKey = ["USE_SEND_TOKENS", onError, onLoading, onSuccess, accountAddress];
  const mutation = useMutation(
    queryKey,
    (args: SendTokensArgs) => sendTokens({ senderAddress: accountAddress, ...args }),
    {
      onError: (err, args) => Promise.resolve(onError?.(err, args)),
      onMutate: onLoading,
      onSuccess: (txResponse) => Promise.resolve(onSuccess?.(txResponse)),
    },
  );

  return {
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    sendTokens: mutation.mutate,
    sendTokensAsync: mutation.mutateAsync,
    status: mutation.status,
  };
}
/**
 * graz mutation hook to send IBC tokens. Note: if `senderAddress` undefined, it will use current connected account address.
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
 *    recipientAddress: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
 *    transferAmount: coin,
 *    ...
 * })
 * ```
 */
export function useSendIbcTokens({ onError, onLoading, onSuccess }: MutationEventArgs = {}) {
  const { data: account } = useAccount();
  const accountAddress = account?.bech32Address;

  const queryKey = ["USE_SEND_IBC_TOKENS", onError, onLoading, onSuccess, accountAddress];
  const mutation = useMutation(
    queryKey,
    (args: SendIbcTokensArgs) => sendIbcTokens({ senderAddress: accountAddress, ...args }),
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
    sendIbcTokens: mutation.mutate,
    sendIbcTokensAsync: mutation.mutateAsync,
    status: mutation.status,
  };
}
