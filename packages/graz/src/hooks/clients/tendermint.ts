import type { QueryClient } from "@cosmjs/stargate";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { createTendermintQueryClient } from "../../actions/chains";
import type { ExtensionSetup } from "../../types/tendermint";

export function useTendermintQueryClient(): UseQueryResult<QueryClient>;

export function useTendermintQueryClient<A extends object>(setupA: ExtensionSetup<A>): UseQueryResult<QueryClient & A>;

export function useTendermintQueryClient<A extends object, B extends object>(
  setupA: ExtensionSetup<A>,
  setupB: ExtensionSetup<B>,
): UseQueryResult<QueryClient & A & B>;

export function useTendermintQueryClient<A extends object, B extends object, C extends object>(
  setupA: ExtensionSetup<A>,
  setupB: ExtensionSetup<B>,
  setupC: ExtensionSetup<C>,
): UseQueryResult<QueryClient & A & B & C>;

export function useTendermintQueryClient<A extends object, B extends object, C extends object, D extends object>(
  setupA: ExtensionSetup<A>,
  setupB: ExtensionSetup<B>,
  setupC: ExtensionSetup<C>,
  setupD: ExtensionSetup<D>,
): UseQueryResult<QueryClient & A & B & C & D>;

export function useTendermintQueryClient<
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

export function useTendermintQueryClient<
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

export function useTendermintQueryClient<
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

export function useTendermintQueryClient<
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

export function useTendermintQueryClient<
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

export function useTendermintQueryClient<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
  G extends object,
  H extends object,
  I extends object,
  J extends object,
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
  setupJ: ExtensionSetup<J>,
): UseQueryResult<QueryClient & A & B & C & D & E & F & G & H & I & J>;

export function useTendermintQueryClient<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
  G extends object,
  H extends object,
  I extends object,
  J extends object,
  K extends object,
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
  setupJ: ExtensionSetup<J>,
  setupK: ExtensionSetup<K>,
): UseQueryResult<QueryClient & A & B & C & D & E & F & G & H & I & J & K>;

export function useTendermintQueryClient<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
  G extends object,
  H extends object,
  I extends object,
  J extends object,
  K extends object,
  L extends object,
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
  setupJ: ExtensionSetup<J>,
  setupK: ExtensionSetup<K>,
  setupL: ExtensionSetup<L>,
): UseQueryResult<QueryClient & A & B & C & D & E & F & G & H & I & J & K & L>;

export function useTendermintQueryClient<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
  G extends object,
  H extends object,
  I extends object,
  J extends object,
  K extends object,
  L extends object,
  M extends object,
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
  setupJ: ExtensionSetup<J>,
  setupK: ExtensionSetup<K>,
  setupL: ExtensionSetup<L>,
  setupM: ExtensionSetup<M>,
): UseQueryResult<QueryClient & A & B & C & D & E & F & G & H & I & J & K & L & M>;

export function useTendermintQueryClient<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
  G extends object,
  H extends object,
  I extends object,
  J extends object,
  K extends object,
  L extends object,
  M extends object,
  N extends object,
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
  setupJ: ExtensionSetup<J>,
  setupK: ExtensionSetup<K>,
  setupL: ExtensionSetup<L>,
  setupM: ExtensionSetup<M>,
  setupN: ExtensionSetup<N>,
): UseQueryResult<QueryClient & A & B & C & D & E & F & G & H & I & J & K & L & M & N>;

export function useTendermintQueryClient<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
  G extends object,
  H extends object,
  I extends object,
  J extends object,
  K extends object,
  L extends object,
  M extends object,
  N extends object,
  O extends object,
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
  setupJ: ExtensionSetup<J>,
  setupK: ExtensionSetup<K>,
  setupL: ExtensionSetup<L>,
  setupM: ExtensionSetup<M>,
  setupN: ExtensionSetup<N>,
  setupO: ExtensionSetup<O>,
): UseQueryResult<QueryClient & A & B & C & D & E & F & G & H & I & J & K & L & M & N & O>;

export function useTendermintQueryClient<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
  G extends object,
  H extends object,
  I extends object,
  J extends object,
  K extends object,
  L extends object,
  M extends object,
  N extends object,
  O extends object,
  P extends object,
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
  setupJ: ExtensionSetup<J>,
  setupK: ExtensionSetup<K>,
  setupL: ExtensionSetup<L>,
  setupM: ExtensionSetup<M>,
  setupN: ExtensionSetup<N>,
  setupO: ExtensionSetup<O>,
  setupP: ExtensionSetup<P>,
): UseQueryResult<QueryClient & A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P>;

export function useTendermintQueryClient<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
  G extends object,
  H extends object,
  I extends object,
  J extends object,
  K extends object,
  L extends object,
  M extends object,
  N extends object,
  O extends object,
  P extends object,
  Q extends object,
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
  setupJ: ExtensionSetup<J>,
  setupK: ExtensionSetup<K>,
  setupL: ExtensionSetup<L>,
  setupM: ExtensionSetup<M>,
  setupN: ExtensionSetup<N>,
  setupO: ExtensionSetup<O>,
  setupP: ExtensionSetup<P>,
  setupQ: ExtensionSetup<Q>,
): UseQueryResult<QueryClient & A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q>;

export function useTendermintQueryClient<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
  G extends object,
  H extends object,
  I extends object,
  J extends object,
  K extends object,
  L extends object,
  M extends object,
  N extends object,
  O extends object,
  P extends object,
  Q extends object,
  R extends object,
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
  setupJ: ExtensionSetup<J>,
  setupK: ExtensionSetup<K>,
  setupL: ExtensionSetup<L>,
  setupM: ExtensionSetup<M>,
  setupN: ExtensionSetup<N>,
  setupO: ExtensionSetup<O>,
  setupP: ExtensionSetup<P>,
  setupQ: ExtensionSetup<Q>,
  setupR: ExtensionSetup<R>,
): UseQueryResult<QueryClient & A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R>;

export function useTendermintQueryClient(...extensionSetups: ExtensionSetup<object>[]): any {
  const queryKey = ["USE_TENDERMINT_QUERY_CLIENT", extensionSetups] as const;
  const query = useQuery(
    queryKey,
    ({ queryKey: [, _extensionSetups] }) => {
      // @ts-expect-error spreading tuples
      return createTendermintQueryClient(...extensionSetups);
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );
  return query;
}
