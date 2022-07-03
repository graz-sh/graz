import { useEffect } from "react";

import { connect } from "../actions/account";
import { useWadestaStore } from ".";

export function WadestaSubscription() {
  useEffect(() => {
    window.addEventListener("keplr_keystorechange", () => void listen());
  }, []);
  return null;
}

async function listen() {
  const { activeChain } = useWadestaStore.getState();
  if (activeChain) {
    await connect(activeChain);
  }
}
