// https://github.com/cosmos/cosmjs/blob/main/packages/stargate/src/queryclient/queryclient.ts#L30-L490

import { QueryClient } from "@cosmjs/stargate";
import { assert, isNonNullObject } from "@cosmjs/utils";

import { useGrazStore } from "../../store";
import type { ExtensionSetup } from "../../types/tendermint";

/**
 * Note: `createQueryClient` creates \@cosmjs/stargate's {@link QueryClient},
 * NOT to be confused with \@tanstack/react-query query client
 */
export function createQueryClient(): QueryClient;

export function createQueryClient<A extends object>(setupA: ExtensionSetup<A>): QueryClient & A;

export function createQueryClient<A extends object, B extends object>(
  setupA: ExtensionSetup<A>,
  setupB: ExtensionSetup<B>,
): QueryClient & A & B;

export function createQueryClient<A extends object, B extends object, C extends object>(
  setupA: ExtensionSetup<A>,
  setupB: ExtensionSetup<B>,
  setupC: ExtensionSetup<C>,
): QueryClient & A & B & C;

export function createQueryClient<A extends object, B extends object, C extends object, D extends object>(
  setupA: ExtensionSetup<A>,
  setupB: ExtensionSetup<B>,
  setupC: ExtensionSetup<C>,
  setupD: ExtensionSetup<D>,
): QueryClient & A & B & C & D;

export function createQueryClient<
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
): QueryClient & A & B & C & D & E;

export function createQueryClient<
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
): QueryClient & A & B & C & D & E & F;

export function createQueryClient<
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
): QueryClient & A & B & C & D & E & F & G;

export function createQueryClient<
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
): QueryClient & A & B & C & D & E & F & G & H;

export function createQueryClient<
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
): QueryClient & A & B & C & D & E & F & G & H & I;

export function createQueryClient<
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
): QueryClient & A & B & C & D & E & F & G & H & I & J;

export function createQueryClient<
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
): QueryClient & A & B & C & D & E & F & G & H & I & J & K;

export function createQueryClient<
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
): QueryClient & A & B & C & D & E & F & G & H & I & J & K & L;

export function createQueryClient<
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
): QueryClient & A & B & C & D & E & F & G & H & I & J & K & L & M;

export function createQueryClient<
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
): QueryClient & A & B & C & D & E & F & G & H & I & J & K & L & M & N;

export function createQueryClient<
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
): QueryClient & A & B & C & D & E & F & G & H & I & J & K & L & M & N & O;

export function createQueryClient<
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
): QueryClient & A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P;

export function createQueryClient<
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
): QueryClient & A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q;

export function createQueryClient<
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
): QueryClient & A & B & C & D & E & F & G & H & I & J & K & L & M & N & O & P & Q & R;

export function createQueryClient(...extensionSetups: ExtensionSetup<object>[]): any {
  const { tendermint } = useGrazStore.getState().clients!;
  const queryClient = new QueryClient(tendermint);
  const exts = extensionSetups.map((setup) => setup(queryClient));
  for (const ext of exts) {
    assert(isNonNullObject(ext), "Extension must be a non-null object");
    for (const [key, value] of Object.entries(ext)) {
      assert(
        isNonNullObject(value),
        `Module must be a non-null object. Found type ${typeof value} for module "${key}".`,
      );
      // @ts-expect-error handle unexpected values
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const current = queryClient[key] || {};
      // @ts-expect-error handle unexpected values
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      queryClient[key] = { ...current, ...value };
    }
  }
  return queryClient;
}
