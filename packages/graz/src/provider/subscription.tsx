import { useEffect } from "react";

import { reconnect } from "../actions/account";
import { useGrazStore } from "../store";

export function GrazSubscription() {
  // track keplr_keystorechange and reconnect state
  useEffect(() => {
    useGrazStore.setState({
      _supported: typeof window.keplr !== "undefined",
    });

    const { _reconnect } = useGrazStore.getState();
    if (_reconnect) reconnect();

    window.addEventListener("keplr_keystorechange", reconnect);
    return () => {
      window.removeEventListener("keplr_keystorechange", reconnect);
    };
  }, []);

  return null;
}
