import type { FC } from "react";
import { useEffect } from "react";

import { reconnect } from "../actions/account";
import { checkWallet } from "../actions/wallet";
import { getCosmostation } from "../actions/wallet/cosmostation";
import { getKeplr } from "../actions/wallet/keplr";
import { getLeap } from "../actions/wallet/leap";
import { getVectis } from "../actions/wallet/vectis";
import { getWalletConnect } from "../actions/wallet/wallet-connect";
import { RECONNECT_SESSION_KEY } from "../constant";
import { useGrazInternalStore, useGrazSessionStore } from "../store";
import { WalletType } from "../types/wallet";
import { getStation } from "../actions/wallet/station";

/**
 * Graz custom hook to track `keplr_keystorechange`, `leap_keystorechange`, `accountChanged` event and reconnect state
 *
 * **Note: only use this hook if not using graz's provider component.**
 */
export const useGrazEvents = () => {
  const isSessionActive =
    typeof window !== "undefined" && window.sessionStorage.getItem(RECONNECT_SESSION_KEY) === "Active";
  const { _reconnect, _onReconnectFailed, _reconnectConnector } = useGrazInternalStore();
  const { activeChainIds: activeChains, wcSignClients } = useGrazSessionStore();
  const isReconnectConnectorReady = checkWallet(_reconnectConnector || undefined);

  useEffect(() => {
    // will reconnect on refresh
    if (_reconnectConnector) {
      if (!isReconnectConnectorReady) return;
      if (isSessionActive && Boolean(activeChains)) {
        void reconnect({
          onError: _onReconnectFailed,
        });
        // only reconnect if session is active and autoReconnect from grazOptions is true
      } else if (!isSessionActive && _reconnect) {
        void reconnect({
          onError: _onReconnectFailed,
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReconnectConnectorReady]);

  useEffect(() => {
    if (_reconnectConnector) {
      if (!isReconnectConnectorReady) return;
      if (_reconnectConnector === WalletType.COSMOSTATION) {
        getCosmostation().subscription?.(() => {
          void reconnect({
            onError: _onReconnectFailed,
          });
        });
      }
      if (_reconnectConnector === WalletType.KEPLR) {
        getKeplr().subscription?.(() => {
          void reconnect({ onError: _onReconnectFailed });
        });
      }
      if (_reconnectConnector === WalletType.LEAP) {
        getLeap().subscription?.(() => {
          void reconnect({ onError: _onReconnectFailed });
        });
      }
      if (_reconnectConnector === WalletType.VECTIS) {
        getVectis().subscription?.(() => {
          void reconnect({ onError: _onReconnectFailed });
        });
      }
      if (_reconnectConnector === WalletType.WALLETCONNECT) {
        if (wcSignClients.has(WalletType.WALLETCONNECT)) {
          getWalletConnect().subscription?.(() => {
            void reconnect({ onError: _onReconnectFailed });
          });
        }
      }
      if (_reconnectConnector === WalletType.STATION) {
        getStation().subscription?.(() => {
          void reconnect({ onError: _onReconnectFailed });
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_reconnectConnector, wcSignClients, isReconnectConnectorReady]);

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
