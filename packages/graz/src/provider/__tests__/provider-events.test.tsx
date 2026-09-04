import { act } from "react";
import { toBech32 } from "@cosmjs/encoding";
import type { ISignClient } from "@walletconnect/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { subscribeWalletEvents } from "../../actions/events";
import { makeChainInfo } from "../../__tests__/fixtures";
import { flushReact, renderComponent } from "../../__tests__/react";
import { RECONNECT_SESSION_KEY } from "../../constant";
import { useGrazInternalStore, useGrazSessionStore } from "../../store";
import type { Key } from "../../types/wallet";
import { WalletType } from "../../types/wallet";
import { ClientOnly } from "../client-only";
import { GrazEvents } from "../events";
import { GrazProvider } from "../index";

const makeAddress = (value: number) => new Uint8Array(20).fill(value);
const makeBech32Address = (value: number) => toBech32("cosmos", makeAddress(value));

const makeKey = (chainId: string): Key => ({
  address: new Uint8Array([1, 2, 3]),
  algo: "secp256k1",
  bech32Address: `${chainId}1address`,
  isKeystone: false,
  isNanoLedger: false,
  name: `${chainId} account`,
  pubKey: new Uint8Array([4, 5, 6]),
});

const makeWallet = (account: Key) => ({
  enable: vi.fn().mockResolvedValue(undefined),
  experimentalSuggestChain: vi.fn().mockResolvedValue(undefined),
  getKey: vi.fn(async () => account),
  getOfflineSigner: vi.fn(),
  getOfflineSignerAuto: vi.fn(),
  getOfflineSignerOnlyAmino: vi.fn(),
  signAmino: vi.fn(),
  signDirect: vi.fn(),
});

const setWindowValue = (key: string, value: unknown) => {
  Object.defineProperty(window, key, {
    configurable: true,
    value,
    writable: true,
  });
};

