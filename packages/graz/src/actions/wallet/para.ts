import { useGrazInternalStore, useGrazSessionStore } from "../../store";
import type { ParaGrazConnector } from "../../types/para";
import type { Key, Wallet } from "../../types/wallet";
import { WalletType } from "../../types/wallet";

let initPromise: Promise<ParaGrazConnector> | null = null;

export const getPara = (): Wallet => {
  const getClientOrThrow = () => {
    const connector = useGrazSessionStore.getState().paraConnector;
    if (!connector) {
      throw new Error("Para connector not initialized. Call connect() first or check paraConfig in GrazProvider.");
    }
    return connector;
  };

  const paraConfig = useGrazInternalStore.getState().paraConfig;

  if (!paraConfig?.paraWeb) {
    throw new Error("Missing Para config. Provide paraConfig with 'paraWeb' to GrazProvider.");
  }

  const init = (): Promise<ParaGrazConnector> => {
    if (initPromise) return initPromise;

    initPromise = (async (): Promise<ParaGrazConnector> => {
      const existing = useGrazSessionStore.getState().paraConnector;
      if (existing) return existing;

      try {
        let ConnectorClass;

        if (paraConfig.connectorClass) {
          ConnectorClass = paraConfig.connectorClass;
        } else {
          if (typeof window === "undefined") {
            throw new Error("Para connector requires client-side execution (SSR is unsupported).");
          }
          // Use Function constructor to prevent static analysis by bundlers
          const dynamicImport = new Function("specifier", "return import(specifier)");
          const mod = await dynamicImport("@getpara/graz-integration");
          const maybe = (mod as any)?.ParaGrazConnector;
          if (typeof maybe !== "function") {
            throw new Error("Invalid ParaGrazConnector in @getpara/graz-integration. Check the package/export.");
          }
          ConnectorClass = maybe;
        }

        const chains = useGrazInternalStore.getState().chains;
        const connector = new ConnectorClass(paraConfig, chains) as ParaGrazConnector;

        useGrazSessionStore.setState((prev) => ({ ...prev, paraConnector: connector }));
        if (!connector) {
          throw new Error("Para connector initialization failed. Check config and dependencies.");
        }
        return connector;
      } catch (err: any) {
        initPromise = null;
        const isModuleNotFound =
          err?.code === "MODULE_NOT_FOUND" ||
          err?.message?.includes("Cannot find module") ||
          err?.message?.includes("Failed to resolve");

        if (isModuleNotFound) {
          throw new Error(
            "Para integration package not found. Install @getpara/graz-integration to use Para wallet: npm install @getpara/graz-integration",
          );
        }
        throw new Error(
          `Para connector init failed: ${err?.message || "Unknown error"}. Check @getpara/graz-integration and ParaConfig.`,
        );
      }
    })();

    return initPromise;
  };

  const enable = async (_chainIds: string | string[]) => {
    const chainIds = Array.isArray(_chainIds) ? _chainIds : [_chainIds];

    try {
      const connector = await init();

      useGrazSessionStore.setState({ paraConnector: connector, status: "connecting" });
      await connector.enable(chainIds);

      const accounts = Object.fromEntries(
        await Promise.all(chainIds.map(async (c): Promise<[string, Key]> => [c, await connector.getKey(c)])),
      );

      useGrazSessionStore.setState((prev) => ({
        accounts: { ...(prev.accounts || {}), ...accounts },
        activeChainIds: Array.from(new Set([...(prev.activeChainIds || []), ...chainIds])),
        status: "connected",
      }));

      useGrazInternalStore.setState((prev) => ({
        recentChainIds: Array.from(new Set([...(prev.recentChainIds || []), ...chainIds])),
        walletType: WalletType.PARA,
        _reconnect: false,
        _reconnectConnector: WalletType.PARA,
      }));
    } catch (err: any) {
      useGrazSessionStore.setState({ paraConnector: null, status: "disconnected" });
      const isModuleNotFound = err?.message?.includes("not found") || err?.message?.includes("Cannot find");

      if (isModuleNotFound) {
        throw new Error(
          "Para wallet connection failed: Required packages not installed. Install @getpara/graz-integration to enable Para wallet.",
        );
      }
      throw new Error(`Para enable failed${err instanceof Error ? `: ${err.message}` : ""}`);
    }
  };

  return {
    enable,
    disable: async () => {
      const connector = useGrazSessionStore.getState().paraConnector;

      // If no connector exists, we're already disconnected - just clean up state
      if (!connector) {
        useGrazSessionStore.setState({ paraConnector: null, status: "disconnected" });
        return;
      }

      // Connector exists, proceed with disconnect
      try {
        await connector.disconnect();
        await connector.getParaWebClient().logout();
      } catch (err: any) {
        throw new Error(
          `Para disconnect failed${err?.message ? `: ${err.message}` : ". Wallet may already be disconnected."}`,
        );
      } finally {
        useGrazSessionStore.setState({ paraConnector: null, status: "disconnected" });
      }
    },
    getKey: async (chainId) => {
      try {
        return await getClientOrThrow().getKey(chainId);
      } catch (err: any) {
        throw new Error(
          `Failed to get key${err?.message ? `: ${err.message}` : ""}. Check chain connection and Cosmos API key settings at developer.getpara.com.`,
        );
      }
    },
    getOfflineSigner: (chainId) => {
      try {
        return getClientOrThrow().getOfflineSigner(chainId);
      } catch (err: any) {
        throw new Error(
          `Failed to get offline signer${err?.message ? `: ${err.message}` : ""}. Check Para auth and Cosmos support in developer portal.`,
        );
      }
    },
    getOfflineSignerOnlyAmino: (chainId) => {
      try {
        return getClientOrThrow().getOfflineSignerOnlyAmino(chainId);
      } catch (err: any) {
        throw new Error(
          `Failed to get Amino signer${err?.message ? `: ${err.message}` : ""}. Check Para auth and Cosmos support in developer portal.`,
        );
      }
    },
    getOfflineSignerAuto: (chainId) => {
      try {
        return getClientOrThrow().getOfflineSignerAuto(chainId);
      } catch (err: any) {
        throw new Error(
          `Failed to get auto signer${err?.message ? `: ${err.message}` : ""}. Check Para auth and Cosmos support in developer portal.`,
        );
      }
    },
    signAmino: async (c, s, d, o) => {
      try {
        return await getClientOrThrow().signAmino(c, s, d, o);
      } catch (err: any) {
        throw new Error(
          `Amino signing failed${err?.message ? `: ${err.message}` : ""}. User rejected or invalid transaction/signer.`,
        );
      }
    },
    signDirect: async (c, s, d, o) => {
      try {
        return await getClientOrThrow().signDirect(c, s, d, o);
      } catch (err: any) {
        throw new Error(
          `Direct signing failed${err?.message ? `: ${err.message}` : ""}. User rejected or invalid transaction/signer.`,
        );
      }
    },
    signArbitrary: async (c, s, data) => {
      try {
        return await getClientOrThrow().signArbitrary(c, s, data);
      } catch (err: any) {
        throw new Error(
          `Arbitrary signing failed${err?.message ? `: ${err.message}` : ""}. User rejected or feature not supported.`,
        );
      }
    },
    experimentalSuggestChain: async () => {
      throw new Error("Chain suggestion not supported. Configure chains in Para wallet settings.");
    },
  };
};
