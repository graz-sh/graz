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

export function createQueryClient(...extensionSetups: ExtensionSetup[]): any {
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
