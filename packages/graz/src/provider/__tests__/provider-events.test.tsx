import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeChainInfo } from "../../__tests__/fixtures";
import { flushReact, renderComponent } from "../../__tests__/react";
import { RECONNECT_SESSION_KEY } from "../../constant";
import { useGrazInternalStore, useGrazSessionStore } from "../../store";
import type { Key } from "../../types/wallet";
import { WalletType } from "../../types/wallet";
import { ClientOnly } from "../client-only";
import { GrazEvents } from "../events";
import { GrazProvider } from "../index";

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
  beforeEach(() => {
    Reflect.deleteProperty(window, "keplr");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
});
