import type { FC } from "react";
import { useEffect } from "react";

import { reconnect } from "../actions/account";
import { useGrazStore } from "../store";

/**
 * Graz custom hook to track `keplr_keystorechange` event and reconnect state
 *
 * **Note: only use this hook if not using graz's provider component.**
 */
export const useGrazEvents = () => {
  const isSessionActive =
    typeof window !== "undefined" && window.sessionStorage.getItem("graz-reconnect-session") === "Active";
  const { activeChain, _reconnect, _onReconnectFailed } = useGrazStore.getState();

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
    window.addEventListener(
      "keplr_keystorechange",
      () =>
        void reconnect({
          onError: _onReconnectFailed,
        }),
    );
    return () => {
      window.removeEventListener(
        "keplr_keystorechange",
        () =>
          void reconnect({
            onError: _onReconnectFailed,
          }),
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
