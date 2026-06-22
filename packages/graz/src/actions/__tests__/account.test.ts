import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeChainInfo } from "../../__tests__/fixtures";
import { RECONNECT_SESSION_KEY } from "../../constant";
import { useGrazInternalStore, useGrazSessionStore } from "../../store";
import type { Key } from "../../types/wallet";
import { WalletType } from "../../types/wallet";
import { connect, disconnect, getOfflineSigners, reconnect } from "../account";

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
  beforeEach(() => {
    for (const key of ["keplr", "leap"]) {
      Reflect.deleteProperty(window, key);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("uses Leap dapp-browser batched key lookup for multi-chain connections", async () => {
    const cosmoshub = makeChainInfo();
    const osmosis = makeChainInfo("osmosis-1");
    const accounts = {
      [cosmoshub.chainId]: makeKey(cosmoshub.chainId),
      [osmosis.chainId]: makeKey(osmosis.chainId),
    };
    const wallet = makeWallet(accounts);
    setWindowValue("leap", wallet);
    vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue("LeapCosmos");
    useGrazInternalStore.setState({ chains: [cosmoshub, osmosis] });

    await connect({
      chainId: [cosmoshub.chainId, osmosis.chainId],
      walletType: WalletType.LEAP,
    });

    expect(wallet.getKeys).toHaveBeenCalledWith([cosmoshub.chainId, osmosis.chainId]);
    expect(wallet.getKey).not.toHaveBeenCalled();
    expect(useGrazSessionStore.getState().accounts).toEqual(accounts);
    expect(useGrazSessionStore.getState().activeChainIds).toEqual([cosmoshub.chainId, osmosis.chainId]);
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

    await disconnect({ chainId: osmosis.chainId });

    expect(window.sessionStorage.getItem(RECONNECT_SESSION_KEY)).toBeNull();
    expect(useGrazSessionStore.getState()).toMatchObject({
      accounts: { [cosmoshub.chainId]: cosmosAccount },
      activeChainIds: [cosmoshub.chainId],
      status: "connected",
    });
    expect(useGrazInternalStore.getState().recentChainIds).toEqual([cosmoshub.chainId]);

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

    await reconnect({ onError });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(useGrazSessionStore.getState().status).toBe("disconnected");
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
