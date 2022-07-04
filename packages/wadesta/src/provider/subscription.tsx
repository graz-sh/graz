import { useEffect } from "react";

import { connect } from "../actions/account";
import { useWadestaStore } from "../store";

export function WadestaSubscription() {
  // track keplr_keystorechange
  useEffect(() => {
    function listen() {
      const { activeChain } = useWadestaStore.getState();
      if (activeChain) void connect(activeChain);
    }
    window.addEventListener("focus", listen);
    window.addEventListener("keplr_keystorechange", listen);
    return () => {
      window.removeEventListener("focus", listen);
      window.removeEventListener("keplr_keystorechange", listen);
    };
  }, []);

  // track reconnect state
  useEffect(() => {
    const { activeChain, _reconnect } = useWadestaStore.getState();
    if (activeChain && _reconnect) void connect(activeChain);
  }, []);

  return null;
}
