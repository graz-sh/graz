import { afterEach, describe, expect, it, vi } from "vitest";

import { useGrazInternalStore, useGrazSessionStore } from "../../../store";
import { WalletType, type Key } from "../../../types/wallet";
import { getWalletConnect } from "../wallet-connect";
import { getWCClot } from "../wallet-connect/clot";
import { getWCCosmostation } from "../wallet-connect/cosmostation";
import { getWCKeplr } from "../wallet-connect/keplr";
import { getWCLeap } from "../wallet-connect/leap";

const makeWalletConnectKey = (chainId: string, overrides: Partial<Key> = {}) => ({
  address: [1, 2, 3],
  algo: "secp256k1",
  bech32Address: `${chainId}1address`,
  chainId,
  isKeystone: false,
  isNanoLedger: false,
  name: "WalletConnect",
  pubKey: Buffer.from(new Uint8Array([4, 5, 6])).toString("base64"),
  ...overrides,
});

const makeSignClient = (chainId: string) => {
  const listeners = new Map<string, Set<(args?: unknown) => void>>();
  const session = {
    expiry: Math.floor(Date.now() / 1000) + 60,
    requiredNamespaces: {
      cosmos: {
        chains: [`cosmos:${chainId}`],
      },
    },
    sessionProperties: {
      keys: JSON.stringify([makeWalletConnectKey(chainId)]),
    },
    topic: "topic-1",
  };
  let sessions = [session];
  const inactivePairing = { topic: "pairing-1" };
  const deletePairing = vi.fn().mockResolvedValue(undefined);

  return {
    core: {
      pairing: {
        pairings: {
          delete: deletePairing,
          getAll: vi.fn(() => [inactivePairing]),
        },
      },
    },
    disconnect: vi.fn(async ({ topic }: { topic: string }) => {
      sessions = sessions.filter((item) => item.topic !== topic);
    }),
    events: {
      emit: (event: string, args?: unknown) => {
        for (const listener of listeners.get(event) ?? []) {
          listener(args);
        }
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
    request: vi.fn(async ({ request }: { request: { method: string } }) => {
      if (request.method === "cosmos_signDirect") {
        return {
          signature: {
            pub_key: {
              type: "tendermint/PubKeySecp256k1",
              value: "pubkey",
            },
            signature: "signature",
          },
          signed: {
            accountNumber: "7",
            authInfoBytes: Buffer.from(new Uint8Array([1])).toString("base64"),
            bodyBytes: Buffer.from(new Uint8Array([2])).toString("base64"),
            chainId,
          },
        };
      }
      return { signed: {}, signature: {} };
    }),
    session: {
      getAll: vi.fn(() => sessions),
    },
    test: {
      deletePairing,
      listeners,
    },
  };
};

describe("WalletConnect adapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("guards mobile wallet wrappers and creates wallets on mobile user agents", () => {
    expect(() => getWCKeplr()).toThrow("walletConnect.options.projectId is not defined");

    useGrazInternalStore.setState({
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });

    expect(() => getWCKeplr()).toThrow("WalletConnect Keplr mobile is only supported in mobile");

    vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)");

    expect(getWCKeplr()).toMatchObject({ init: expect.any(Function) });
    expect(getWCLeap()).toMatchObject({ init: expect.any(Function) });
    expect(getWCCosmostation()).toMatchObject({ init: expect.any(Function) });
    expect(getWCClot()).toMatchObject({ init: expect.any(Function) });
  });

  it("uses an existing session for keys, signers, requests, subscriptions, and disconnects", async () => {
    const chainId = "cosmoshub-4";
    const signClient = makeSignClient(chainId);
    const wcSignClients = new Map();
    wcSignClients.set(WalletType.WALLETCONNECT, signClient);
    useGrazInternalStore.setState({
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });
    useGrazSessionStore.setState({
      accounts: {
        [chainId]: makeWalletConnectKey(chainId) as unknown as Key,
      },
      activeChainIds: [chainId],
      wcSignClients,
    });

    const wallet = getWalletConnect();

    await expect(wallet.enable([chainId])).resolves.toBeUndefined();
    expect(useGrazSessionStore.getState().accounts?.[chainId]).toMatchObject({
      bech32Address: `${chainId}1address`,
      name: "WalletConnect",
    });

    const key = await wallet.getKey(chainId);
    expect(key).toMatchObject({
      bech32Address: `${chainId}1address`,
      isNanoLedger: false,
    });
    expect(Array.from(key.pubKey)).toEqual([4, 5, 6]);

    const directSigner = await wallet.getOfflineSignerAuto(chainId);
    expect("signDirect" in directSigner).toBe(true);
    await expect(
      wallet.getOfflineSigner(chainId).getAccounts(),
    ).resolves.toEqual([
      {
        address: `${chainId}1address`,
        algo: "secp256k1",
        pubkey: Buffer.from(new Uint8Array([4, 5, 6])),
      },
    ]);
    await expect(
      wallet.signDirect(chainId, `${chainId}1address`, {
        accountNumber: 7n,
        authInfoBytes: new Uint8Array([1]),
        bodyBytes: new Uint8Array([2]),
        chainId,
      }),
    ).resolves.toMatchObject({
      signed: {
        accountNumber: 7n,
        authInfoBytes: new Uint8Array([1]),
        bodyBytes: new Uint8Array([2]),
        chainId,
      },
    });
    expect(signClient.request).toHaveBeenCalledWith(
      expect.objectContaining({
        chainId: `cosmos:${chainId}`,
        request: expect.objectContaining({
          method: "cosmos_signDirect",
        }),
        topic: "topic-1",
      }),
    );

    const reconnect = vi.fn();
    const cleanup = wallet.subscription?.(reconnect);
    signClient.events.emit("session_event", {
      params: {
        chainId: `cosmos:${chainId}`,
        event: {
          data: [`${chainId}1address`],
          name: "accountsChanged",
        },
      },
    });
    expect(reconnect).toHaveBeenCalledTimes(1);
    cleanup?.();
    expect(signClient.events.off).toHaveBeenCalledWith("session_delete", expect.any(Function));
    expect(signClient.events.off).toHaveBeenCalledWith("session_expire", expect.any(Function));
    expect(signClient.events.off).toHaveBeenCalledWith("session_event", expect.any(Function));

    await expect(wallet.disable?.(chainId)).resolves.toBeUndefined();
    expect(signClient.disconnect).toHaveBeenCalledWith(
      expect.objectContaining({
        topic: "topic-1",
      }),
    );
    expect(signClient.test.deletePairing).toHaveBeenCalledWith(
      "pairing-1",
      expect.objectContaining({
        code: 7001,
      }),
    );
    expect(useGrazSessionStore.getState().wcSignClients.has(WalletType.WALLETCONNECT)).toBe(false);
    expect(useGrazInternalStore.getState()).toMatchObject({
      _reconnect: false,
      _reconnectConnector: null,
      recentChainIds: null,
    });
  });
});
