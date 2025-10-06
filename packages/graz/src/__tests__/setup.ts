import { beforeEach, vi } from "vitest";

// Enable store mocking
vi.mock("../store");

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock window object for browser APIs
global.window = global.window || ({} as any);
