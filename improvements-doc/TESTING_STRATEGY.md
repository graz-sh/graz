# Testing Strategy for Graz

## Overview

This document outlines the testing strategy for the Graz library, including unit tests, integration tests, end-to-end tests, and manual testing procedures.

## Current State

**Test Coverage:** Limited
**Testing Tools:** Vitest (configured but minimal tests)
**Main Testing Method:** Manual testing with example apps

## Goals

1. **Comprehensive Coverage**: > 80% code coverage
2. **Confidence**: Catch bugs before release
3. **Documentation**: Tests serve as usage examples
4. **Fast Feedback**: Tests run in < 30 seconds
5. **Reliable**: No flaky tests

---

## Test Pyramid

```
       /\
      /  \     E2E Tests (5%)
     /____\    Integration Tests (15%)
    /      \   Unit Tests (80%)
   /________\
```

### Unit Tests (80%)

- Test individual functions and utilities
- Mock external dependencies
- Fast execution (< 10 seconds)
- High coverage of edge cases

### Integration Tests (15%)

- Test wallet adapters with mock wallets
- Test hooks with React Testing Library
- Test store interactions
- Medium execution time (10-20 seconds)

### E2E Tests (5%)

- Test full user flows in example apps
- Test with real (testnet) blockchains
- Slow execution (> 1 minute)
- Focus on critical paths

---

## Testing Tools

### Framework: Vitest

- Fast, Vite-based test runner
- Compatible with Jest API
- Built-in TypeScript support
- Coverage reporting

### React Testing: React Testing Library

- Test React hooks and components
- User-centric testing approach
- Avoid implementation details

### E2E Testing: Playwright

- Cross-browser testing
- Reliable and fast
- Screenshot/video recording
- Network mocking

### Mocking: Vitest Mocks

- Mock wallet objects
- Mock blockchain APIs
- Mock browser APIs

---

## Unit Test Strategy

### 1. Actions (`src/actions/`)

Test all action functions with mocked dependencies.

**Example: `connect()` action**

```typescript
// src/actions/__tests__/account.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { connect } from "../account";
import { useGrazInternalStore, useGrazSessionStore } from "../../store";
import * as walletModule from "../wallet";

vi.mock("../wallet");

describe("connect", () => {
  beforeEach(() => {
    // Reset stores
    useGrazInternalStore.setState({ chains: [mockCosmosChain] });
    useGrazSessionStore.setState({ accounts: {}, status: "disconnected" });
  });

  it("should connect to wallet successfully", async () => {
    const mockWallet = {
      enable: vi.fn().mockResolvedValue(undefined),
      getKey: vi.fn().mockResolvedValue(mockAccount),
    };

    vi.spyOn(walletModule, "getWallet").mockReturnValue(mockWallet);
    vi.spyOn(walletModule, "checkWallet").mockResolvedValue(true);

    const result = await connect({
      chainId: "cosmoshub-4",
      walletType: WalletType.KEPLR,
    });

    expect(result.accounts).toHaveProperty("cosmoshub-4");
    expect(mockWallet.enable).toHaveBeenCalledWith(["cosmoshub-4"]);
    expect(useGrazSessionStore.getState().status).toBe("connected");
  });

  it("should throw error when wallet not found", async () => {
    vi.spyOn(walletModule, "checkWallet").mockResolvedValue(false);

    await expect(connect({ chainId: "cosmoshub-4", walletType: WalletType.KEPLR })).rejects.toThrow(
      "Wallet keplr not found",
    );
  });

  it("should handle wallet enable failure", async () => {
    const mockWallet = {
      enable: vi.fn().mockRejectedValue(new Error("User rejected")),
    };

    vi.spyOn(walletModule, "getWallet").mockReturnValue(mockWallet);
    vi.spyOn(walletModule, "checkWallet").mockResolvedValue(true);

    await expect(connect({ chainId: "cosmoshub-4", walletType: WalletType.KEPLR })).rejects.toThrow("User rejected");
  });

  it("should connect to multiple chains", async () => {
    const mockWallet = {
      enable: vi.fn().mockResolvedValue(undefined),
      getKeys: vi.fn().mockResolvedValue([mockAccount1, mockAccount2]),
    };

    vi.spyOn(walletModule, "getWallet").mockReturnValue(mockWallet);
    vi.spyOn(walletModule, "checkWallet").mockResolvedValue(true);

    const result = await connect({
      chainId: ["cosmoshub-4", "osmosis-1"],
      walletType: WalletType.KEPLR,
    });

    expect(Object.keys(result.accounts)).toHaveLength(2);
    expect(mockWallet.enable).toHaveBeenCalledWith(["cosmoshub-4", "osmosis-1"]);
  });
});
```

