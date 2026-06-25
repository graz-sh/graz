import { beforeEach, vi } from "vitest";

import {
  GRAZ_INTERNAL_STORAGE_KEY,
  GRAZ_SESSION_STORAGE_KEY,
  grazInternalDefaultValues,
  grazSessionDefaultValues,
  useGrazInternalStore,
  useGrazSessionStore,
} from "../store";

Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
  configurable: true,
  value: true,
});

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
}

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  useGrazInternalStore.persist.setOptions({ name: GRAZ_INTERNAL_STORAGE_KEY });
  useGrazSessionStore.persist.setOptions({ name: GRAZ_SESSION_STORAGE_KEY });
  window.localStorage.clear();
  window.sessionStorage.clear();
  useGrazInternalStore.setState({ ...grazInternalDefaultValues }, true);
  useGrazSessionStore.setState(
    {
      ...grazSessionDefaultValues,
      wcSignClients: new Map(),
    },
    true,
  );
});

// Mock window object for browser APIs
global.window = global.window || ({} as any);
