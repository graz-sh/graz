import type { Keplr } from "@keplr-wallet/types";

import { useGrazStore } from "./store";

export function getKeplr(): Keplr {
  if (typeof window.keplr !== "undefined") return window.keplr;
  useGrazStore.getState()._notFoundFn();
  throw new Error("Keplr is not defined");
}

export function registerKeplrNotFound(fn: () => void): void {
  useGrazStore.setState({ _notFoundFn: fn });
}

export function unregisterKeplrNotFound(): void {
  useGrazStore.setState({ _notFoundFn: () => null });
}