### 2. Utilities (`src/utils/`)

Test utility functions with various inputs.

**Example: `createMultiChainAsyncFunction()`**

```typescript
// src/utils/__tests__/multi-chain.test.ts
import { describe, it, expect } from "vitest";
import { createMultiChainAsyncFunction } from "../multi-chain";

describe("createMultiChainAsyncFunction", () => {
  const mockChains = [
    { chainId: "cosmoshub-4", chainName: "Cosmos Hub" },
    { chainId: "osmosis-1", chainName: "Osmosis" },
  ];

  it("should return record for single chain", async () => {
    const fn = vi.fn().mockResolvedValue(100);

    const result = await createMultiChainAsyncFunction([mockChains[0]!], fn);

    expect(result).toEqual({ "cosmoshub-4": 100 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should return record for multiple chains", async () => {
    const fn = vi.fn().mockResolvedValueOnce(100).mockResolvedValueOnce(200);

    const result = await createMultiChainAsyncFunction(mockChains, fn);

    expect(result).toEqual({
      "cosmoshub-4": 100,
      "osmosis-1": 200,
    });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should handle errors in individual chains", async () => {
    const fn = vi.fn().mockResolvedValueOnce(100).mockRejectedValueOnce(new Error("Failed"));

    // Note: Actual implementation may throw or return partial results
    await expect(createMultiChainAsyncFunction(mockChains, fn)).rejects.toThrow();
  });

  it("should respect concurrency limit", async () => {
    let concurrent = 0;
    let maxConcurrent = 0;

    const fn = async () => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise((resolve) => setTimeout(resolve, 10));
      concurrent--;
      return 1;
    };

    const manyChains = Array.from({ length: 10 }, (_, i) => ({
      chainId: `chain-${i}`,
      chainName: `Chain ${i}`,
    }));

    await createMultiChainAsyncFunction(manyChains, fn);

    expect(maxConcurrent).toBeLessThanOrEqual(3); // Default concurrency from store
  });
});
```

### 3. Store (`src/store/`)

Test store state management.

```typescript
// src/store/__tests__/store.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useGrazInternalStore, useGrazSessionStore } from "../index";

describe("GrazInternalStore", () => {
  beforeEach(() => {
    useGrazInternalStore.setState(grazInternalDefaultValues);
  });

  it("should update wallet type", () => {
    useGrazInternalStore.setState({ walletType: WalletType.KEPLR });
    expect(useGrazInternalStore.getState().walletType).toBe(WalletType.KEPLR);
  });

  it("should update recent chain IDs", () => {
    useGrazInternalStore.setState({ recentChainIds: ["cosmoshub-4"] });
    expect(useGrazInternalStore.getState().recentChainIds).toEqual(["cosmoshub-4"]);
  });

  it("should persist to localStorage", () => {
    useGrazInternalStore.setState({ walletType: WalletType.LEAP });

    const stored = JSON.parse(localStorage.getItem("graz-internal") || "{}");
    expect(stored.state.walletType).toBe(WalletType.LEAP);
  });
});

describe("GrazSessionStore", () => {
  beforeEach(() => {
    useGrazSessionStore.setState(grazSessionDefaultValues);
  });

  it("should update connection status", () => {
    useGrazSessionStore.setState({ status: "connected" });
    expect(useGrazSessionStore.getState().status).toBe("connected");
  });

  it("should store accounts by chain ID", () => {
    const accounts = { "cosmoshub-4": mockAccount };
    useGrazSessionStore.setState({ accounts });
    expect(useGrazSessionStore.getState().accounts).toEqual(accounts);
  });

  it("should persist to sessionStorage", () => {
    useGrazSessionStore.setState({ status: "connected" });

    const stored = JSON.parse(sessionStorage.getItem("graz-session") || "{}");
    expect(stored.state.status).toBe("connected");
  });
});
```

---

## Integration Test Strategy

### 1. Hooks with React Testing Library

Test hooks in realistic React environment.

**Example: `useConnect()` hook**

