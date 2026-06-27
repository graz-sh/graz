import type { KeplrIntereactionOptions } from "@keplr-wallet/types";

import { useGrazInternalStore } from "../../store";
import type { Wallet } from "../../types/wallet";
import { clearSession } from ".";

export const createKeplrLikeWallet = (
  wallet: NonNullable<Window["keplr"]>,
  eventName: string,
  config?: {
    setDefaultOptions?: boolean;
    on?: (event: string, listener: EventListener) => void;
    off?: (event: string, listener: EventListener) => void;
  },
): Wallet => {
  const subscription = (reconnect: () => void) => {
    const listener = () => {
      clearSession();
      reconnect();
    };
    if (config?.on && config?.off) {
      config.on(eventName, listener);
      return () => config.off!(eventName, listener);
    }
    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  };

  const extensions: Record<string, unknown> = { subscription };
  if (config?.setDefaultOptions !== false) {
    extensions.setDefaultOptions = (options: KeplrIntereactionOptions) => {
      wallet.defaultOptions = options;
    };
  }

  return Object.assign(wallet, extensions) as unknown as Wallet;
};

export const throwWalletNotFound = (msg: string): never => {
  useGrazInternalStore.getState()._notFoundFn();
  throw new Error(msg);
};
