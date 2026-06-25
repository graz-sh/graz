import { describe, expect, it } from "vitest";

import { makeChainInfo } from "../../__tests__/fixtures";
import {
  GRAZ_INTERNAL_STORAGE_KEY,
  GRAZ_SESSION_STORAGE_KEY,
  useGrazInternalStore,
  useGrazSessionStore,
} from "../../store";
import { LogLevel } from "../../types/logger";
import { WalletType } from "../../types/wallet";
import { configureGraz } from "../configure";

describe("configureGraz", () => {
  it("configures chains, wallet defaults, reconnect, concurrency, and logger settings", () => {
    const chain = makeChainInfo();

    const result = configureGraz({
      autoReconnect: false,
      chains: [chain],
      defaultWallet: WalletType.COSMOSTATION,
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
      walletType: WalletType.COSMOSTATION,
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

  it("prefixes internal and session storage keys before rehydrating persisted state", () => {
    const provider = makeChainInfo("cosmoshub-4");
    const persisted = makeChainInfo("osmosis-1");

    window.localStorage.setItem(
      `playground-${GRAZ_INTERNAL_STORAGE_KEY}`,
      JSON.stringify({
        state: {
          chains: [persisted],
          recentChainIds: [persisted.chainId],
          walletType: WalletType.COSMOSTATION,
          _reconnect: true,
          _reconnectConnector: WalletType.COSMOSTATION,
        },
        version: 3,
      }),
    );
    window.sessionStorage.setItem(
      `playground-${GRAZ_SESSION_STORAGE_KEY}`,
      JSON.stringify({
        state: {
          accounts: {
            [persisted.chainId]: {
              algo: "secp256k1",
              address: "osmo1address",
              bech32Address: "osmo1address",
              isNanoLedger: false,
              name: "Osmosis",
              pubKey: new Uint8Array(),
            },
          },
          activeChainIds: [persisted.chainId],
          lastPing: 123,
          status: "connected",
        },
        version: 2,
      }),
    );

    configureGraz({
      chains: [provider],
      prefixStorageKey: "playground",
    });

    expect(useGrazInternalStore.getState()).toMatchObject({
      chains: [provider, persisted],
      recentChainIds: [persisted.chainId],
      walletType: WalletType.COSMOSTATION,
      _reconnect: true,
      _reconnectConnector: WalletType.COSMOSTATION,
    });
    expect(useGrazSessionStore.getState()).toMatchObject({
      activeChainIds: [persisted.chainId],
      lastPing: 123,
      status: "connected",
    });
  });

  it("uses default storage keys when no prefix is configured", () => {
    const chain = makeChainInfo();

    window.localStorage.setItem(
      `playground-${GRAZ_INTERNAL_STORAGE_KEY}`,
      JSON.stringify({
        state: {
          chains: [makeChainInfo("osmosis-1")],
          recentChainIds: ["osmosis-1"],
          walletType: WalletType.COSMOSTATION,
          _reconnect: true,
          _reconnectConnector: WalletType.COSMOSTATION,
        },
        version: 3,
      }),
    );

    configureGraz({ chains: [chain] });

    expect(useGrazInternalStore.getState()).toMatchObject({
      chains: [chain],
      recentChainIds: null,
      walletType: WalletType.KEPLR,
      _reconnect: true,
      _reconnectConnector: null,
    });
  });
});
