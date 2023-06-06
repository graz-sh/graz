// https://github.com/cosmos/cosmjs/blob/main/packages/stargate/src/queryclient/queryclient.ts#L30-L490

import { QueryClient } from "@cosmjs/stargate";
import { assert, isNonNullObject } from "@cosmjs/utils";

import { useGrazSessionStore } from "../../store";
import type { ExtensionSetup } from "../../types/tendermint";

// https://stackoverflow.com/a/53143568/4273667
export interface CreateQueryClient {
  (): QueryClient;
  <A extends object>(setupA: ExtensionSetup<A>): QueryClient & A;
  <A extends object, B extends object>(setupA: ExtensionSetup<A>, setupB: ExtensionSetup<B>): QueryClient & A & B;
  <A extends object, B extends object, C extends object>(
    setupA: ExtensionSetup<A>,
    setupB: ExtensionSetup<B>,
    setupC: ExtensionSetup<C>,
  ): QueryClient & A & B & C;
  <A extends object, B extends object, C extends object, D extends object>(
    setupA: ExtensionSetup<A>,
    setupB: ExtensionSetup<B>,
    setupC: ExtensionSetup<C>,
    setupD: ExtensionSetup<D>,
  ): QueryClient & A & B & C & D;
  <A extends object, B extends object, C extends object, D extends object, E extends object>(
    setupA: ExtensionSetup<A>,
    setupB: ExtensionSetup<B>,
    setupC: ExtensionSetup<C>,
    setupD: ExtensionSetup<D>,
    setupE: ExtensionSetup<E>,
  ): QueryClient & A & B & C & D & E;
  <A extends object, B extends object, C extends object, D extends object, E extends object, F extends object>(
    setupA: ExtensionSetup<A>,
    setupB: ExtensionSetup<B>,
    setupC: ExtensionSetup<C>,
    setupD: ExtensionSetup<D>,
    setupE: ExtensionSetup<E>,
    setupF: ExtensionSetup<F>,
  ): QueryClient & A & B & C & D & E & F;
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
  ): QueryClient & A & B & C & D & E & F & G;
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
  ): QueryClient & A & B & C & D & E & F & G & H;
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
  ): QueryClient & A & B & C & D & E & F & G & H & I;
}

/**
 * Note: `createQueryClient` creates \@cosmjs/stargate's {@link QueryClient},
 * NOT to be confused with \@tanstack/react-query query client
 */
export const createQueryClient: CreateQueryClient = (...extensionSetups: ExtensionSetup[]) => {
  const { tendermint } = useGrazSessionStore.getState().clients!;
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
};
