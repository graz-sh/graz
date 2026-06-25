import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGrazInternalStore, useGrazSessionStore } from "../../../store";
import { WalletType } from "../../../types/wallet";
import { checkWallet, getAvailableWallets, getWallet } from "../index";
import { getCactusCosmos } from "../cactus";
import { getCompass } from "../compass";
import { getCosmostation } from "../cosmostation";
import { getKeplr } from "../keplr";
import { getOkx } from "../okx";
import { getXDefi } from "../xdefi";

const makeWallet = () => ({
  enable: vi.fn(),
  experimentalSuggestChain: vi.fn(),
  getKey: vi.fn(),
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

describe("browser wallet adapters", () => {
  beforeEach(() => {
    for (const key of ["cactuslink_cosmos", "compass", "cosmostation", "keplr", "okxwallet", "xfi"]) {
      Reflect.deleteProperty(window, key);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("wraps Keplr with default options and keystore subscriptions", () => {
    const wallet = makeWallet();
    setWindowValue("keplr", wallet);
    useGrazInternalStore.setState({ walletDefaultOptions: { sign: { preferNoSetFee: true } } });

    const resolved = getWallet(WalletType.KEPLR);
    const reconnect = vi.fn();
    const cleanup = resolved.subscription?.(reconnect);

    window.dispatchEvent(new Event("keplr_keystorechange"));

    expect(resolved).toBe(wallet);
    expect((wallet as typeof wallet & { defaultOptions?: unknown }).defaultOptions).toEqual({
      sign: { preferNoSetFee: true },
    });
    expect(reconnect).toHaveBeenCalledTimes(1);

    cleanup?.();
    window.dispatchEvent(new Event("keplr_keystorechange"));
    expect(reconnect).toHaveBeenCalledTimes(1);
  });

  it("detects available wallets and reports unavailable wallets as false", () => {
    setWindowValue("keplr", makeWallet());

    expect(checkWallet(WalletType.KEPLR)).toBe(true);
    expect(checkWallet(WalletType.COSMOSTATION)).toBe(false);
    expect(getAvailableWallets()).toMatchObject({
      [WalletType.KEPLR]: true,
      [WalletType.COSMOSTATION]: false,
    });
  });

  it("calls the configured not-found callback before throwing", () => {
    const onNotFound = vi.fn();
    useGrazInternalStore.setState({ _notFoundFn: onNotFound });

    expect(() => getKeplr()).toThrow("window.keplr is not defined");
    expect(onNotFound).toHaveBeenCalledTimes(1);
  });

  it("wraps compass extension subscriptions", () => {
    const wallet = makeWallet();
    setWindowValue("compass", wallet);
    const reconnect = vi.fn();

    const cleanup = getCompass().subscription?.(reconnect);
    window.dispatchEvent(new Event("leap_keystorechange"));

    expect(reconnect).toHaveBeenCalledTimes(1);
    cleanup?.();
    window.dispatchEvent(new Event("leap_keystorechange"));
    expect(reconnect).toHaveBeenCalledTimes(1);
  });

  it("wraps Cosmostation's nested Keplr provider", () => {
    const wallet = makeWallet();
    setWindowValue("cosmostation", { providers: { keplr: wallet } });

    const reconnect = vi.fn();
    const cleanup = getCosmostation().subscription?.(reconnect);
    window.dispatchEvent(new Event("cosmostation_keystorechange"));

    expect(reconnect).toHaveBeenCalledTimes(1);
    cleanup?.();
  });

  it("wraps OKX account change subscriptions", () => {
    const listenerRef = { listener: undefined as undefined | (() => void) };
    const wallet = makeWallet();
    const okxwallet = {
      keplr: wallet,
      on: vi.fn((_event: string, listener: () => void) => {
        listenerRef.listener = listener;
      }),
      removeListener: vi.fn(),
    };
    setWindowValue("okxwallet", okxwallet);

    const reconnect = vi.fn();
    const cleanup = getOkx().subscription?.(reconnect);
    listenerRef.listener?.();

    expect(reconnect).toHaveBeenCalledTimes(1);
    cleanup?.();
    expect(okxwallet.removeListener).toHaveBeenCalledWith("accountsChanged", listenerRef.listener);
  });

  it("calls the configured not-found callback for missing lightweight adapters", () => {
    const onNotFound = vi.fn();
    useGrazInternalStore.setState({ _notFoundFn: onNotFound });

    expect(() => getXDefi()).toThrow("window.xfi.keplr is not defined");
    expect(() => getCactusCosmos()).toThrow("window.cactuslink_cosmos is not defined");
    expect(onNotFound).toHaveBeenCalledTimes(2);
  });

  it("wraps XDEFI and Cactus Cosmos wallet contracts", async () => {
    useGrazSessionStore.setState({
      accounts: {
        "cosmoshub-4": {
          address: new Uint8Array([1]),
          algo: "secp256k1",
          bech32Address: "cosmos1address",
          isKeystone: false,
          isNanoLedger: false,
          name: "account",
          pubKey: new Uint8Array([2]),
        },
      },
      activeChainIds: ["cosmoshub-4"],
      status: "connected",
    });

    const xdefi = makeWallet();
    setWindowValue("xfi", { keplr: xdefi });
    const xdefiWallet = getXDefi();
    const xdefiReconnect = vi.fn();
    const xdefiCleanup = xdefiWallet.subscription?.(xdefiReconnect);

    window.dispatchEvent(new Event("keplr_keystorechange"));

    expect(xdefiWallet).toBe(xdefi);
    expect(xdefiReconnect).toHaveBeenCalledTimes(1);
    expect(useGrazSessionStore.getState().accounts).toBeNull();
    xdefiCleanup?.();

    const cactusSigner = {};
    const cactusReconnect = vi.fn();
    const cactus = {
      ...makeWallet(),
      getOfflineSigner: vi.fn(() => cactusSigner),
    };
    setWindowValue("cactuslink_cosmos", cactus);
    const cactusWallet = getCactusCosmos();
    const cactusCleanup = cactusWallet.subscription?.(cactusReconnect);

    window.dispatchEvent(new Event("accountsChanged"));

    await expect(cactusWallet.getOfflineSignerAuto("cosmoshub-4")).resolves.toBe(cactusSigner);
    expect(cactusWallet.getOfflineSignerOnlyAmino("cosmoshub-4")).toBe(cactusSigner);
    expect(cactusReconnect).toHaveBeenCalledTimes(1);
    await expect(cactusWallet.experimentalSuggestChain({} as never)).rejects.toThrow(
      "Cactus Cosmos does not support experimentalSuggestChain",
    );
    cactusCleanup?.();
  });
});
