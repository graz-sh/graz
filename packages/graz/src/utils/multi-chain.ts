import pMap from "p-map";

import type { GrazChain } from "../chains";
import { useGrazInternalStore } from "../store";

export type ChainId = string | string[];

export const useChainsFromArgs = ({ chainId, multiChain }: { chainId?: ChainId; multiChain?: boolean }) => {
  const chains = useGrazInternalStore((x) => x.chains);
  if (!chains) throw new Error("No chains found in GrazProvider");
  const chainIds = typeof chainId === "string" ? [chainId] : chainId;
  switch (true) {
    case Boolean(multiChain) && Boolean(chainIds):
      return chainIds!.map((id) => chains.find((c) => c.chainId === id)!).filter(Boolean);
    case !multiChain && Boolean(chainIds):
      return [chainIds!.map((id) => chains.find((c) => c.chainId === id)!).filter(Boolean)[0]!];
    case Boolean(multiChain) && !chainIds:
      return chains;
    default:
      return [chains[0]!];
  }
};

export const createMultiChainAsyncFunction = async <T>(
  multiChain: boolean,
  chains: GrazChain[],
  fn: (chain: GrazChain) => Promise<T>,
) => {
  const concurrency = useGrazInternalStore.getState().multiChainConcurrency;
  if (multiChain) {
    const res = await pMap(chains, fn, { concurrency });
    return Object.fromEntries(res.map((x, i) => [chains[i]!.chainId, x]));
  }
  const res = await fn(chains[0]!);
  return res;
};
