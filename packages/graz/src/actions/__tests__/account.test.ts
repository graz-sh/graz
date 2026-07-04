import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeChainInfo } from "../../__tests__/fixtures";
import { RECONNECT_SESSION_KEY } from "../../constant";
import { useGrazInternalStore, useGrazSessionStore } from "../../store";
import type { Key } from "../../types/wallet";
import { WalletType } from "../../types/wallet";
import { connect, disconnect, getOfflineSigners, reconnect } from "../account";
import { subscribeWalletEvents } from "../events";

const makeKey = (chainId: string): Key => ({
  address: new Uint8Array([1, 2, 3]),
  algo: "secp256k1",
  bech32Address: `${chainId}1address`,
  isKeystone: false,
  isNanoLedger: false,
  name: `${chainId} account`,
  pubKey: new Uint8Array([4, 5, 6]),
});

const makeWallet = (accounts: Record<string, Key>) => {
  const offlineSigner = { mode: "direct+amino" };
  const offlineSignerAmino = { mode: "amino" };
  const offlineSignerAuto = { mode: "auto" };

  return {
    enable: vi.fn().mockResolvedValue(undefined),
    experimentalSuggestChain: vi.fn().mockResolvedValue(undefined),
    getKey: vi.fn(async (chainId: string) => accounts[chainId]),
    getKeys: vi.fn(async (chainIds: string[]) => chainIds.map((chainId) => accounts[chainId])),
    getOfflineSigner: vi.fn(() => offlineSigner),
    getOfflineSignerAuto: vi.fn(async () => offlineSignerAuto),
    getOfflineSignerOnlyAmino: vi.fn(() => offlineSignerAmino),
    init: vi.fn().mockResolvedValue(undefined),
    signAmino: vi.fn(),
    signDirect: vi.fn(),
  };
};

const setWindowValue = (key: string, value: unknown) => {
  Object.defineProperty(window, key, {
    configurable: true,
    value,
    writable: true,
  });
};

