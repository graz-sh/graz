import { Cosmiframe } from "@dao-dao/cosmiframe";
import type { SignClientTypes } from "@walletconnect/types";
import type { FC } from "react";
import { useEffect } from "react";

import { connect, disconnectWithReason, reconnect } from "../actions/account";
import { checkWallet, getWallet, isWalletConnect } from "../actions/wallet";
import { resolveSessionScope } from "../actions/wallet/wallet-connect/approved-session";
import { LogCategory } from "../types/logger";
import { getLogger } from "../utils/logger";
import { RECONNECT_SESSION_KEY } from "../constant";
import { useGrazInternalStore, useGrazSessionStore } from "../store";
import { WalletType } from "../types/wallet";

/**
 * Graz custom hook to track `keplr_keystorechange`, `accountChanged` event and reconnect state
 *
 * **Note: only use this hook if not using graz's provider component.**
 */
export const useGrazEvents = () => {
  const logger = getLogger();
  const isSessionActive =
    typeof window !== "undefined" && window.sessionStorage.getItem(RECONNECT_SESSION_KEY) === "Active";
  const { _reconnect, _onReconnectFailed, _reconnectConnector, iframeOptions, chains, pingInterval } =
    useGrazInternalStore();
  const { activeChainIds: activeChains, wcSignClients } = useGrazSessionStore();
  const isReconnectConnectorReady = checkWallet(_reconnectConnector || undefined);

  /**
   * Reconnects to the wallet if the session is active and the reconnect connector is ready on window focus.
   */
  useEffect(() => {
    const handleFocus = async () => {
      if (isSessionActive && isReconnectConnectorReady && _reconnectConnector && activeChains?.[0]) {
        const lastPing = useGrazSessionStore.getState().lastPing;
        if (lastPing && Date.now() - lastPing < pingInterval) {
          return;
        }
        const wallet = getWallet(_reconnectConnector);
        try {
          const account = await wallet.getKey(activeChains[0]);
          if (!account) {
            throw new Error("No account found");
          }
          useGrazSessionStore.setState({
            lastPing: Date.now(),
          });
          logger.debug(LogCategory.EVENT, "Wallet ping successful", { function: "handleFocus" });
        } catch (error) {
          logger.debug(LogCategory.EVENT, "Wallet ping failed, triggering reconnect", {
            function: "handleFocus",
            error: error instanceof Error ? error.message : String(error),
            walletType: _reconnectConnector,
          });
          void reconnect({ onError: _onReconnectFailed });
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [
    _onReconnectFailed,
    activeChains,
    chains,
    isReconnectConnectorReady,
    isSessionActive,
    logger,
    pingInterval,
    _reconnectConnector,
  ]);

  // Auto connect to iframe if possible.
  useEffect(() => {
    if (
      !iframeOptions ||
      iframeOptions.autoConnect === false ||
      !iframeOptions.allowedIframeParentOrigins.length ||
      !chains
    ) {
      return;
    }

    const cosmiframe = new Cosmiframe(iframeOptions.allowedIframeParentOrigins);
    void cosmiframe.isReady().then((ready) => {
      if (ready) {
        logger.info(LogCategory.EVENT, "Auto-connecting to iframe wallet", { function: "autoConnectIframe" });
        return connect({
          chainId: chains.map((c) => c.chainId),
          walletType: WalletType.COSMIFRAME,
        });
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeOptions]);

  useEffect(() => {
    // will reconnect on refresh
    if (_reconnectConnector) {
      if (!isReconnectConnectorReady) return;
      if (isSessionActive && Boolean(activeChains)) {
        logger.info(LogCategory.EVENT, "Reconnection triggered", { function: "reconnectEffect", reason: "session active" });
        void reconnect({
          onError: _onReconnectFailed,
        });
        // only reconnect if session is active and autoReconnect from grazOptions is true
      } else if (!isSessionActive && _reconnect) {
        logger.info(LogCategory.EVENT, "Reconnection triggered", { function: "reconnectEffect", reason: "auto-reconnect enabled" });
        void reconnect({
          onError: _onReconnectFailed,
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReconnectConnectorReady]);

  useEffect(() => {
    if (!_reconnectConnector || !isReconnectConnectorReady) return;

    if (isWalletConnect(_reconnectConnector)) {
      const signClient = wcSignClients.get(_reconnectConnector);
      if (!signClient) return;

      const { activeChainIds } = useGrazSessionStore.getState();
      const { recentChainIds } = useGrazInternalStore.getState();
      const connectedChainIds = activeChainIds || recentChainIds || [];
      const sessions = signClient.session.getAll();
      const activeSession =
        connectedChainIds.length > 0
          ? [...sessions].reverse().find((session) => {
              const scope = resolveSessionScope(session.namespaces);
              return scope && connectedChainIds.some((chainId) => scope.chainIds.includes(chainId));
            })
          : sessions.at(-1);
      const activeSessionTopic = activeSession?.topic;
      const isActiveSessionTopic = (topic: string): boolean => activeSessionTopic === topic;
      const handleSessionEvent = (args: SignClientTypes.EventArguments["session_event"]) => {
        if (!isActiveSessionTopic(args.topic)) return;
        if (args.params.event.name !== "accountsChanged") return;
        void reconnect({ onError: _onReconnectFailed });
      };
      const handleDisconnect = (topic: string, reason: "wallet" | "session-expired") => {
        if (!isActiveSessionTopic(topic)) return;
        void disconnectWithReason(reason);
      };
      const handleSessionDelete = (args: SignClientTypes.EventArguments["session_delete"]) => {
        handleDisconnect(args.topic, "wallet");
      };
      const handleSessionExpire = (args: SignClientTypes.EventArguments["session_expire"]) => {
        handleDisconnect(args.topic, "session-expired");
      };

      signClient.events.on("session_delete", handleSessionDelete);
      signClient.events.on("session_expire", handleSessionExpire);
      signClient.events.on("session_event", handleSessionEvent);

      return () => {
        signClient.events.off("session_delete", handleSessionDelete);
        signClient.events.off("session_expire", handleSessionExpire);
        signClient.events.off("session_event", handleSessionEvent);
      };
    }

    const wallet = getWallet(_reconnectConnector);
    return wallet.subscription?.(() => {
      logger.debug(LogCategory.EVENT, "Account changed", {
        function: "subscription",
        walletType: _reconnectConnector,
      });
      void reconnect({ onError: _onReconnectFailed });
    });

  }, [_onReconnectFailed, _reconnectConnector, isReconnectConnectorReady, logger, wcSignClients]);

  return null;
};

/**
 * Null component to run {@link useGrazEvents} without affecting component tree.
 *
 * **Note: only use this component if not using graz's provider component.**
 */
export const GrazEvents: FC = () => {
  useGrazEvents();
  return null;
};
