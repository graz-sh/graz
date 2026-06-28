import { LogCategory } from "../types/logger";
import type { WalletEvent, WalletEventHandlers } from "../types/events";
import { getLogger } from "../utils/logger";

interface WalletEventSubscription {
  handlers: WalletEventHandlers;
}

const subscribers = new Set<WalletEventSubscription>();

/**
 * Subscribe to committed wallet state changes outside React.
 *
 * @returns An idempotent cleanup function.
 */
export const subscribeWalletEvents = (handlers: WalletEventHandlers): (() => void) => {
  const subscription = { handlers };
  subscribers.add(subscription);
  let subscribed = true;

  return () => {
    if (!subscribed) return;
    subscribed = false;
    subscribers.delete(subscription);
  };
};

/** @internal */
export const emitWalletEvent = (event: WalletEvent): void => {
  for (const { handlers } of [...subscribers]) {
    try {
      if (event.type === "accountChange") {
        handlers.onAccountChange?.(event.payload);
      } else if (event.type === "activeChainsChange") {
        handlers.onActiveChainsChange?.(event.payload);
      } else {
        handlers.onDisconnect?.(event.payload);
      }
    } catch (error) {
      getLogger().error(LogCategory.EVENT, "Wallet event subscriber failed", {
        error: error instanceof Error ? error.message : String(error),
        eventType: event.type,
        function: "emitWalletEvent",
      });
    }
  }
};
