export interface ChainIdArgs {
  /**
   * if provided, it will only return the data of the given chainId
   */
  chainId?: string | string[] | undefined;
}

export type HookResultDataWithChainId<T, U extends ChainIdArgs> = U["chainId"] extends string ? T : Record<string, T>;
