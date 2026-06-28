import { LogCategory } from "../types/logger";
import type { WalletEvent, WalletEventHandlers } from "../types/events";
import { getLogger } from "../utils/logger";

interface WalletEventSubscription {
  handlers: WalletEventHandlers;
}

const subscribers = new Set<WalletEventSubscription>();

const reportSubscriberFailure = (error: unknown, eventType: WalletEvent["type"]): void => {
  getLogger().error(LogCategory.EVENT, "Wallet event subscriber failed", {
    error: error instanceof Error ? error.message : String(error),
    eventType,
    function: "emitWalletEvent",
  });
};

const invokeHandler = <T>(
  handler: ((payload: T) => void | Promise<void>) | undefined,
  payload: T,
  eventType: WalletEvent["type"],
): void => {
  if (!handler) return;

  try {
    void Promise.resolve(handler(payload)).catch((error: unknown) => {
      reportSubscriberFailure(error, eventType);
    });
  } catch (error) {
    reportSubscriberFailure(error, eventType);
  }
};

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
    if (event.type === "accountChange") {
      invokeHandler(handlers.onAccountChange, event.payload, event.type);
    } else if (event.type === "activeChainsChange") {
      invokeHandler(handlers.onActiveChainsChange, event.payload, event.type);
    } else {
      invokeHandler(handlers.onDisconnect, event.payload, event.type);
    }
  }
};
