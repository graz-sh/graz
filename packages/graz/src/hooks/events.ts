import { useEffect, useRef } from "react";

import { subscribeWalletEvents } from "../actions/events";
import type { WalletEventHandlers } from "../types/events";

/**
 * Subscribe to committed wallet state changes for the lifetime of a React
 * component.
 */
export const useWalletEvents = (handlers: WalletEventHandlers = {}): void => {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    return subscribeWalletEvents({
      onAccountChange: (event) => handlersRef.current.onAccountChange?.(event),
      onActiveChainsChange: (event) => handlersRef.current.onActiveChainsChange?.(event),
      onDisconnect: (event) => handlersRef.current.onDisconnect?.(event),
    });
  }, []);
};
