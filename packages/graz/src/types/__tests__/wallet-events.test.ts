import { describe, expectTypeOf, it } from "vitest";

import type {
  AccountChangeEvent,
  ActiveChainsChangeEvent,
  DisconnectEvent,
  WalletEventHandlers,
} from "../../index";
import type { Key } from "../wallet";
import { WalletType } from "../wallet";

describe("wallet event public types", () => {
  it("uses multi-chain account and active-chain payloads", () => {
    expectTypeOf<AccountChangeEvent["accounts"]>().toEqualTypeOf<Record<string, Key>>();
    expectTypeOf<AccountChangeEvent["changedChainIds"]>().toEqualTypeOf<string[]>();
    expectTypeOf<ActiveChainsChangeEvent["activeChainIds"]>().toEqualTypeOf<string[]>();
    expectTypeOf<ActiveChainsChangeEvent["previousActiveChainIds"]>().toEqualTypeOf<string[]>();
  });

  it("exposes typed handlers and disconnect reasons", () => {
    const handlers: WalletEventHandlers = {
      onActiveChainsChange: (event) => {
        expectTypeOf(event.activeChainIds).toEqualTypeOf<string[]>();
      },
      onDisconnect: (event) => {
        expectTypeOf(event.reason).toEqualTypeOf<
          "user" | "wallet" | "session-expired" | "reconnect-failed"
        >();
      },
    };
    const event: DisconnectEvent = {
      chainIds: ["cosmoshub-4"],
      reason: "wallet",
      walletType: WalletType.KEPLR,
    };

    expectTypeOf(handlers).toMatchTypeOf<WalletEventHandlers>();
    expectTypeOf(event.walletType).toEqualTypeOf<WalletType>();
  });
});
