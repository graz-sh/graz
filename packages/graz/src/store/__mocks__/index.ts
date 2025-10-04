import { vi } from "vitest";

// Mock state
const mockInternalState = {
  chains: [],
  multiChainFetchConcurrency: 3,
  chainsConfig: {},
  walletType: undefined,
  recentChainIds: [],
  walletConnect: undefined,
  paraConfig: undefined,
  iframeOptions: undefined,
  pingInterval: 3600000,
  _reconnect: false,
  _reconnectConnector: undefined,
  _notFoundFn: undefined,
  _onReconnectFailed: undefined,
};

const mockSessionState = {
  accounts: {},
  activeChainIds: [],
  status: "disconnected" as const,
  lastPing: undefined,
  wcSignClients: undefined,
  paraConnector: undefined,
};

// Create mock for useGrazInternalStore
// When called as a hook with selector: useGrazInternalStore((x) => x.chains)
// When called with .getState(): useGrazInternalStore.getState()
export const useGrazInternalStore = Object.assign(
  vi.fn((selector?: (state: typeof mockInternalState) => any) => {
    if (selector) {
      return selector(mockInternalState);
    }
    return mockInternalState;
  }),
  {
    getState: vi.fn(() => mockInternalState),
    setState: vi.fn(),
    subscribe: vi.fn(),
    destroy: vi.fn(),
  },
);

// Create mock for useGrazSessionStore
export const useGrazSessionStore = Object.assign(
  vi.fn((selector?: (state: typeof mockSessionState) => any) => {
    if (selector) {
      return selector(mockSessionState);
    }
    return mockSessionState;
  }),
  {
    getState: vi.fn(() => mockSessionState),
    setState: vi.fn(),
    subscribe: vi.fn(),
    destroy: vi.fn(),
  },
);
