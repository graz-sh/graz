import { useGrazStore } from "./store";

export function getKeplr() {
  if (typeof window.keplr !== "undefined") return window.keplr;
  useGrazStore.getState()._notFoundFn();
  throw new Error("Keplr is not defined");
}

export function registerKeplrNotFound(fn: () => void) {
  useGrazStore.setState({ _notFoundFn: fn });
}

export function unregisterKeplrNotFound() {
  useGrazStore.setState({ _notFoundFn: () => null });
}
