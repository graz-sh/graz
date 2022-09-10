import { useEffect } from "react";

import { reconnect } from "../actions/account";
import { useGrazStore } from "../store";

/**
 * Graz custom hook to track `keplr_keystorechange` event and reconnect state
 *
 * **Note: only use this hook if not using graz's provider component.**
 */
export function useGrazEvents() {
  useEffect(() => {
    const { _reconnect } = useGrazStore.getState();
    if (_reconnect) reconnect();

    window.addEventListener("keplr_keystorechange", reconnect);
    return () => {
      window.removeEventListener("keplr_keystorechange", reconnect);
    };
  }, []);

  return null;
}

/**
 * Null component to run {@link useGrazEvents} without affecting component tree.
 *
 * **Note: only use this component if not using graz's provider component.**
 */
export function GrazEvents() {
  useGrazEvents();
  return null;
}
