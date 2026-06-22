import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeChainInfo } from "../../__tests__/fixtures";
import { createQueryWrapper, flushReact, renderHook } from "../../__tests__/react";
import { useGrazInternalStore, useGrazSessionStore } from "../../store";
import type { Key } from "../../types/wallet";
import { WalletType } from "../../types/wallet";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useOfflineSigners,
} from "../account";
import { useActiveWalletType, useCheckWallet } from "../wallet";

const makeKey = (chainId: string): Key => ({
  address: new Uint8Array([1, 2, 3]),
  algo: "secp256k1",
  bech32Address: `${chainId}1address`,
  isKeystone: false,
  isNanoLedger: false,
  name: `${chainId} account`,
  pubKey: new Uint8Array([4, 5, 6]),
});

const makeWallet = (accounts: Record<string, Key>) => ({
  enable: vi.fn().mockResolvedValue(undefined),
  experimentalSuggestChain: vi.fn().mockResolvedValue(undefined),
  getKey: vi.fn(async (chainId: string) => accounts[chainId]),
  getOfflineSigner: vi.fn(() => ({ mode: "direct+amino" })),
  getOfflineSignerAuto: vi.fn(async () => ({ mode: "auto" })),
  getOfflineSignerOnlyAmino: vi.fn(() => ({ mode: "amino" })),
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

describe("account and wallet hooks", () => {
  beforeEach(() => {
    Reflect.deleteProperty(window, "keplr");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exposes active wallet flags and wallet availability", async () => {
    const { wrapper } = createQueryWrapper();
    const wallet = makeWallet({});
    setWindowValue("keplr", wallet);
    useGrazInternalStore.setState({ walletType: WalletType.KEPLR });

    const rendered = renderHook(
      () => ({
        activeWallet: useActiveWalletType(),
        checkWallet: useCheckWallet(WalletType.KEPLR),
      }),
      { wrapper },
    );
    await flushReact();

    expect(rendered.result.activeWallet).toMatchObject({
      isKeplr: true,
      isLeap: false,
      walletType: WalletType.KEPLR,
    });
    await vi.waitFor(() => {
      expect(rendered.result.checkWallet.data).toBe(true);
    });
    rendered.unmount();
  });

  it("maps account store state and emits connect/disconnect callbacks", () => {
    const chain = makeChainInfo();
    const account = makeKey(chain.chainId);
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    useGrazInternalStore.setState({
      chains: [chain],
      walletType: WalletType.KEPLR,
    });

    const rendered = renderHook(() =>
      useAccount({
        chainId: [chain.chainId],
        onConnect,
        onDisconnect,
      }),
    );

    expect(rendered.result).toMatchObject({
      data: undefined,
      isConnected: false,
      isDisconnected: true,
      status: "disconnected",
    });

    act(() => {
      useGrazSessionStore.setState({
        accounts: { [chain.chainId]: account },
        activeChainIds: [chain.chainId],
        status: "connected",
      });
    });

    expect(rendered.result).toMatchObject({
      data: { [chain.chainId]: account },
      isConnected: true,
      status: "connected",
      walletType: WalletType.KEPLR,
    });
    expect(onConnect).toHaveBeenCalledWith({
      accounts: { [chain.chainId]: account },
      chains: [chain],
      isReconnect: false,
      walletType: WalletType.KEPLR,
    });

    act(() => {
      useGrazSessionStore.setState({ status: "disconnected" });
    });

    expect(rendered.result.isDisconnected).toBe(true);
    expect(onDisconnect).toHaveBeenCalledTimes(1);
    rendered.unmount();
  });

  it("connects, returns offline signers, and disconnects through hook mutations", async () => {
    const { wrapper } = createQueryWrapper();
    const chain = makeChainInfo();
    const account = makeKey(chain.chainId);
    const wallet = makeWallet({ [chain.chainId]: account });
    const onConnect = vi.fn();
    const onDisconnect = vi.fn();
    setWindowValue("keplr", wallet);
    useGrazInternalStore.setState({
      chains: [chain],
      walletType: WalletType.KEPLR,
    });

    const rendered = renderHook(
      () => ({
        connect: useConnect({ onSuccess: onConnect }),
        disconnect: useDisconnect({ onSuccess: onDisconnect }),
        offlineSigners: useOfflineSigners({ chainId: [chain.chainId] }),
      }),
      { wrapper },
    );

    await act(async () => {
      await rendered.result.connect.connectAsync({
        autoReconnect: true,
        chainId: chain.chainId,
        walletType: WalletType.KEPLR,
      });
    });
    await flushReact();

    expect(onConnect).toHaveBeenCalledWith({
      accounts: { [chain.chainId]: account },
      chains: [chain],
      walletType: WalletType.KEPLR,
    });
    expect(rendered.result.connect.isSuccess).toBe(true);
    await vi.waitFor(() => {
      expect(rendered.result.offlineSigners.data).toEqual({
        [chain.chainId]: {
          offlineSigner: { mode: "direct+amino" },
          offlineSignerAmino: { mode: "amino" },
          offlineSignerAuto: { mode: "auto" },
        },
      });
    });

    await act(async () => {
      await rendered.result.disconnect.disconnectAsync();
    });

    expect(onDisconnect).toHaveBeenCalledWith(undefined);
    expect(useGrazSessionStore.getState().status).toBe("disconnected");
    rendered.unmount();
  });
});