```typescript
// src/hooks/__tests__/account.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConnect } from '../account';
import * as accountActions from '../../actions/account';

vi.mock('../../actions/account');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useConnect', () => {
  it('should connect successfully', async () => {
    vi.spyOn(accountActions, 'connect').mockResolvedValue({
      accounts: { 'cosmoshub-4': mockAccount },
      walletType: WalletType.KEPLR,
      chains: ['cosmoshub-4'],
    });

    const { result } = renderHook(() => useConnect(), {
      wrapper: createWrapper(),
    });

    result.current.connect({
      chainId: 'cosmoshub-4',
      walletType: WalletType.KEPLR,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.accounts).toHaveProperty('cosmoshub-4');
  });

  it('should handle connection error', async () => {
    vi.spyOn(accountActions, 'connect').mockRejectedValue(
      new Error('Connection failed')
    );

    const { result } = renderHook(() => useConnect(), {
      wrapper: createWrapper(),
    });

    result.current.connect({
      chainId: 'cosmoshub-4',
      walletType: WalletType.KEPLR,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Connection failed');
  });

  it('should call onSuccess callback', async () => {
    const onSuccess = vi.fn();
    vi.spyOn(accountActions, 'connect').mockResolvedValue(mockConnectResult);

    const { result } = renderHook(() => useConnect({ onSuccess }), {
      wrapper: createWrapper(),
    });

    result.current.connect({ chainId: 'cosmoshub-4' });

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    });
  });
```

### 2. Wallet Adapters

Test wallet adapters with mock wallet objects.

```typescript
// src/actions/wallet/__tests__/keplr.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { getKeplr } from "../keplr";

describe("getKeplr", () => {
  beforeEach(() => {
    delete window.keplr;
  });

  it("should return Keplr wallet when available", () => {
    window.keplr = {
      enable: vi.fn(),
      getKey: vi.fn(),
      // ... other methods
    };

    const wallet = getKeplr();
    expect(wallet).toBeDefined();
    expect(wallet.enable).toBeDefined();
  });

  it("should throw error when Keplr not available", () => {
    expect(() => getKeplr()).toThrow("window.keplr is not defined");
  });

  it("should add subscription method", () => {
    window.keplr = { enable: vi.fn(), getKey: vi.fn() };

    const wallet = getKeplr();
    expect(wallet.subscription).toBeDefined();
  });

  it("should listen to keystorechange event", () => {
    window.keplr = { enable: vi.fn(), getKey: vi.fn() };

    const wallet = getKeplr();
    const reconnect = vi.fn();
    const unsubscribe = wallet.subscription!(reconnect);

    // Trigger event
    window.dispatchEvent(new Event("keplr_keystorechange"));
    expect(reconnect).toHaveBeenCalled();

    // Cleanup
    unsubscribe();
  });
});
```

---

## E2E Test Strategy

### Setup with Playwright

```typescript
// e2e/tests/connect.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Wallet Connection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("should connect with Keplr", async ({ page }) => {
    // Mock Keplr wallet
    await page.addInitScript(() => {
      window.keplr = {
        enable: async () => {},
        getKey: async () => ({
          name: "Test Wallet",
          algo: "secp256k1",
          pubKey: new Uint8Array(33),
          address: new Uint8Array(20),
          bech32Address: "cosmos1test...",
        }),
        // ... other methods
      };
    });

    // Click connect button
    await page.click('button:has-text("Connect Wallet")');

    // Select Keplr
    await page.click('button:has-text("Keplr")');

    // Wait for connection
    await expect(page.locator("text=cosmos1test...")).toBeVisible();
  });

  test("should send tokens", async ({ page, context }) => {
    // Setup: Connect wallet first
    // ... connection code

    // Navigate to send page
    await page.goto("http://localhost:3000/send-tokens");

    // Fill form
    await page.fill('input[name="recipient"]', "cosmos1recipient...");
    await page.fill('input[name="amount"]', "1");

    // Mock transaction signing
    await page.addInitScript(() => {
      window.keplr.signDirect = async () => ({
        signed: mockSignedTx,
        signature: mockSignature,
      });
    });

    // Click send
    await page.click('button:has-text("Send")');

    // Wait for success
    await expect(page.locator("text=Transaction successful")).toBeVisible();
  });
});
```

---

## Additional Comprehensive Tests

### 3. Multi-Chain Hooks Testing

Test hooks that support multi-chain operations with type inference.

