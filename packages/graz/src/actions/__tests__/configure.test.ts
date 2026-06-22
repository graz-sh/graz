import { describe, expect, it } from "vitest";

import { makeChainInfo } from "../../__tests__/fixtures";
import { useGrazInternalStore } from "../../store";
import { LogLevel } from "../../types/logger";
import { WalletType } from "../../types/wallet";
import { configureGraz } from "../configure";

describe("configureGraz", () => {
  it("configures chains, wallet defaults, reconnect, concurrency, and logger settings", () => {
    const chain = makeChainInfo();

    const result = configureGraz({
      autoReconnect: false,
      chains: [chain],
      defaultWallet: WalletType.LEAP,
      logger: {
        enabled: true,
        level: LogLevel.DEBUG,
        categories: ["WALLET"],
      },
      multiChainFetchConcurrency: 7,
      pingInteval: 1234,
    });

    expect(result.chains).toEqual([chain]);
    expect(useGrazInternalStore.getState()).toMatchObject({
      chains: [chain],
      walletType: WalletType.LEAP,
      multiChainFetchConcurrency: 7,
      pingInterval: 1234,
      _reconnect: false,
      loggerConfig: {
        enabled: true,
        level: LogLevel.DEBUG,
        categories: ["WALLET"],
      },
    });
  });

  it("merges provider chains over persisted chains without duplicating chain ids", () => {
    const persisted = makeChainInfo("osmosis-1");
    const provider = makeChainInfo("cosmoshub-4");
    const providerOverride = { ...persisted, chainName: "Osmosis Provider" };
    useGrazInternalStore.setState({ chains: [persisted] });

    configureGraz({
      chains: [provider, providerOverride],
    });

    expect(useGrazInternalStore.getState().chains).toEqual([provider, providerOverride]);
  });
});
