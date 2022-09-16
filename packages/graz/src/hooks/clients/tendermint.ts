import type { QueryClient } from "@cosmjs/stargate";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { createQueryClient } from "../../actions/chains";
import type { ExtensionSetup } from "../../types/tendermint";

/**
 * graz query hook to create and use {@link QueryClient} similar when using {@link QueryClient.withExtensions}.
 *
 * Note: `useQueryClient` returns \@cosmjs/stargate's {@link QueryClient},
 * NOT to be confused with \@tanstack/react-query useQueryClient.
 *
 * @example
 * ```ts
 * // example without extensions
 * import { useQueryClient } from "graz";
 *
 * const queryClient = useQueryClient();
 *
 * // example with extensions
 * import { useQueryClient } from "graz";
 * import { setupAuthExtension, setupIbcExtension } from "@cosmjs/stargate";
 *
 * const queryClientWithExtensions = useQueryClient(setupAuthExtension, setupIbcExtension);
 * ```
 *
 * @see {@link createQueryClient}
 */
export function useQueryClient(): UseQueryResult<QueryClient>;

export function useQueryClient<A extends object>(setupA: ExtensionSetup<A>): UseQueryResult<QueryClient & A>;

export function useQueryClient<A extends object, B extends object>(
  setupA: ExtensionSetup<A>,
  setupB: ExtensionSetup<B>,
): UseQueryResult<QueryClient & A & B>;

export function useQueryClient<A extends object, B extends object, C extends object>(
  setupA: ExtensionSetup<A>,
  setupB: ExtensionSetup<B>,
  setupC: ExtensionSetup<C>,
): UseQueryResult<QueryClient & A & B & C>;

export function useQueryClient<A extends object, B extends object, C extends object, D extends object>(
  setupA: ExtensionSetup<A>,
  setupB: ExtensionSetup<B>,
  setupC: ExtensionSetup<C>,
  setupD: ExtensionSetup<D>,
): UseQueryResult<QueryClient & A & B & C & D>;

export function useQueryClient<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
>(
  setupA: ExtensionSetup<A>,
  setupB: ExtensionSetup<B>,
  setupC: ExtensionSetup<C>,
  setupD: ExtensionSetup<D>,
  setupE: ExtensionSetup<E>,
): UseQueryResult<QueryClient & A & B & C & D & E>;

export function useQueryClient<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
>(
  setupA: ExtensionSetup<A>,
  setupB: ExtensionSetup<B>,
  setupC: ExtensionSetup<C>,
  setupD: ExtensionSetup<D>,
  setupE: ExtensionSetup<E>,
  setupF: ExtensionSetup<F>,
): UseQueryResult<QueryClient & A & B & C & D & E & F>;

export function useQueryClient<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
  G extends object,
>(
  setupA: ExtensionSetup<A>,
  setupB: ExtensionSetup<B>,
  setupC: ExtensionSetup<C>,
  setupD: ExtensionSetup<D>,
  setupE: ExtensionSetup<E>,
  setupF: ExtensionSetup<F>,
  setupG: ExtensionSetup<G>,
): UseQueryResult<QueryClient & A & B & C & D & E & F & G>;

export function useQueryClient<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
  G extends object,
  H extends object,
>(
  setupA: ExtensionSetup<A>,
  setupB: ExtensionSetup<B>,
  setupC: ExtensionSetup<C>,
  setupD: ExtensionSetup<D>,
  setupE: ExtensionSetup<E>,
  setupF: ExtensionSetup<F>,
  setupG: ExtensionSetup<G>,
  setupH: ExtensionSetup<H>,
): UseQueryResult<QueryClient & A & B & C & D & E & F & G & H>;

export function useQueryClient<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
  G extends object,
  H extends object,
  I extends object,
>(
  setupA: ExtensionSetup<A>,
  setupB: ExtensionSetup<B>,
  setupC: ExtensionSetup<C>,
  setupD: ExtensionSetup<D>,
  setupE: ExtensionSetup<E>,
  setupF: ExtensionSetup<F>,
  setupG: ExtensionSetup<G>,
  setupH: ExtensionSetup<H>,
  setupI: ExtensionSetup<I>,
): UseQueryResult<QueryClient & A & B & C & D & E & F & G & H & I>;

export function useQueryClient(...extensionSetups: ExtensionSetup[]): any {
  const queryKey = ["USE_QUERY_CLIENT", ...extensionSetups] as const;
  const query = useQuery(
    queryKey,
    ({ queryKey: [, ..._extensionSetups] }) => {
      // @ts-expect-error spreading tuples
      return createQueryClient(...extensionSetups);
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );
  return query;
}
