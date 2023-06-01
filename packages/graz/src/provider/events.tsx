import type { FC } from "react";
import { useEffect } from "react";

import { reconnect } from "../actions/account";
import { getCosmostation, getKeplr, getLeap } from "../actions/wallet";
import { RECONNECT_SESSION_KEY } from "../constant";
import { useGrazInternalStore, useGrazSessionStore } from "../store";
import { WalletType } from "../types/wallet";

/**
 * Graz custom hook to track `keplr_keystorechange`, `leap_keystorechange`, `accountChanged` event and reconnect state
 *
 * **Note: only use this hook if not using graz's provider component.**
 */
export const useGrazEvents = () => {
  const isSessionActive =
    typeof window !== "undefined" && window.sessionStorage.getItem(RECONNECT_SESSION_KEY) === "Active";
  const { _reconnect, _onReconnectFailed, _reconnectConnector } = useGrazInternalStore();
  const { activeChain } = useGrazSessionStore();

  useEffect(() => {
    // will reconnect on refresh
    if (isSessionActive && Boolean(activeChain)) {
      void reconnect({
        onError: _onReconnectFailed,
      });
      // only reconnect if session is active and autoReconnect from grazOptions is true
    } else if (!isSessionActive && _reconnect) {
      void reconnect({
        onError: _onReconnectFailed,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (_reconnectConnector) {
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
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_reconnectConnector]);

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
