import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { emitWalletEvent } from "../../actions/events";
import { renderComponent, renderHook } from "../../__tests__/react";
import { WalletType } from "../../types/wallet";
import { useWalletEvents } from "../events";

const emitDisconnect = () => {
  emitWalletEvent({
    payload: {
      chainIds: ["cosmoshub-4"],
      reason: "wallet",
      walletType: WalletType.KEPLR,
    },
    type: "disconnect",
  });
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useWalletEvents", () => {
  it("uses the latest callbacks without duplicating subscriptions", () => {
    const first = vi.fn();
    const second = vi.fn();
    let onDisconnect = first;
    const rendered = renderHook(() => useWalletEvents({ onDisconnect }));

    onDisconnect = second;
    rendered.rerender();
    emitDisconnect();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    rendered.unmount();
  });

  it("automatically unsubscribes on unmount", () => {
    const onDisconnect = vi.fn();
    const rendered = renderHook(() => useWalletEvents({ onDisconnect }));

    rendered.unmount();
    emitDisconnect();

    expect(onDisconnect).not.toHaveBeenCalled();
  });

  it("keeps one live subscription in Strict Mode", () => {
    const onDisconnect = vi.fn();
    const Host = () => {
      useWalletEvents({ onDisconnect });
      return null;
    };
    const rendered = renderComponent(
      <StrictMode>
        <Host />
      </StrictMode>,
    );

    emitDisconnect();

    expect(onDisconnect).toHaveBeenCalledTimes(1);
    rendered.unmount();
  });

  it("accepts omitted handlers", () => {
    const rendered = renderHook(() => useWalletEvents());

    expect(() => emitDisconnect()).not.toThrow();
    rendered.unmount();
  });
});
