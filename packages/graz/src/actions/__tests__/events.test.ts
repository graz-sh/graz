import { afterEach, describe, expect, it, vi } from "vitest";

import type { WalletEventHandlers } from "../../types/events";
import type { Key } from "../../types/wallet";
import { WalletType } from "../../types/wallet";
import { getLogger } from "../../utils/logger";
import { emitWalletEvent, subscribeWalletEvents } from "../events";

const makeKey = (chainId: string): Key => ({
  address: new Uint8Array([1, 2, 3]),
  algo: "secp256k1",
  bech32Address: `${chainId}1address`,
  isKeystone: false,
  isNanoLedger: false,
  name: `${chainId} account`,
  pubKey: new Uint8Array([4, 5, 6]),
});

const cleanups: Array<() => void> = [];

const subscribe = (handlers: WalletEventHandlers) => {
  const cleanup = subscribeWalletEvents(handlers);
  cleanups.push(cleanup);
  return cleanup;
};

afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
});

describe("wallet event subscriptions", () => {
  it("delivers semantic events to every subscriber", () => {
    const chainId = "cosmoshub-4";
    const account = makeKey(chainId);
    const first = vi.fn();
    const second = vi.fn();
    subscribe({ onAccountChange: first });
    subscribe({ onAccountChange: second });

    emitWalletEvent({
      payload: {
        accounts: { [chainId]: account },
        changedChainIds: [chainId],
        previousAccounts: {
          [chainId]: { ...account, bech32Address: `${chainId}1previous` },
        },
        walletType: WalletType.KEPLR,
      },
      type: "accountChange",
    });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledWith(
      expect.objectContaining({
        accounts: { [chainId]: account },
        changedChainIds: [chainId],
      }),
    );
  });

  it("returns an idempotent unsubscribe function", () => {
    const onDisconnect = vi.fn();
    const unsubscribe = subscribe({ onDisconnect });

    unsubscribe();
    unsubscribe();
    emitWalletEvent({
      payload: {
        chainIds: ["cosmoshub-4"],
        reason: "user",
        walletType: WalletType.KEPLR,
      },
      type: "disconnect",
    });

    expect(onDisconnect).not.toHaveBeenCalled();
  });

  it("keeps separate subscriptions for the same handlers object", () => {
    const onDisconnect = vi.fn();
    const handlers = { onDisconnect };
    const firstUnsubscribe = subscribe(handlers);
    subscribe(handlers);

    firstUnsubscribe();
    emitWalletEvent({
      payload: {
        chainIds: ["cosmoshub-4"],
        reason: "user",
        walletType: WalletType.KEPLR,
      },
      type: "disconnect",
    });

    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it("isolates subscriber failures", () => {
    const failing = vi.fn(() => {
      throw new Error("consumer failed");
    });
    const succeeding = vi.fn();
    subscribe({ onDisconnect: failing });
    subscribe({ onDisconnect: succeeding });

    expect(() => {
      emitWalletEvent({
        payload: {
          chainIds: ["cosmoshub-4"],
          reason: "wallet",
          walletType: WalletType.KEPLR,
        },
        type: "disconnect",
      });
    }).not.toThrow();
    expect(failing).toHaveBeenCalledTimes(1);
    expect(succeeding).toHaveBeenCalledTimes(1);
  });

  it("logs rejected async subscriber callbacks without blocking other subscribers", async () => {
    const error = vi.spyOn(getLogger(), "error");
    const failing = vi.fn(async () => {
      throw new Error("async consumer failed");
    });
    const succeeding = vi.fn();
    subscribe({ onDisconnect: failing });
    subscribe({ onDisconnect: succeeding });

    emitWalletEvent({
      payload: {
        chainIds: ["cosmoshub-4"],
        reason: "wallet",
        walletType: WalletType.KEPLR,
      },
      type: "disconnect",
    });

    expect(succeeding).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => {
      expect(error).toHaveBeenCalledWith(
        expect.anything(),
        "Wallet event subscriber failed",
        expect.objectContaining({
          error: "async consumer failed",
          eventType: "disconnect",
        }),
      );
    });
  });
});