**Example: `useAccount()` with multi-chain**

```typescript
// src/hooks/__tests__/account-multichain.test.tsx
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAccount } from "../account";

describe("useAccount multi-chain", () => {
  it("should return typed multi-chain results", () => {
    const { result } = renderHook(() =>
      useAccount({
        chainId: ["cosmoshub-4", "osmosis-1"] as const,
      }),
    );

    // Type inference should work
    if (result.current.data) {
      const cosmosAccount = result.current.data["cosmoshub-4"];
      const osmosisAccount = result.current.data["osmosis-1"];

      expect(cosmosAccount).toBeDefined();
      expect(osmosisAccount).toBeDefined();
    }
  });

  it("should handle partial failures in multi-chain", async () => {
    // Mock one chain succeeding and one failing
    const { result } = renderHook(() =>
      useAccount({
        chainId: ["cosmoshub-4", "invalid-chain"] as const,
      }),
    );

    // Should handle gracefully
    expect(result.current.data?.["cosmoshub-4"]).toBeDefined();
    expect(result.current.data?.["invalid-chain"]).toBeUndefined();
  });

  it("should refetch all chains on reconnect", async () => {
    const { result, rerender } = renderHook(() => useAccount());

    // Simulate disconnect
    await result.current.reconnect();

    // All chains should be refetched
    rerender();
    expect(result.current.isReconnecting).toBe(true);
  });
});
```

### 4. Signing Client Testing

Test signing client hooks with proper mocking.

**Example: `useStargateSigningClient()`**

```typescript
// src/hooks/__tests__/signingClients.test.tsx
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStargateSigningClient } from "../signingClients";
import { SigningStargateClient } from "@cosmjs/stargate";

describe("useStargateSigningClient", () => {
  it("should create signing client for single chain", async () => {
    const { result } = renderHook(() =>
      useStargateSigningClient({
        chainId: ["cosmoshub-4"] as const,
      }),
    );

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.["cosmoshub-4"]).toBeInstanceOf(SigningStargateClient);
  });

  it("should create signing clients for multiple chains", async () => {
    const { result } = renderHook(() =>
      useStargateSigningClient({
        chainId: ["cosmoshub-4", "osmosis-1"] as const,
      }),
    );

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(Object.keys(result.current.data || {})).toHaveLength(2);
  });

  it("should not create client when disconnected", async () => {
    const { result } = renderHook(() =>
      useStargateSigningClient({
        chainId: ["cosmoshub-4"] as const,
        enabled: false,
      }),
    );

    expect(result.current.data).toBeUndefined();
  });

  it("should use provided options", async () => {
    const gasPrice = { amount: "0.025", denom: "uatom" };
    const { result } = renderHook(() =>
      useStargateSigningClient({
        chainId: ["cosmoshub-4"] as const,
        opts: { gasPrice },
      }),
    );

    await waitFor(() => expect(result.current.data).toBeDefined());
    // Verify client was created with options
  });
});
```

### 5. Balance and Query Hooks Testing

**Example: `useBalance()` and `useBalances()`**

```typescript
// src/hooks/__tests__/balance.test.tsx
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useBalance, useBalances } from "../account";

describe("useBalance", () => {
  it("should fetch balance for specific denom", async () => {
    const { result } = renderHook(() =>
      useBalance({
        chainId: "cosmoshub-4",
        bech32Address: "cosmos1test...",
        denom: "uatom",
      }),
    );

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.denom).toBe("uatom");
    expect(result.current.data?.amount).toBeDefined();
  });

  it("should return undefined for zero balance", async () => {
    const mockClient = {
      getBalance: vi.fn().mockResolvedValue({ amount: "0", denom: "uatom" }),
    };

    const { result } = renderHook(() =>
      useBalance({
        chainId: "cosmoshub-4",
        bech32Address: "cosmos1test...",
        denom: "uatom",
      }),
    );

    await waitFor(() => expect(result.current.data).toBeUndefined());
  });

  it("should not refetch on window focus", async () => {
    const { result } = renderHook(() =>
      useBalance({
        chainId: "cosmoshub-4",
        bech32Address: "cosmos1test...",
        denom: "uatom",
      }),
    );

    const refetchSpy = vi.spyOn(result.current, "refetch");

    // Simulate window focus
    window.dispatchEvent(new Event("focus"));

    expect(refetchSpy).not.toHaveBeenCalled();
  });
});

describe("useBalances", () => {
  it("should fetch all balances for address", async () => {
    const { result } = renderHook(() =>
      useBalances({
        chainId: "cosmoshub-4",
        bech32Address: "cosmos1test...",
      }),
    );

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it("should handle empty balance list", async () => {
    const mockClient = {
      getAllBalances: vi.fn().mockResolvedValue([]),
    };

    const { result } = renderHook(() =>
      useBalances({
        chainId: "cosmoshub-4",
        bech32Address: "cosmos1test...",
      }),
    );

    await waitFor(() => expect(result.current.data).toEqual([]));
  });
});
```