describe("account actions", () => {
  const eventCleanups: Array<() => void> = [];

  beforeEach(() => {
    for (const key of ["keplr", "cosmostation"]) {
      Reflect.deleteProperty(window, key);
    }
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

  it("connects a wallet, stores account state, and enables reconnect", async () => {
    const chain = makeChainInfo();
    const account = makeKey(chain.chainId);
    const wallet = makeWallet({ [chain.chainId]: account });
    setWindowValue("keplr", wallet);
    useGrazInternalStore.setState({ chains: [chain] });

    const result = await connect({
      autoReconnect: true,
      chainId: chain.chainId,
      walletType: WalletType.KEPLR,
    });

    expect(wallet.init).toHaveBeenCalledTimes(1);
    expect(wallet.enable).toHaveBeenCalledWith([chain.chainId]);
    expect(wallet.getKey).toHaveBeenCalledWith(chain.chainId);
    expect(result).toEqual({
      accounts: { [chain.chainId]: account },
      chains: [chain],
      walletType: WalletType.KEPLR,
    });
    expect(useGrazSessionStore.getState()).toMatchObject({
      accounts: { [chain.chainId]: account },
      activeChainIds: [chain.chainId],
      status: "connected",
    });
    expect(useGrazInternalStore.getState()).toMatchObject({
      _reconnect: true,
      _reconnectConnector: WalletType.KEPLR,
      recentChainIds: [chain.chainId],
      walletType: WalletType.KEPLR,
    });
    expect(window.sessionStorage.getItem(RECONNECT_SESSION_KEY)).toBe("Active");
  });

  it("connects to multiple chains and stores all accounts", async () => {
    const cosmoshub = makeChainInfo();
    const osmosis = makeChainInfo("osmosis-1");
    const accounts = {
      [cosmoshub.chainId]: makeKey(cosmoshub.chainId),
      [osmosis.chainId]: makeKey(osmosis.chainId),
    };
    const wallet = makeWallet(accounts);
    setWindowValue("keplr", wallet);
    useGrazInternalStore.setState({ chains: [cosmoshub, osmosis] });

    await connect({
      chainId: [cosmoshub.chainId, osmosis.chainId],
      walletType: WalletType.KEPLR,
    });

    expect(wallet.getKey).toHaveBeenCalledWith(cosmoshub.chainId);
    expect(wallet.getKey).toHaveBeenCalledWith(osmosis.chainId);
    expect(useGrazSessionStore.getState().accounts).toEqual(accounts);
    expect(useGrazSessionStore.getState().activeChainIds).toEqual([cosmoshub.chainId, osmosis.chainId]);
  });

  it("emits committed active-chain and account changes for established sessions", async () => {
    const cosmoshub = makeChainInfo();
    const osmosis = makeChainInfo("osmosis-1");
    const accounts = {
      [cosmoshub.chainId]: makeKey(cosmoshub.chainId),
      [osmosis.chainId]: makeKey(osmosis.chainId),
    };
    const wallet = makeWallet(accounts);
    const onAccountChange = vi.fn();
    const onActiveChainsChange = vi.fn();
    setWindowValue("keplr", wallet);
    useGrazInternalStore.setState({ chains: [cosmoshub, osmosis] });
    subscribe({ onAccountChange, onActiveChainsChange });

    await connect({
      chainId: cosmoshub.chainId,
      walletType: WalletType.KEPLR,
    });

    expect(onAccountChange).not.toHaveBeenCalled();
    expect(onActiveChainsChange).not.toHaveBeenCalled();

    await connect({
      chainId: osmosis.chainId,
      walletType: WalletType.KEPLR,
    });

    expect(onActiveChainsChange).toHaveBeenCalledWith({
      activeChainIds: [cosmoshub.chainId, osmosis.chainId],
      previousActiveChainIds: [cosmoshub.chainId],
      walletType: WalletType.KEPLR,
    });
    expect(onAccountChange).not.toHaveBeenCalled();
    expect(useGrazSessionStore.getState().activeChainIds).toEqual([cosmoshub.chainId, osmosis.chainId]);

    const previousAccount = accounts[cosmoshub.chainId];
    if (!previousAccount) throw new Error("Missing Cosmos Hub account fixture");
    accounts[cosmoshub.chainId] = {
      ...previousAccount,
      bech32Address: `${cosmoshub.chainId}1changed`,
    };

    await reconnect();

    expect(onAccountChange).toHaveBeenCalledWith({
      accounts: expect.objectContaining({
        [cosmoshub.chainId]: expect.objectContaining({
          bech32Address: `${cosmoshub.chainId}1changed`,
        }),
      }),
      changedChainIds: [cosmoshub.chainId],
      previousAccounts: expect.objectContaining({
        [cosmoshub.chainId]: previousAccount,
      }),
      walletType: WalletType.KEPLR,
    });
    expect(useGrazSessionStore.getState().accounts?.[cosmoshub.chainId]?.bech32Address).toBe(
      `${cosmoshub.chainId}1changed`,
    );
  });

  it("rejects unavailable wallets and chains outside the provider config", async () => {
    const chain = makeChainInfo();
    useGrazInternalStore.setState({ chains: [chain] });

    await expect(connect({ chainId: chain.chainId, walletType: WalletType.KEPLR })).rejects.toThrow(
      "keplr is not available",
    );
    expect(useGrazSessionStore.getState().status).toBe("disconnected");

    const wallet = makeWallet({ [chain.chainId]: makeKey(chain.chainId) });
    setWindowValue("keplr", wallet);

    await expect(connect({ chainId: "osmosis-1", walletType: WalletType.KEPLR })).rejects.toThrow(
      "Chain osmosis-1 is not provided in GrazProvider",
    );
    expect(wallet.enable).not.toHaveBeenCalled();
  });

  it("disconnects one chain or the full session", async () => {
    const cosmoshub = makeChainInfo();
    const osmosis = makeChainInfo("osmosis-1");
    const cosmosAccount = makeKey(cosmoshub.chainId);
    const osmosisAccount = makeKey(osmosis.chainId);
    window.sessionStorage.setItem(RECONNECT_SESSION_KEY, "Active");
    useGrazInternalStore.setState({
      _reconnect: true,
      _reconnectConnector: WalletType.KEPLR,
      recentChainIds: [cosmoshub.chainId, osmosis.chainId],
    });
    useGrazSessionStore.setState({
      accounts: {
        [cosmoshub.chainId]: cosmosAccount,
        [osmosis.chainId]: osmosisAccount,
      },
      activeChainIds: [cosmoshub.chainId, osmosis.chainId],
      status: "connected",
    });
    const onActiveChainsChange = vi.fn();
    const onDisconnect = vi.fn();
    subscribe({ onActiveChainsChange, onDisconnect });

    await disconnect({ chainId: osmosis.chainId });

    expect(window.sessionStorage.getItem(RECONNECT_SESSION_KEY)).toBeNull();
    expect(useGrazSessionStore.getState()).toMatchObject({
      accounts: { [cosmoshub.chainId]: cosmosAccount },
      activeChainIds: [cosmoshub.chainId],
      status: "connected",
    });
    expect(useGrazInternalStore.getState().recentChainIds).toEqual([cosmoshub.chainId]);
    expect(onActiveChainsChange).toHaveBeenCalledWith({
      activeChainIds: [cosmoshub.chainId],
      previousActiveChainIds: [cosmoshub.chainId, osmosis.chainId],
      walletType: WalletType.KEPLR,
    });
    expect(onDisconnect).not.toHaveBeenCalled();

    await disconnect();

    expect(useGrazSessionStore.getState()).toMatchObject({
      accounts: null,
      activeChainIds: null,
      status: "disconnected",
    });
    expect(useGrazInternalStore.getState()).toMatchObject({
      _reconnect: false,
      _reconnectConnector: null,
      recentChainIds: null,
    });
    expect(onDisconnect).toHaveBeenCalledWith({
      chainIds: [cosmoshub.chainId],
      reason: "user",
      walletType: WalletType.KEPLR,
    });
    expect(onActiveChainsChange).toHaveBeenCalledTimes(1);
  });

  it("does not emit disconnect when the session is already disconnected", async () => {
    const onDisconnect = vi.fn();
    subscribe({ onDisconnect });

    await disconnect();

    expect(onDisconnect).not.toHaveBeenCalled();
  });

  it("reconnects from stored state and reports reconnect failures", async () => {
    const chain = makeChainInfo();
    const account = makeKey(chain.chainId);
    setWindowValue("keplr", makeWallet({ [chain.chainId]: account }));
    useGrazInternalStore.setState({
      _reconnect: true,
      _reconnectConnector: WalletType.KEPLR,
      chains: [chain],
      recentChainIds: [chain.chainId],
    });

    await expect(reconnect()).resolves.toMatchObject({
      accounts: { [chain.chainId]: account },
      walletType: WalletType.KEPLR,
    });

    useGrazInternalStore.setState({
      _reconnect: true,
      _reconnectConnector: WalletType.KEPLR,
      chains: [],
      recentChainIds: [chain.chainId],
    });
    const onError = vi.fn();
    const onDisconnect = vi.fn();
    subscribe({ onDisconnect });

    await reconnect({ onError });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(useGrazSessionStore.getState().status).toBe("disconnected");
    expect(onDisconnect).toHaveBeenCalledWith({
      chainIds: [chain.chainId],
      reason: "reconnect-failed",
      walletType: WalletType.KEPLR,
    });
  });

  it("returns offline signers from the selected wallet", async () => {
    const chain = makeChainInfo();
    const wallet = makeWallet({ [chain.chainId]: makeKey(chain.chainId) });
    setWindowValue("keplr", wallet);
    useGrazInternalStore.setState({ walletType: WalletType.KEPLR });

    await expect(getOfflineSigners({ chainId: chain.chainId })).resolves.toEqual({
      offlineSigner: { mode: "direct+amino" },
      offlineSignerAmino: { mode: "amino" },
      offlineSignerAuto: { mode: "auto" },
    });
    expect(wallet.getOfflineSigner).toHaveBeenCalledWith(chain.chainId);
    expect(wallet.getOfflineSignerOnlyAmino).toHaveBeenCalledWith(chain.chainId);
    expect(wallet.getOfflineSignerAuto).toHaveBeenCalledWith(chain.chainId);

    await expect(getOfflineSigners({ chainId: "" })).rejects.toThrow("chainId is required");
  });
});
