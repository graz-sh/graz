import type { QueryClient } from "@cosmjs/stargate";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { createQueryClient } from "../../actions/chains";
import type { ExtensionSetup } from "../../types/tendermint";

// https://stackoverflow.com/a/53143568/4273667
export interface UseQueryClient {
  (): UseQueryResult<QueryClient>;
  <A extends object>(setupA: ExtensionSetup<A>): UseQueryResult<QueryClient & A>;
  <A extends object, B extends object>(setupA: ExtensionSetup<A>, setupB: ExtensionSetup<B>): UseQueryResult<
    QueryClient & A & B
  >;
  <A extends object, B extends object, C extends object>(
    setupA: ExtensionSetup<A>,
    setupB: ExtensionSetup<B>,
    setupC: ExtensionSetup<C>,
  ): UseQueryResult<QueryClient & A & B & C>;
  <A extends object, B extends object, C extends object, D extends object>(
    setupA: ExtensionSetup<A>,
    setupB: ExtensionSetup<B>,
    setupC: ExtensionSetup<C>,
    setupD: ExtensionSetup<D>,
  ): UseQueryResult<QueryClient & A & B & C & D>;
  <A extends object, B extends object, C extends object, D extends object, E extends object>(
    setupA: ExtensionSetup<A>,
    setupB: ExtensionSetup<B>,
    setupC: ExtensionSetup<C>,
    setupD: ExtensionSetup<D>,
    setupE: ExtensionSetup<E>,
  ): UseQueryResult<QueryClient & A & B & C & D & E>;
  <A extends object, B extends object, C extends object, D extends object, E extends object, F extends object>(
    setupA: ExtensionSetup<A>,
    setupB: ExtensionSetup<B>,
    setupC: ExtensionSetup<C>,
    setupD: ExtensionSetup<D>,
    setupE: ExtensionSetup<E>,
    setupF: ExtensionSetup<F>,
  ): UseQueryResult<QueryClient & A & B & C & D & E & F>;
  <
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
  <
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
  <
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
}

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
export const useQueryClient: UseQueryClient = (...extensionSetups: ExtensionSetup[]) => {
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
};
