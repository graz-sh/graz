import { useEffect } from "react";

import { reconnect } from "../actions/account";
import { useWadestaStore } from "../store";

export function WadestaSubscription() {
  // track keplr_keystorechange and reconnect state
  useEffect(() => {
    const { _reconnect } = useWadestaStore.getState();
    if (_reconnect) reconnect();

    window.addEventListener("focus", reconnect);
    window.addEventListener("keplr_keystorechange", reconnect);
    return () => {
      window.removeEventListener("focus", reconnect);
      window.removeEventListener("keplr_keystorechange", reconnect);
    };
  }, []);

  return null;
}
