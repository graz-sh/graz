import type { FC } from "react";
import { useEffect } from "react";

import { reconnect } from "../actions/account";
import { RECONNECT_SESSION_KEY } from "../constant";
import { useGrazStore } from "../store";
import { WalletType } from "../types/wallet";

/**
 * Graz custom hook to track `keplr_keystorechange` event and reconnect state
 *
 * **Note: only use this hook if not using graz's provider component.**
 */
export const useGrazEvents = () => {
  const isSessionActive =
    typeof window !== "undefined" && window.sessionStorage.getItem(RECONNECT_SESSION_KEY) === "Active";
  const { activeChain, _reconnect, _onReconnectFailed, _reconnectConnector } = useGrazStore();

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
      window.addEventListener(
        _reconnectConnector === WalletType.KEPLR ? "keplr_keystorechange" : "leap_keystorechange",
        () =>
          void reconnect({
            onError: _onReconnectFailed,
          }),
      );
      return () => {
        window.removeEventListener(
          _reconnectConnector === WalletType.KEPLR ? "keplr_keystorechange" : "leap_keystorechange",
          () =>
            void reconnect({
              onError: _onReconnectFailed,
            }),
        );
      };
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
