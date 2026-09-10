import { beforeEach, describe, expect, it, vi } from "vitest";

const walletMock = vi.hoisted(() => ({
  disable: vi.fn().mockResolvedValue(undefined),
  enable: vi.fn(),
  init: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../wallet", async (importOriginal) => {
  const original = await importOriginal<typeof import("../wallet")>();
  return {
    ...original,
    checkWallet: vi.fn(() => true),
    getWallet: vi.fn(() => walletMock),
    isPara: vi.fn(() => false),
    isWalletConnect: vi.fn((walletType) => walletType === "walletconnect"),
  };
});

import { makeChainInfo } from "../../__tests__/fixtures";
import { useGrazInternalStore, useGrazSessionStore } from "../../store";
import type { Key } from "../../types/wallet";
import { WalletType } from "../../types/wallet";
import { connect, reconnect } from "../account";

const makeKey = (chainId: string): Key => ({
  address: new Uint8Array([1, 2, 3]),
  algo: "secp256k1",
  bech32Address: `${chainId}1address`,
  isKeystone: false,
  isNanoLedger: false,
  name: `${chainId} account`,
  pubKey: new Uint8Array([4, 5, 6]),
});

describe("WalletConnect account action", () => {
  beforeEach(() => {
    walletMock.disable.mockReset().mockResolvedValue(undefined);
    walletMock.enable.mockReset();
    walletMock.init.mockReset().mockResolvedValue(undefined);
  });

  it("replaces active chains with the approved scope in requested and configured order", async () => {
    const chainA = makeChainInfo("cosmoshub-4");
    const chainB = makeChainInfo("osmosis-1");
    const chainC = makeChainInfo("juno-1");
    const chainD = makeChainInfo("neutron-1");
    const accountA = makeKey(chainA.chainId);
    const accountB = makeKey(chainB.chainId);
    const accountC = makeKey(chainC.chainId);
    const accountD = makeKey(chainD.chainId);
    const session = {
      expiry: Math.floor(Date.now() / 1000) + 60,
      namespaces: {
        cosmos: {
          accounts: [
            `cosmos:${chainA.chainId}:${accountA.bech32Address}`,
            `cosmos:${chainB.chainId}:${accountB.bech32Address}`,
            `cosmos:${chainD.chainId}:${accountD.bech32Address}`,
          ],
          events: [],
          methods: [],
        },
      },
      topic: "topic-1",
    };
    const signClient = {
      session: {
        getAll: vi.fn(() => [session]),
      },
    };

    walletMock.enable.mockImplementation(async () => {
      useGrazSessionStore.setState({
        accounts: {
          [chainA.chainId]: accountA,
          [chainB.chainId]: accountB,
          [chainD.chainId]: accountD,
        },
        wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
      });
    });
    useGrazInternalStore.setState({
      chains: [chainA, chainB, chainD, chainC],
      recentChainIds: [chainC.chainId],
      walletType: WalletType.WALLETCONNECT,
    });
    useGrazSessionStore.setState({
      accounts: { [chainC.chainId]: accountC },
      activeChainIds: [chainC.chainId],
    });

    const result = await connect({
      chainId: [chainB.chainId, chainA.chainId],
      walletType: WalletType.WALLETCONNECT,
    });

    expect(result).toEqual({
      accounts: {
        [chainA.chainId]: accountA,
        [chainB.chainId]: accountB,
        [chainD.chainId]: accountD,
      },
      chains: [chainB, chainA, chainD],
      walletType: WalletType.WALLETCONNECT,
    });
    expect(useGrazSessionStore.getState().activeChainIds).toEqual([
      chainB.chainId,
      chainA.chainId,
      chainD.chainId,
    ]);
    expect(useGrazInternalStore.getState().recentChainIds).toEqual([
      chainB.chainId,
      chainA.chainId,
      chainD.chainId,
    ]);
  });

  it("drops previous chains absent from the approved session even when not requested", async () => {
    const chainA = makeChainInfo("cosmoshub-4");
    const chainB = makeChainInfo("osmosis-1");
    const chainC = makeChainInfo("juno-1");
    const chainD = makeChainInfo("neutron-1");
    const accountA = makeKey(chainA.chainId);
    const accountB = makeKey(chainB.chainId);
    const accountC = makeKey(chainC.chainId);
    const accountD = makeKey(chainD.chainId);
    const session = {
      expiry: Math.floor(Date.now() / 1000) + 60,
      namespaces: {
        cosmos: {
          accounts: [
            `cosmos:${chainA.chainId}:${accountA.bech32Address}`,
            `cosmos:${chainD.chainId}:${accountD.bech32Address}`,
          ],
          events: [],
          methods: [],
        },
      },
      topic: "topic-1",
    };
    const signClient = {
      session: {
        getAll: vi.fn(() => [session]),
      },
    };

    walletMock.enable.mockImplementation(async () => {
      useGrazSessionStore.setState({
        accounts: {
          [chainA.chainId]: accountA,
          [chainD.chainId]: accountD,
        },
        wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
      });
    });
    useGrazInternalStore.setState({
      chains: [chainA, chainB, chainC, chainD],
      recentChainIds: [chainB.chainId, chainC.chainId],
      walletType: WalletType.WALLETCONNECT,
    });
    useGrazSessionStore.setState({
      accounts: {
        [chainB.chainId]: accountB,
        [chainC.chainId]: accountC,
      },
      activeChainIds: [chainB.chainId, chainC.chainId],
      status: "connected",
    });

    const result = await connect({
      chainId: [chainB.chainId, chainA.chainId],
      walletType: WalletType.WALLETCONNECT,
    });

    expect(result.chains).toEqual([chainA, chainD]);
    expect(result.accounts).toEqual({ [chainA.chainId]: accountA, [chainD.chainId]: accountD });
    expect(useGrazSessionStore.getState().activeChainIds).toEqual([chainA.chainId, chainD.chainId]);
    expect(useGrazInternalStore.getState().recentChainIds).toEqual([chainA.chainId, chainD.chainId]);
  });

  it("reconnects with the latest approved configured scope", async () => {
    const chainA = makeChainInfo("cosmoshub-4");
    const omitted = makeChainInfo("osmosis-1");
    const additional = makeChainInfo("neutron-1");
    const accountA = makeKey(chainA.chainId);
    const accountD = makeKey(additional.chainId);
    const session = {
      expiry: Math.floor(Date.now() / 1000) + 60,
      namespaces: {
        cosmos: {
          accounts: [
            `cosmos:${chainA.chainId}:${accountA.bech32Address}`,
            `cosmos:${additional.chainId}:${accountD.bech32Address}`,
          ],
          events: [],
          methods: [],
        },
      },
      topic: "topic-1",
    };
    const signClient = {
      session: {
        getAll: vi.fn(() => [session]),
      },
    };

    walletMock.enable.mockImplementation(async () => {
      useGrazSessionStore.setState({
        accounts: {
          [chainA.chainId]: accountA,
          [additional.chainId]: accountD,
        },
        wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
      });
    });
    useGrazInternalStore.setState({
      _reconnect: true,
      _reconnectConnector: WalletType.WALLETCONNECT,
      chains: [chainA, omitted, additional],
      recentChainIds: [chainA.chainId, omitted.chainId],
      walletType: WalletType.WALLETCONNECT,
    });
    useGrazSessionStore.setState({ accounts: null, activeChainIds: null });

    await expect(reconnect()).resolves.toEqual({
      accounts: {
        [chainA.chainId]: accountA,
        [additional.chainId]: accountD,
      },
      chains: [chainA, additional],
      walletType: WalletType.WALLETCONNECT,
    });
    expect(walletMock.enable).toHaveBeenCalledWith([chainA.chainId, omitted.chainId]);
    expect(useGrazSessionStore.getState().activeChainIds).toEqual([chainA.chainId, additional.chainId]);
    expect(useGrazInternalStore.getState().recentChainIds).toEqual([chainA.chainId, additional.chainId]);
  });

  it("finishes the previous disconnect before enabling a new session", async () => {
    const chain = makeChainInfo("cosmoshub-4");
    const account = makeKey(chain.chainId);
    const calls: string[] = [];
    let resolveDisconnect!: () => void;
    const disconnecting = new Promise<void>((resolve) => {
      resolveDisconnect = resolve;
    });
    const session = {
      expiry: Math.floor(Date.now() / 1000) + 60,
      namespaces: {
        cosmos: {
          accounts: [`cosmos:${chain.chainId}:${account.bech32Address}`],
          events: [],
          methods: [],
        },
      },
      topic: "new-topic",
    };
    const signClient = {
      session: {
        getAll: vi.fn(() => [session]),
      },
    };
    walletMock.disable.mockImplementation(async () => {
      calls.push("disable:start");
      await disconnecting;
      calls.push("disable:end");
      useGrazSessionStore.setState({ wcSignClients: new Map() });
    });
    walletMock.enable.mockImplementation(async () => {
      calls.push("enable");
      useGrazSessionStore.setState({
        accounts: { [chain.chainId]: account },
        wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
      });
    });
    useGrazInternalStore.setState({
      chains: [chain],
      recentChainIds: [chain.chainId],
      walletType: WalletType.WALLETCONNECT,
    });
    useGrazSessionStore.setState({
      accounts: { [chain.chainId]: account },
      activeChainIds: [chain.chainId],
      status: "connected",
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    const connection = connect({ chainId: chain.chainId, walletType: WalletType.WALLETCONNECT });
    await vi.waitFor(() => expect(walletMock.disable).toHaveBeenCalledTimes(1));
    expect(walletMock.enable).not.toHaveBeenCalled();

    resolveDisconnect();
    await expect(connection).resolves.toMatchObject({ walletType: WalletType.WALLETCONNECT });

    expect(calls).toEqual(["disable:start", "disable:end", "enable"]);
    expect(useGrazSessionStore.getState().wcSignClients.get(WalletType.WALLETCONNECT)).toBe(signClient);
  });

  it("does not retain connected state when a replacement session fails", async () => {
    const chain = makeChainInfo("cosmoshub-4");
    const account = makeKey(chain.chainId);
    const signClient = { session: { getAll: vi.fn(() => []) } };
    walletMock.enable.mockRejectedValue(new Error("User closed wallet connect"));
    useGrazInternalStore.setState({
      chains: [chain],
      recentChainIds: [chain.chainId],
      walletType: WalletType.WALLETCONNECT,
    });
    useGrazSessionStore.setState({
      accounts: { [chain.chainId]: account },
      activeChainIds: [chain.chainId],
      status: "connected",
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    await expect(connect({ chainId: chain.chainId, walletType: WalletType.WALLETCONNECT })).rejects.toThrow(
      "User closed wallet connect",
    );

    expect(walletMock.disable).toHaveBeenCalledTimes(1);
    expect(useGrazSessionStore.getState()).toMatchObject({
      accounts: null,
      activeChainIds: null,
      status: "disconnected",
    });
    expect(useGrazSessionStore.getState().wcSignClients.get(WalletType.WALLETCONNECT)).toBe(signClient);
  });

  it("validates requested chains before disconnecting the current session", async () => {
    const chain = makeChainInfo("cosmoshub-4");
    const account = makeKey(chain.chainId);
    useGrazInternalStore.setState({
      chains: [chain],
      recentChainIds: [chain.chainId],
      walletType: WalletType.WALLETCONNECT,
    });
    useGrazSessionStore.setState({
      accounts: { [chain.chainId]: account },
      activeChainIds: [chain.chainId],
      status: "connected",
    });

    await expect(connect({ chainId: "unknown-chain", walletType: WalletType.WALLETCONNECT })).rejects.toThrow(
      "Chain unknown-chain is not provided in GrazProvider",
    );

    expect(walletMock.disable).not.toHaveBeenCalled();
    expect(useGrazSessionStore.getState()).toMatchObject({
      accounts: { [chain.chainId]: account },
      activeChainIds: [chain.chainId],
      status: "connected",
    });
  });
});
