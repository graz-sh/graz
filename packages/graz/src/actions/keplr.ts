import { useGrazStore } from "../store";

export function registerKeplrNotFound(fn: () => void) {
  useGrazStore.setState({ _notFoundFn: fn });
}

export function unregisterKeplrNotFound() {
  useGrazStore.setState({ _notFoundFn: () => null });
}