describe("provider components and events", () => {
  const eventCleanups: Array<() => void> = [];

  beforeEach(() => {
    Reflect.deleteProperty(window, "cactuslink_cosmos");
    Reflect.deleteProperty(window, "keplr");
  });

  afterEach(() => {
    eventCleanups.splice(0).forEach((cleanup) => cleanup());
    vi.restoreAllMocks();
  });

  const subscribe = (handlers: Parameters<typeof subscribeWalletEvents>[0]) => {
    const cleanup = subscribeWalletEvents(handlers);
    eventCleanups.push(cleanup);
    return cleanup;
  };

  it("hydrates client-only children and configures GrazProvider options", async () => {
    const chain = makeChainInfo();
    const rendered = renderComponent(
      <GrazProvider
        grazOptions={{
          autoReconnect: false,
          chains: [chain],
          defaultWallet: WalletType.COSMOSTATION,
        }}
      >
        <span data-testid="ready">ready</span>
      </GrazProvider>,
    );

    await flushReact();

    expect(rendered.container.textContent).toBe("ready");
    expect(useGrazInternalStore.getState()).toMatchObject({
      _reconnect: false,
      chains: [chain],
      walletType: WalletType.COSMOSTATION,
    });
    rendered.unmount();
  });

  it("keeps ClientOnly empty until mounted", async () => {
    const rendered = renderComponent(
      <ClientOnly>
        <span>client</span>
      </ClientOnly>,
    );

    await flushReact();

    expect(rendered.container.textContent).toBe("client");
    rendered.unmount();
  });

  it("pings the reconnect wallet on focus and records lastPing", async () => {
    const chain = makeChainInfo();
    const account = makeKey(chain.chainId);
    const wallet = makeWallet(account);
    setWindowValue("keplr", wallet);
    window.sessionStorage.setItem(RECONNECT_SESSION_KEY, "Active");
    useGrazInternalStore.setState({
      _reconnectConnector: WalletType.KEPLR,
      chains: [chain],
      pingInterval: 0,
      recentChainIds: null,
      walletType: WalletType.KEPLR,
    });
    useGrazSessionStore.setState({
      activeChainIds: [chain.chainId],
      status: "connected",
    });

    const rendered = renderComponent(<GrazEvents />);
    await flushReact();
    wallet.getKey.mockClear();

    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      await Promise.resolve();
    });

    expect(wallet.getKey).toHaveBeenCalledWith(chain.chainId);
    expect(useGrazSessionStore.getState().lastPing).toEqual(expect.any(Number));
    rendered.unmount();
  });

  it("skips focus pings within the configured ping interval", async () => {
    const chain = makeChainInfo();
    const account = makeKey(chain.chainId);
    const wallet = makeWallet(account);
    setWindowValue("keplr", wallet);
    window.sessionStorage.setItem(RECONNECT_SESSION_KEY, "Active");
    useGrazInternalStore.setState({
      _reconnectConnector: WalletType.KEPLR,
      chains: [chain],
      pingInterval: 60_000,
      recentChainIds: [chain.chainId],
      walletType: WalletType.KEPLR,
    });
    useGrazSessionStore.setState({
      activeChainIds: [chain.chainId],
      lastPing: Date.now(),
      status: "connected",
    });

    const rendered = renderComponent(<GrazEvents />);
    await flushReact();
    wallet.getKey.mockClear();

    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      await Promise.resolve();
    });

    expect(wallet.getKey).not.toHaveBeenCalled();
    rendered.unmount();
  });

  it("falls back to reconnect when focus ping fails", async () => {
    const chain = makeChainInfo();
    const account = makeKey(chain.chainId);
    const wallet = makeWallet(account);
    wallet.getKey.mockRejectedValueOnce(new Error("stale wallet session"));
    setWindowValue("keplr", wallet);
    window.sessionStorage.setItem(RECONNECT_SESSION_KEY, "Active");
    useGrazInternalStore.setState({
      _reconnect: true,
      _reconnectConnector: WalletType.KEPLR,
      chains: [chain],
      pingInterval: 0,
      recentChainIds: [chain.chainId],
      walletType: WalletType.KEPLR,
    });
    useGrazSessionStore.setState({
      activeChainIds: [chain.chainId],
      status: "connected",
    });

    const rendered = renderComponent(<GrazEvents />);

    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      await Promise.resolve();
    });

    await vi.waitFor(() => {
      expect(wallet.enable).toHaveBeenCalledWith([chain.chainId]);
    });
    expect(useGrazSessionStore.getState()).toMatchObject({
      accounts: { [chain.chainId]: account },
      status: "connected",
    });
    rendered.unmount();
  });

  it("subscribes to wallet account changes and reconnects", async () => {
    const chain = makeChainInfo();
    const account = makeKey(chain.chainId);
    const wallet = makeWallet(account);
    setWindowValue("keplr", wallet);
    useGrazInternalStore.setState({
      _reconnect: false,
      _reconnectConnector: WalletType.KEPLR,
      chains: [chain],
      recentChainIds: [chain.chainId],
      walletType: WalletType.KEPLR,
    });

    const rendered = renderComponent(<GrazEvents />);

    await act(async () => {
      window.dispatchEvent(new Event("keplr_keystorechange"));
      await Promise.resolve();
    });

    await vi.waitFor(() => {
      expect(wallet.enable).toHaveBeenCalledWith([chain.chainId]);
    });
    expect(useGrazSessionStore.getState()).toMatchObject({
      accounts: { [chain.chainId]: account },
      activeChainIds: [chain.chainId],
      status: "connected",
    });
    rendered.unmount();
  });

  it("emits an account change without a transient disconnect", async () => {
    const chain = makeChainInfo();
    const previousAccount = makeKey(chain.chainId);
    const account = {
      ...previousAccount,
      bech32Address: `${chain.chainId}1changed`,
    };
    const wallet = makeWallet(account);
    const onAccountChange = vi.fn();
    const onDisconnect = vi.fn();
    setWindowValue("keplr", wallet);
    useGrazInternalStore.setState({
      _reconnect: false,
      _reconnectConnector: WalletType.KEPLR,
      chains: [chain],
      recentChainIds: [chain.chainId],
      walletType: WalletType.KEPLR,
    });
    useGrazSessionStore.setState({
      accounts: { [chain.chainId]: previousAccount },
      activeChainIds: [chain.chainId],
      status: "connected",
    });
    subscribe({ onAccountChange, onDisconnect });

    const rendered = renderComponent(<GrazEvents />);

    await act(async () => {
      window.dispatchEvent(new Event("keplr_keystorechange"));
      await Promise.resolve();
    });

    await vi.waitFor(() => {
      expect(onAccountChange).toHaveBeenCalledWith(
        expect.objectContaining({
          changedChainIds: [chain.chainId],
        }),
      );
    });
    expect(onDisconnect).not.toHaveBeenCalled();
    expect(useGrazSessionStore.getState()).toMatchObject({
      accounts: { [chain.chainId]: account },
      activeChainIds: [chain.chainId],
      status: "connected",
    });
    rendered.unmount();
  });

  it.each([
    ["session_delete", "wallet"],
    ["session_expire", "session-expired"],
  ] as const)("handles WalletConnect %s events for a chain-scoped optional session", async (sessionEvent, disconnectReason) => {
    const chain = makeChainInfo();
    const previousAccount = {
      ...makeKey(chain.chainId),
      address: makeAddress(1),
      bech32Address: makeBech32Address(1),
    };
    const listeners = new Map<string, Set<(args?: unknown) => void>>();
    let bech32Address = makeBech32Address(2);
    let activeSessionExpiry = Math.floor(Date.now() / 1000) + 60;
    let includeActiveSession = true;
    const signClient = {
      events: {
        emit: (event: string, args?: unknown) => {
          listeners.get(event)?.forEach((listener) => listener(args));
        },
        off: vi.fn((event: string, listener: (args?: unknown) => void) => {
          listeners.get(event)?.delete(listener);
        }),
        on: vi.fn((event: string, listener: (args?: unknown) => void) => {
          const eventListeners = listeners.get(event) ?? new Set();
          eventListeners.add(listener);
          listeners.set(event, eventListeners);
        }),
      },
      session: {
        getAll: vi.fn(() => [
          {
            expiry: Math.floor(Date.now() / 1000) + 60,
            namespaces: {
              cosmos: {
                accounts: [`cosmos:osmosis-1:${makeBech32Address(4)}`],
                events: ["chainChanged", "accountsChanged"],
                methods: ["cosmos_getAccounts", "cosmos_signAmino", "cosmos_signDirect"],
              },
            },
            requiredNamespaces: {
              cosmos: {
                chains: ["cosmos:osmosis-1"],
              },
            },
            topic: "unrelated-topic",
          },
          {
            expiry: activeSessionExpiry,
            namespaces: {
              [`cosmos:${chain.chainId}`]: {
                accounts: [`cosmos:${chain.chainId}:${bech32Address}`],
                events: ["chainChanged", "accountsChanged"],
                methods: ["cosmos_getAccounts", "cosmos_signAmino", "cosmos_signDirect"],
              },
            },
            requiredNamespaces: {},
            sessionProperties: {
              keys: JSON.stringify([
                {
                  ...previousAccount,
                  address: Array.from(previousAccount.address),
                  bech32Address,
                  chainId: chain.chainId,
                  pubKey: Buffer.from(previousAccount.pubKey).toString("base64"),
                },
              ]),
            },
            topic: "topic-1",
          },
        ].filter((session) => includeActiveSession || session.topic !== "topic-1")),
      },
    };
    const wcSignClients = new Map<WalletType, ISignClient>([
      [WalletType.WALLETCONNECT, signClient as unknown as ISignClient],
    ]);
    const onAccountChange = vi.fn();
    const onDisconnect = vi.fn();
    useGrazInternalStore.setState({
      _reconnect: false,
      _reconnectConnector: WalletType.WALLETCONNECT,
      chains: [chain],
      recentChainIds: [chain.chainId],
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
      walletType: WalletType.KEPLR,
    });
    useGrazSessionStore.setState({
      accounts: { [chain.chainId]: previousAccount },
      activeChainIds: [chain.chainId],
      status: "connected",
      wcSignClients,
    });
    subscribe({ onAccountChange, onDisconnect });

    const rendered = renderComponent(<GrazEvents />);
    await flushReact();

    await act(async () => {
      signClient.events.emit("session_event", {
        id: 1,
        params: {
          chainId: `cosmos:${chain.chainId}`,
          event: {
            data: [bech32Address],
            name: "accountsChanged",
          },
        },
        topic: "unrelated-topic",
      });
      await Promise.resolve();
    });
    expect(onAccountChange).not.toHaveBeenCalled();

    await act(async () => {
      signClient.events.emit("session_event", {
        id: 2,
        params: {
          chainId: `cosmos:${chain.chainId}`,
          event: {
            data: [bech32Address],
            name: "accountsChanged",
          },
        },
        topic: "topic-1",
      });
      await Promise.resolve();
    });
    await vi.waitFor(() => {
      expect(onAccountChange).toHaveBeenCalledWith(
        expect.objectContaining({
          changedChainIds: [chain.chainId],
        }),
      );
    });
    expect(onDisconnect).not.toHaveBeenCalled();
    expect(useGrazInternalStore.getState().walletType).toBe(WalletType.WALLETCONNECT);
    expect(window.sessionStorage.getItem(RECONNECT_SESSION_KEY)).toBe("Active");

    bech32Address = makeBech32Address(3);
    await act(async () => {
      signClient.events.emit("session_event", {
        id: 3,
        params: {
          chainId: `cosmos:${chain.chainId}`,
          event: {
            data: chain.chainId,
            name: "chainChanged",
          },
        },
        topic: "topic-1",
      });
      await Promise.resolve();
    });
    expect(onAccountChange).toHaveBeenCalledTimes(1);

    await act(async () => {
      signClient.events.emit(
        sessionEvent,
        sessionEvent === "session_delete"
          ? { id: 4, topic: "unrelated-topic" }
          : { topic: "unrelated-topic" },
      );
      await Promise.resolve();
    });
    expect(onDisconnect).not.toHaveBeenCalled();

    if (sessionEvent === "session_expire") activeSessionExpiry = Math.floor(Date.now() / 1000) - 1;
    includeActiveSession = false;
    await act(async () => {
      signClient.events.emit(
        sessionEvent,
        sessionEvent === "session_delete" ? { id: 5, topic: "topic-1" } : { topic: "topic-1" },
      );
      await Promise.resolve();
    });
    expect(onDisconnect).toHaveBeenCalledWith({
      chainIds: [chain.chainId],
      reason: disconnectReason,
      walletType: WalletType.WALLETCONNECT,
    });
    expect(useGrazSessionStore.getState()).toMatchObject({
      accounts: null,
      activeChainIds: null,
      status: "disconnected",
    });
    expect(useGrazSessionStore.getState().wcSignClients.get(WalletType.WALLETCONNECT)).toBe(signClient);
    rendered.unmount();
    expect(signClient.events.off).toHaveBeenCalledWith("session_event", expect.any(Function));
  });

  it("removes the wallet account-change listener on unmount", async () => {
    const chain = makeChainInfo();
    const account = makeKey(chain.chainId);
    const wallet = makeWallet(account);
    const addEventListener = vi.spyOn(window, "addEventListener");
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    setWindowValue("keplr", wallet);
    useGrazInternalStore.setState({
      _reconnect: false,
      _reconnectConnector: WalletType.KEPLR,
      chains: [chain],
      recentChainIds: [chain.chainId],
      walletType: WalletType.KEPLR,
    });

    const rendered = renderComponent(<GrazEvents />);
    await flushReact();
    const subscriptions = addEventListener.mock.calls.filter(([event]) => event === "keplr_keystorechange");

    expect(subscriptions.length).toBeGreaterThan(0);
    rendered.unmount();

    expect(
      subscriptions.every(([, listener]) =>
        removeEventListener.mock.calls.some(
          ([event, removedListener]) => event === "keplr_keystorechange" && removedListener === listener,
        ),
      ),
    ).toBe(true);
    wallet.enable.mockClear();

    await act(async () => {
      window.dispatchEvent(new Event("keplr_keystorechange"));
      await Promise.resolve();
    });

    expect(wallet.enable).not.toHaveBeenCalled();
  });

  it("replaces the wallet listener when the connector changes", async () => {
    const chain = makeChainInfo();
    const account = makeKey(chain.chainId);
    const addEventListener = vi.spyOn(window, "addEventListener");
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    setWindowValue("keplr", makeWallet(account));
    setWindowValue("cactuslink_cosmos", makeWallet(account));
    useGrazInternalStore.setState({
      _reconnect: false,
      _reconnectConnector: WalletType.KEPLR,
      chains: [chain],
      recentChainIds: [chain.chainId],
      walletType: WalletType.KEPLR,
    });

    const rendered = renderComponent(<GrazEvents />);
    await flushReact();
    const keplrSubscriptions = addEventListener.mock.calls.filter(
      ([event]) => event === "keplr_keystorechange",
    );

    await act(async () => {
      useGrazInternalStore.setState({
        _reconnectConnector: WalletType.CACTUSCOSMOS,
        walletType: WalletType.CACTUSCOSMOS,
      });
      await Promise.resolve();
    });

    expect(
      keplrSubscriptions.every(([, listener]) =>
        removeEventListener.mock.calls.some(
          ([event, removedListener]) => event === "keplr_keystorechange" && removedListener === listener,
        ),
      ),
    ).toBe(true);
    expect(addEventListener).toHaveBeenCalledWith("accountsChanged", expect.any(Function));

    rendered.unmount();
    expect(removeEventListener).toHaveBeenCalledWith("accountsChanged", expect.any(Function));
  });
});
