import type { ChainInfo } from "@keplr-wallet/types";

import { useGrazInternalStore } from "../store";
import type { WalletType } from "../types/wallet";
import { LogCategory } from "../types/logger";
import { getLogger } from "../utils/logger";
import type { ConnectResult } from "./account";
import { connect } from "./account";
import { getWallet } from "./wallet";

export const clearRecentChain = (): void => {
  const logger = getLogger();
  logger.debug(LogCategory.STORE, "Clearing recent chains", { function: "clearRecentChain" });
  useGrazInternalStore.setState({ recentChainIds: null });
};

export const getRecentChainIds = (): string[] | null => {
  const logger = getLogger();
  const recentChainIds = useGrazInternalStore.getState().recentChainIds;
  logger.debug(LogCategory.STORE, "Getting recent chain IDs", { function: "getRecentChainIds", chainIds: recentChainIds });
  return recentChainIds;
};

export const getRecentChains = (): ChainInfo[] | null => {
  const logger = getLogger();
  const { recentChainIds: recentChains, chains } = useGrazInternalStore.getState();
  const result = recentChains?.map((chainId) => chains!.find((x) => x.chainId === chainId)!) ?? null;
  logger.debug(LogCategory.STORE, "Getting recent chains", {
    function: "getRecentChains",
    chainIds: recentChains,
    chainCount: result?.length ?? 0,
  });
  return result;
};

export const getChainInfo = ({ chainId }: { chainId?: string } = {}): ChainInfo | undefined => {
  const logger = getLogger();
  const chainInfo = useGrazInternalStore.getState().chains?.find((x) => x.chainId === chainId);
  logger.debug(LogCategory.STORE, "Getting chain info", {
    function: "getChainInfo",
    chainId,
    found: Boolean(chainInfo),
  });
  return chainInfo;
};

export const getChainInfos = ({ chainId }: { chainId?: string[] } = {}): ChainInfo[] | undefined => {
  const logger = getLogger();
  const chains = useGrazInternalStore.getState().chains;
  const result = !chainId ? chains ?? undefined : chains?.filter((x) => chainId.includes(x.chainId));
  logger.debug(LogCategory.STORE, "Getting chain infos", {
    function: "getChainInfos",
    requestedChainIds: chainId,
    resultCount: result?.length ?? 0,
  });
  return result;
};

export interface AddChainArgs {
  chainInfo: ChainInfo;
}

export const addChain = async ({ chainInfo }: AddChainArgs): Promise<ChainInfo> => {
  const logger = getLogger();

  logger.debug(LogCategory.STORE, "Adding chain", {
    function: "addChain",
    chainId: chainInfo.chainId,
    chainName: chainInfo.chainName,
  });

  // Add chain to internal store if not already present
  const { chains } = useGrazInternalStore.getState();
  const existingChain = chains?.find((x) => x.chainId === chainInfo.chainId);

  if (existingChain) {
    logger.warn(LogCategory.STORE, "Chain already exists", { function: "addChain", chainId: chainInfo.chainId });
    throw new Error(`Chain with chainId "${chainInfo.chainId}" already exists in the store`);
  }

  useGrazInternalStore.setState((prev) => ({
    chains: [...(prev.chains || []), chainInfo],
  }));

  logger.info(LogCategory.STORE, "Chain added successfully", {
    function: "addChain",
    chainId: chainInfo.chainId,
    chainName: chainInfo.chainName,
  });

  return chainInfo;
};

export interface SuggestChainArgs {
  chainInfo: ChainInfo;
  walletType: WalletType;
}

export const suggestChain = async ({ chainInfo, walletType }: SuggestChainArgs): Promise<ChainInfo> => {
  const logger = getLogger();

  logger.debug(LogCategory.WALLET, "Suggesting chain to wallet", {
    function: "suggestChain",
    chainId: chainInfo.chainId,
    chainName: chainInfo.chainName,
    walletType,
  });

  try {
    const wallet = getWallet(walletType);
    await wallet.experimentalSuggestChain(chainInfo);

    // Add chain to internal store if not already present
    const { chains } = useGrazInternalStore.getState();
    const existingChain = chains?.find((x) => x.chainId === chainInfo.chainId);

    if (!existingChain) {
      useGrazInternalStore.setState((prev) => ({
        chains: [...(prev.chains || []), chainInfo],
      }));
      logger.debug(LogCategory.STORE, "Chain added to store after suggestion", { function: "suggestChain", chainId: chainInfo.chainId });
    }

    logger.info(LogCategory.WALLET, "Chain suggested successfully", {
      function: "suggestChain",
      chainId: chainInfo.chainId,
      chainName: chainInfo.chainName,
      walletType,
    });

    return chainInfo;
  } catch (error) {
    logger.error(LogCategory.WALLET, "Failed to suggest chain", {
      function: "suggestChain",
      error: error instanceof Error ? error.message : String(error),
      chainId: chainInfo.chainId,
      walletType,
    });
    throw error;
  }
};

export interface SuggestChainAndConnectArgs {
  chainInfo: ChainInfo;
  walletType?: WalletType;
  autoReconnect?: boolean;
}

export const suggestChainAndConnect = async (args: SuggestChainAndConnectArgs): Promise<ConnectResult> => {
  const logger = getLogger();
  const defaultWalletType = useGrazInternalStore.getState().walletType;
  const walletType = args.walletType ?? defaultWalletType;

  logger.info(LogCategory.WALLET, "Suggesting chain and connecting", {
    function: "suggestChainAndConnect",
    chainId: args.chainInfo.chainId,
    chainName: args.chainInfo.chainName,
    walletType,
  });

  logger.time("suggest-chain-and-connect");

  try {
    await suggestChain({ chainInfo: args.chainInfo, walletType });
    const result = await connect({
      chainId: args.chainInfo.chainId,
      walletType: args.walletType,
      autoReconnect: args.autoReconnect,
    });

    logger.timeEnd("suggest-chain-and-connect");
    logger.info(LogCategory.WALLET, "Chain suggested and connected successfully", {
      function: "suggestChainAndConnect",
      chainId: args.chainInfo.chainId,
      walletType: result.walletType,
    });

    return result;
  } catch (error) {
    logger.timeEnd("suggest-chain-and-connect");
    logger.error(LogCategory.WALLET, "Failed to suggest chain and connect", {
      function: "suggestChainAndConnect",
      error: error instanceof Error ? error.message : String(error),
      chainId: args.chainInfo.chainId,
    });
    throw error;
  }
};