### 6. Transaction Methods Testing

**Example: `useSendTokens()` and `useExecuteContract()`**

```typescript
// src/hooks/__tests__/methods.test.tsx
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSendTokens, useExecuteContract } from "../methods";

describe("useSendTokens", () => {
  it("should send tokens successfully", async () => {
    const mockDeliverTxResponse = {
      code: 0,
      transactionHash: "ABC123",
      gasUsed: BigInt(100000),
      gasWanted: BigInt(120000),
    };

    const { result } = renderHook(() => useSendTokens());

    result.current.mutate({
      chainId: "cosmoshub-4",
      recipientAddress: "cosmos1recipient...",
      amount: [{ amount: "1000", denom: "uatom" }],
      fee: "auto",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.transactionHash).toBe("ABC123");
  });

  it("should handle insufficient funds error", async () => {
    const { result } = renderHook(() => useSendTokens());

    result.current.mutate({
      chainId: "cosmoshub-4",
      recipientAddress: "cosmos1recipient...",
      amount: [{ amount: "999999999999", denom: "uatom" }],
      fee: "auto",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toContain("insufficient funds");
  });

  it("should auto-calculate fees", async () => {
    const { result } = renderHook(() => useSendTokens());

    result.current.mutate({
      chainId: "cosmoshub-4",
      recipientAddress: "cosmos1recipient...",
      amount: [{ amount: "1000", denom: "uatom" }],
      fee: "auto",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Verify fee was auto-calculated
  });
});

describe("useExecuteContract", () => {
  it("should execute contract successfully", async () => {
    const { result } = renderHook(() => useExecuteContract());

    result.current.mutate({
      chainId: "cosmoshub-4",
      contractAddress: "cosmos1contract...",
      msg: { transfer: { recipient: "cosmos1...", amount: "1000" } },
      fee: "auto",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("should handle contract execution error", async () => {
    const { result } = renderHook(() => useExecuteContract());

    result.current.mutate({
      chainId: "cosmoshub-4",
      contractAddress: "cosmos1contract...",
      msg: { invalid_method: {} },
      fee: "auto",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("should send funds with contract execution", async () => {
    const { result } = renderHook(() => useExecuteContract());

    result.current.mutate({
      chainId: "cosmoshub-4",
      contractAddress: "cosmos1contract...",
      msg: { execute: {} },
      fee: "auto",
      funds: [{ amount: "1000", denom: "uatom" }],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

### 7. Chain Management Testing

**Example: `useSuggestChain()` and `useAddChain()`**

```typescript
// src/hooks/__tests__/chains.test.tsx
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSuggestChain, useAddChain } from "../chains";

