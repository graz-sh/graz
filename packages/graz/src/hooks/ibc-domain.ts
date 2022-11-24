import type { UseQueryResult } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

import type { AddressToIbcDomainReturnValue, ChainPrefix, ResolveToChainAddressArgs } from "../actions/ibc-domain";
import {
  getAddressesByIbcDomain,
  getChainAddressByIbcDomain,
  getIbcDomainByAdress,
  getIbcDomainDetails,
  resolveToChainAddress,
} from "../actions/ibc-domain";
import type { MutationEventArgs } from "../types/hooks";

/**
 * graz query hook to retrieve an ibc domain from given address.
 *
 * @param address - Optional, if address undefined this hook won't run
 * @param isTestnet - Optional for pointing to testnet
 *
 * @example
 * ```ts
 * import { useAddressToIbcDomain } from "graz";
 *
 * // basic example
 * const { data, isFetching, refetch, ... } = useAddressToIbcDomain({
 *  address: "cosmos1g3jjhgkyf36pjhe7u5cw8j9u6cgl8x929ej430",
 * });
 *
 * ```
 */
export const useAddressToIbcDomain = ({
  address,
  isTestnet,
}: {
  address?: string;
  isTestnet?: boolean;
}): UseQueryResult<AddressToIbcDomainReturnValue | null> => {
  const queryKey = ["USE_ADRESS_TO_IBC_DOMAIN", address, isTestnet] as const;
  const query = useQuery(queryKey, () => getIbcDomainByAdress(address!, isTestnet), {
    enabled: Boolean(address),
  });
  return query;
};

/**
 * graz query hook to retrieve an addresses from given ibc domain.
 *
 * @param ibcDomain - Optional ibc domain, if ibc domain undefined this hook won't run
 * @param isTestnet - Optional for pointing to testnet
 *
 * @example
 * ```ts
 * import { useIbcDomainToAddresses } from "graz";
 *
 * // basic example
 * const { data, isFetching, refetch, ... } = useIbcDomainToAddresses({
 *  ibcDomain: "kikiding.cosmos",
 * });
 *
 * ```
 */
export const useIbcDomainToAddresses = ({
  ibcDomain,
  isTestnet,
}: {
  ibcDomain?: string;
  isTestnet?: boolean;
}): UseQueryResult<string[] | null> => {
  const queryKey = ["USE_IBC_DOMAIN_TO_ADDRESSES", ibcDomain, isTestnet] as const;
  const query = useQuery(queryKey, () => getAddressesByIbcDomain(ibcDomain!, isTestnet), {
    enabled: Boolean(ibcDomain),
  });
  return query;
};

/**
 * graz query hook to retrieve an address from given ibc domain and prefix.
 *
 * @param ibcDomain - Optional ibc domain, if ibc domain undefined this hook won't run
 * @param prefix - Optional string or bech32 prefix of the destination chain, for instance "cosmos", "somm", etc
 * @param isTestnet - Optional for pointing to testnet
 *
 * @example
 * ```ts
 * import { useIbcDomainToChainAddress } from "graz";
 *
 * // basic example
 * const { data, isFetching, refetch, ... } = useIbcDomainToChainAddress({
 *  ibcDomain: "kikiding.cosmos",
 *  prefix: "osmo"
 * });
 *
 * ```
 */
export const useIbcDomainToChainAddress = ({
  ibcDomain,
  prefix,
  isTestnet,
}: {
  ibcDomain?: string;
  prefix?: ChainPrefix;
  isTestnet?: boolean;
}): UseQueryResult<string | null> => {
  const queryKey = ["USE_IBC_DOMAIN_TO_CHAIN_ADDRESS", prefix, ibcDomain, isTestnet] as const;
  const query = useQuery(queryKey, () => getChainAddressByIbcDomain(ibcDomain!, prefix!, isTestnet), {
    enabled: Boolean(ibcDomain && prefix),
  });
  return query;
};

export const useIbcDomainDetails = ({ ibcDomain, isTestnet }: { ibcDomain?: string; isTestnet?: boolean }) => {
  const queryKey = ["USE_IBC_DOMAIN_DETAILS", ibcDomain, isTestnet] as const;
  const query = useQuery(queryKey, () => getIbcDomainDetails(ibcDomain!, isTestnet), {
    enabled: Boolean(ibcDomain),
  });
  return query;
};

export type UseResolveToChainAddressArgs = MutationEventArgs<ResolveToChainAddressArgs, string>;

/**
 * graz mutation hook to resolve an Ibc domain or an address to bech32 address from given string
 *
 * @example
 * ```ts
 * import { useResolveToChainAddress } from "graz";
 *
 * // basic example
 * const { resolveToChainAddress } = useResolveToChainAddress();
 *
 * // with event arguments
 * useResolveToChainAddress({
 *   onError: (err, args) => { ... },
 *   onLoading: () => { ... },
 *   onSuccess: ({ account, address }) => { ... },
 * });
 *
 * // resolveToChainAddress usage
 * resolveToChainAddress({
 *   value: "kikiding.cosmos",
 *   prefix: "osmo"
 *   ...
 * });
 * ```
 */
export const useResolveToChainAddress = ({ onError, onLoading, onSuccess }: UseResolveToChainAddressArgs = {}) => {
  const queryKey = ["USE_RESOLVE_TO_CHAIN_ADDRESS", onError, onLoading, onSuccess];
  const mutation = useMutation(queryKey, resolveToChainAddress, {
    onError: (err, args) => Promise.resolve(onError?.(err, args)),
    onMutate: onLoading,
    onSuccess: (address) => Promise.resolve(onSuccess?.(address)),
  });

  return {
    error: mutation.error,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    resolveToChainAddress: mutation.mutate,
    resolveToChainAddressAsync: mutation.mutateAsync,
    status: mutation.status,
  };
};
