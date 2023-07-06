export interface ChainIdArgs {
  chainId?: string | undefined;
}

export type HookArgs<T, U> = T & U;

export type HookResultDataWithChainId<T, U extends ChainIdArgs> = U["chainId"] extends string ? T : Record<string, T>;