describe("useSuggestChain", () => {
  it("should suggest chain to wallet", async () => {
    const mockChainInfo = {
      chainId: "custom-1",
      chainName: "Custom Chain",
      rpc: "https://rpc.custom.network",
      rest: "https://api.custom.network",
      // ... other chain info
    };

    const { result } = renderHook(() => useSuggestChain());

    result.current.mutate({ chainInfo: mockChainInfo });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("should handle chain already exists", async () => {
    const existingChainInfo = {
      chainId: "cosmoshub-4",
      // ... chain info
    };

    const { result } = renderHook(() => useSuggestChain());

    result.current.mutate({ chainInfo: existingChainInfo });

    await waitFor(() => {
      // Should either succeed or handle gracefully
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    });
  });
});

describe("useAddChain", () => {
  it("should add chain to provider configuration", async () => {
    const newChain = {
      chainId: "new-chain-1",
      chainName: "New Chain",
      // ... chain info
    };

    const { result } = renderHook(() => useAddChain());

    result.current.mutate({ chainInfo: newChain });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("should validate chain configuration", async () => {
    const invalidChain = {
      chainId: "",
      chainName: "",
    };

    const { result } = renderHook(() => useAddChain());

    result.current.mutate({ chainInfo: invalidChain });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

### 8. Wallet Type Detection Testing

**Example: `useCheckWallet()` and `getAvailableWallets()`**

```typescript
// src/hooks/__tests__/wallet.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCheckWallet } from "../wallet";
import { getAvailableWallets } from "../../actions/wallet";
import { WalletType } from "../../types/wallet";

describe("useCheckWallet", () => {
  beforeEach(() => {
    delete window.keplr;
    delete window.leap;
  });

  it("should detect Keplr wallet", () => {
    window.keplr = { enable: vi.fn(), getKey: vi.fn() };

    const { result } = renderHook(() => useCheckWallet());

    expect(result.current.data?.keplr).toBe(true);
  });

  it("should detect multiple wallets", () => {
    window.keplr = { enable: vi.fn(), getKey: vi.fn() };
    window.leap = { enable: vi.fn(), getKey: vi.fn() };

    const { result } = renderHook(() => useCheckWallet());

    expect(result.current.data?.keplr).toBe(true);
    expect(result.current.data?.leap).toBe(true);
  });

  it("should return false for unavailable wallets", () => {
    const { result } = renderHook(() => useCheckWallet());

    expect(result.current.data?.keplr).toBe(false);
    expect(result.current.data?.leap).toBe(false);
  });
});

describe("getAvailableWallets", () => {
  beforeEach(() => {
    delete window.keplr;
    delete window.leap;
    delete window.cosmostation;
  });

  it("should return list of available wallets", () => {
    window.keplr = { enable: vi.fn(), getKey: vi.fn() };
    window.leap = { enable: vi.fn(), getKey: vi.fn() };

    const available = getAvailableWallets();

    expect(available).toContain(WalletType.KEPLR);
    expect(available).toContain(WalletType.LEAP);
    expect(available).not.toContain(WalletType.COSMOSTATION);
  });

  it("should return empty array when no wallets", () => {
    const available = getAvailableWallets();

    expect(available).toEqual([]);
  });
});
```

### 9. Error Handling and Edge Cases

**Example: Connection failures and retries**

```typescript
// src/actions/__tests__/account-errors.test.ts
import { describe, it, expect, vi } from "vitest";
import { connect, disconnect } from "../account";
import { useGrazSessionStore } from "../../store";

describe("connect error handling", () => {
  it("should restore state on connection failure", async () => {
    const previousState = useGrazSessionStore.getState();

    try {
      await connect({
        chainId: "invalid-chain",
        walletType: WalletType.KEPLR,
      });
    } catch (error) {
      const currentState = useGrazSessionStore.getState();
      // State should be restored or set to disconnected
      expect(currentState.status).toBe("disconnected");
    }
  });

  it("should handle wallet rejection", async () => {
    const mockWallet = {
      enable: vi.fn().mockRejectedValue(new Error("User rejected")),
    };

    await expect(
      connect({
        chainId: "cosmoshub-4",
        walletType: WalletType.KEPLR,
      }),
    ).rejects.toThrow("User rejected");
  });

  it("should handle network errors gracefully", async () => {
    const mockWallet = {
      enable: vi.fn().mockRejectedValue(new Error("Network error")),
    };

    await expect(
      connect({
        chainId: "cosmoshub-4",
        walletType: WalletType.KEPLR,
      }),
    ).rejects.toThrow("Network error");
  });
});

describe("disconnect error handling", () => {
  it("should disconnect even if wallet disable fails", async () => {
    const mockWallet = {
      disable: vi.fn().mockRejectedValue(new Error("Disable failed")),
    };

    await disconnect();

    const state = useGrazSessionStore.getState();
    expect(state.status).toBe("disconnected");
  });
});
```

### 10. Store Persistence Testing

**Example: localStorage and sessionStorage**

```typescript
// src/store/__tests__/persistence.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useGrazInternalStore, useGrazSessionStore } from "../index";

describe("Store Persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("should persist internal store to localStorage", () => {
    useGrazInternalStore.setState({
      walletType: WalletType.KEPLR,
      recentChainIds: ["cosmoshub-4"],
    });

    const stored = JSON.parse(localStorage.getItem("graz-internal") || "{}");
    expect(stored.state.walletType).toBe(WalletType.KEPLR);
    expect(stored.state.recentChainIds).toEqual(["cosmoshub-4"]);
  });

  it("should persist session store to sessionStorage", () => {
    useGrazSessionStore.setState({
      status: "connected",
      activeChainIds: ["cosmoshub-4"],
    });

    const stored = JSON.parse(sessionStorage.getItem("graz-session") || "{}");
    expect(stored.state.status).toBe("connected");
  });

  it("should restore state from localStorage on init", () => {
    localStorage.setItem(
      "graz-internal",
      JSON.stringify({
        state: { walletType: WalletType.LEAP, recentChainIds: ["osmosis-1"] },
        version: 3,
      }),
    );

    // Recreate store to trigger restore
    const state = useGrazInternalStore.getState();
    expect(state.walletType).toBe(WalletType.LEAP);
  });

  it("should handle migration between versions", () => {
    // Store old version
    localStorage.setItem(
      "graz-internal",
      JSON.stringify({
        state: { walletType: WalletType.KEPLR },
        version: 2,
      }),
    );

    // Should migrate to version 3
    const state = useGrazInternalStore.getState();
    expect(state).toBeDefined();
  });
});
```

---

## Test Coverage Goals

### By Module

| Module          | Target Coverage | Priority |
| --------------- | --------------- | -------- |
| Actions         | 90%             | High     |
| Utilities       | 95%             | High     |
| Store           | 85%             | Medium   |
| Hooks           | 80%             | Medium   |
| Provider        | 70%             | Low      |
| Wallet Adapters | 80%             | High     |

### By Type

- **Statements:** > 80%
- **Branches:** > 75%
- **Functions:** > 85%
- **Lines:** > 80%

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install pnpm
        uses: pnpm/action-setup@v2

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80%"
            exit 1
          fi
```

---

## Test Data and Mocks

### Mock Chain Info

```typescript
export const mockCosmosChain: ChainInfo = {
  chainId: "cosmoshub-4",
  chainName: "Cosmos Hub",
  rpc: "https://rpc.cosmos.network",
  rest: "https://api.cosmos.network",
  bip44: { coinType: 118 },
  bech32Config: {
    bech32PrefixAccAddr: "cosmos",
    bech32PrefixAccPub: "cosmospub",
    bech32PrefixValAddr: "cosmosvaloper",
    bech32PrefixValPub: "cosmosvaloperpub",
    bech32PrefixConsAddr: "cosmosvalcons",
    bech32PrefixConsPub: "cosmosvalconspub",
  },
  currencies: [{ coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 }],
  feeCurrencies: [{ coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 }],
  stakeCurrency: { coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 },
};
```

### Mock Account

```typescript
export const mockAccount: Key = {
  name: "Test Wallet",
  algo: "secp256k1",
  pubKey: new Uint8Array(33),
  address: new Uint8Array(20),
  bech32Address: "cosmos1test123...",
};
```

### Mock Wallet

```typescript
export const createMockWallet = (): Wallet => ({
  enable: vi.fn().mockResolvedValue(undefined),
  getKey: vi.fn().mockResolvedValue(mockAccount),
  getOfflineSigner: vi.fn(),
  getOfflineSignerOnlyAmino: vi.fn(),
  getOfflineSignerAuto: vi.fn(),
  signAmino: vi.fn(),
  signDirect: vi.fn(),
  experimentalSuggestChain: vi.fn(),
});
```

---

## Manual Testing

For scenarios that are difficult to automate, maintain a manual testing checklist.

See [MANUAL_TESTING_GUIDE.md](../MANUAL_TESTING_GUIDE.md) for detailed procedures.

---

## Performance Testing

### Load Testing

Test with many chains and operations:

```typescript
test("should handle 20 chains efficiently", async () => {
  const manyChains = Array.from({ length: 20 }, (_, i) => ({
    chainId: `chain-${i}`,
    chainName: `Chain ${i}`,
  }));

  const start = performance.now();
  await createMultiChainAsyncFunction(manyChains, async (chain) => {
    return fetchBalance(chain.chainId);
  });
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(5000); // 5 seconds max
});
```

---

## Related Documents

- [MANUAL_TESTING_GUIDE.md](../MANUAL_TESTING_GUIDE.md) - Manual testing procedures
- [CODE_REVIEW.md](./CODE_REVIEW.md) - Code review guidelines
- [IMPROVEMENT_SUMMARY.md](./IMPROVEMENT_SUMMARY.md) - Overall progress
