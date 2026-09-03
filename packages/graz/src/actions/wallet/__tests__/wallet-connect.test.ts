import { afterEach, describe, expect, it, vi } from "vitest";
import { toBech32 } from "@cosmjs/encoding";
import { SignClient } from "@walletconnect/sign-client";

import { makeChainInfo } from "../../../__tests__/fixtures";
import { useGrazInternalStore, useGrazSessionStore } from "../../../store";
import { WalletType, type Key } from "../../../types/wallet";
import { getWalletConnect } from "../wallet-connect";
import { getWCClot } from "../wallet-connect/clot";
import { getWCCosmostation } from "../wallet-connect/cosmostation";
import { getWCKeplr } from "../wallet-connect/keplr";

const getWalletConnectAddressBytes = (chainId: string) =>
  Uint8Array.from({ length: 20 }, (_, index) => chainId.charCodeAt(index % chainId.length));

const getWalletConnectAddress = (chainId: string) => toBech32("cosmos", getWalletConnectAddressBytes(chainId));

const makeWalletConnectKey = (chainId: string, overrides: Partial<Key> = {}) => ({
  address: Array.from(getWalletConnectAddressBytes(chainId)),
  algo: "secp256k1",
  bech32Address: getWalletConnectAddress(chainId),
  chainId,
  isKeystone: false,
  isNanoLedger: false,
  name: "WalletConnect",
  pubKey: Buffer.from(new Uint8Array([4, 5, 6])).toString("base64"),
  ...overrides,
});

const makeSignClient = (
  chainId: string,
  options: { includeSessionProperties?: boolean; sessionPropertiesChainId?: string } = {},
) => {
  const includeSessionProperties = options.includeSessionProperties ?? true;
  const sessionPropertiesChainId = options.sessionPropertiesChainId ?? chainId;
  const listeners = new Map<string, Set<(args?: unknown) => void>>();
  const session = {
    expiry: Math.floor(Date.now() / 1000) + 60,
    namespaces: {
      cosmos: {
        accounts: [`cosmos:${chainId}:${getWalletConnectAddress(chainId)}`],
        events: ["chainChanged", "accountsChanged"],
        methods: ["cosmos_getAccounts", "cosmos_signAmino", "cosmos_signDirect"],
      },
    },
    requiredNamespaces: {
      cosmos: {
        chains: [`cosmos:${chainId}`],
      },
    },
    ...(includeSessionProperties
      ? {
          sessionProperties: {
            keys: JSON.stringify([makeWalletConnectKey(sessionPropertiesChainId)]),
          },
        }
      : {}),
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
    request: vi.fn(async ({ chainId: requestChainId, request }: { chainId?: string; request: { method: string } }) => {
      if (request.method === "cosmos_getAccounts") {
        if (requestChainId !== `cosmos:${chainId}`) {
          throw new Error(`Expected cosmos_getAccounts for cosmos:${chainId}, received ${requestChainId}`);
        }
        return [makeWalletConnectKey(chainId)];
      }
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
      session,
    },
  };
};

describe("WalletConnect adapter", () => {
  afterEach(() => {
    vi.useRealTimers();
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
    expect(getWCCosmostation()).toMatchObject({ init: expect.any(Function) });
    expect(getWCClot()).toMatchObject({ init: expect.any(Function) });
  });

  it("uses an existing session for keys, signers, requests, subscriptions, and disconnects", async () => {
    const chainId = "cosmoshub-4";
    const signClient = makeSignClient(chainId);
    const wcSignClients = new Map();
    wcSignClients.set(WalletType.WALLETCONNECT, signClient);
    useGrazInternalStore.setState({
      chains: [makeChainInfo(chainId)],
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
      bech32Address: getWalletConnectAddress(chainId),
      name: "WalletConnect",
    });

    const key = await wallet.getKey(chainId);
    expect(key).toMatchObject({
      bech32Address: getWalletConnectAddress(chainId),
      isNanoLedger: false,
    });
    expect(Array.from(key.pubKey)).toEqual([4, 5, 6]);

    const directSigner = await wallet.getOfflineSignerAuto(chainId);
    expect("signDirect" in directSigner).toBe(true);
    await expect(
      wallet.getOfflineSigner(chainId).getAccounts(),
    ).resolves.toEqual([
      {
        address: getWalletConnectAddress(chainId),
        algo: "secp256k1",
        pubkey: Buffer.from(new Uint8Array([4, 5, 6])),
      },
    ]);
    await expect(
      wallet.signDirect(chainId, getWalletConnectAddress(chainId), {
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
          data: [getWalletConnectAddress(chainId)],
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
    expect(useGrazSessionStore.getState().wcSignClients.get(WalletType.WALLETCONNECT)).toBe(signClient);
    const initialize = vi.spyOn(SignClient, "init").mockRejectedValue(new Error("Unexpected SignClient re-init"));
    await expect(wallet.init!()).resolves.toBe(signClient);
    expect(initialize).not.toHaveBeenCalled();
    expect(useGrazInternalStore.getState()).toMatchObject({
      _reconnect: false,
      _reconnectConnector: null,
      recentChainIds: null,
    });
  });

  it("coalesces concurrent SignClient initialization", async () => {
    const chainId = "cosmoshub-4";
    const signClient = makeSignClient(chainId);
    let resolveInitialization!: (client: typeof signClient) => void;
    const initialization = new Promise<typeof signClient>((resolve) => {
      resolveInitialization = resolve;
    });
    const initialize = vi.spyOn(SignClient, "init").mockReturnValue(initialization as never);
    useGrazInternalStore.setState({
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });

    const first = getWalletConnect().init!();
    const second = getWalletConnect().init!();

    expect(initialize).toHaveBeenCalledTimes(1);
    resolveInitialization(signClient);
    await expect(Promise.all([first, second])).resolves.toEqual([signClient, signClient]);
    expect(useGrazSessionStore.getState().wcSignClients.get(WalletType.WALLETCONNECT)).toBe(signClient);
  });
  it("uses the latest approved optional-only session for signing", async () => {
    const chainId = "cosmoshub-4";
    const previousAddressBytes = Uint8Array.from({ length: 20 }, () => 1);
    const previousAddress = toBech32("cosmos", previousAddressBytes);
    const previousKey = makeWalletConnectKey(chainId, {
      address: previousAddressBytes,
      bech32Address: previousAddress,
    });
    const latestKey = makeWalletConnectKey(chainId);
    const signClient = makeSignClient(chainId);
    const previousSession = {
      ...signClient.test.session,
      namespaces: {
        cosmos: {
          ...signClient.test.session.namespaces.cosmos,
          accounts: [`cosmos:${chainId}:${previousAddress}`],
        },
      },
      sessionProperties: { keys: JSON.stringify([previousKey]) },
      topic: "previous-topic",
    };
    const latestSession = {
      ...signClient.test.session,
      namespaces: {
        cosmos: {
          ...signClient.test.session.namespaces.cosmos,
          accounts: [`cosmos:${chainId}:${latestKey.bech32Address}`],
        },
      },
      requiredNamespaces: {},
      sessionProperties: { keys: JSON.stringify([latestKey]) },
      topic: "latest-topic",
    };
    signClient.session.getAll.mockReturnValue([previousSession, latestSession] as never);
    useGrazInternalStore.setState({
      chains: [makeChainInfo(chainId)],
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });
    useGrazSessionStore.setState({
      accounts: { [chainId]: latestKey as unknown as Key },
      activeChainIds: [chainId],
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    const signer = await getWalletConnect().getOfflineSignerAuto(chainId);
    await expect(signer.getAccounts()).resolves.toMatchObject([
      {
        address: latestKey.bech32Address,
      },
    ]);

    await expect(
      "signDirect" in signer
        ? signer.signDirect(latestKey.bech32Address, {
            accountNumber: 7n,
            authInfoBytes: new Uint8Array([1]),
            bodyBytes: new Uint8Array([2]),
            chainId,
          })
        : Promise.reject(new Error("Expected direct signer")),
    ).resolves.toBeDefined();
    expect(signClient.request).toHaveBeenLastCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({ method: "cosmos_signDirect" }),
        topic: "latest-topic",
      }),
    );
  });

  it("requests accounts for existing sessions without session properties", async () => {
    const chainId = "cosmoshub-4";
    const signClient = makeSignClient(chainId, { includeSessionProperties: false });
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
      wcSignClients,
    });

    const wallet = getWalletConnect();

    await expect(wallet.getKey(chainId)).resolves.toMatchObject({
      bech32Address: getWalletConnectAddress(chainId),
    });
    expect(signClient.request).toHaveBeenCalledWith({
      chainId: `cosmos:${chainId}`,
      request: {
        method: "cosmos_getAccounts",
        params: {},
      },
      topic: "topic-1",
    });
  });

  it("does not reuse a stored account outside the latest approved identity", async () => {
    const chainId = "cosmoshub-4";
    const signClient = makeSignClient(chainId, { includeSessionProperties: false });
    const staleChainId = "osmosis-1";
    useGrazInternalStore.setState({
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });
    useGrazSessionStore.setState({
      accounts: {
        [chainId]: makeWalletConnectKey(chainId, {
          address: getWalletConnectAddressBytes(staleChainId),
          bech32Address: getWalletConnectAddress(staleChainId),
        }) as unknown as Key,
      },
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    const signer = await getWalletConnect().getOfflineSignerAuto(chainId);

    expect("signDirect" in signer).toBe(true);
    expect(signClient.request).toHaveBeenCalledTimes(1);
    expect(signClient.request).toHaveBeenCalledWith({
      chainId: `cosmos:${chainId}`,
      request: {
        method: "cosmos_getAccounts",
        params: {},
      },
      topic: "topic-1",
    });
  });

  it("requests accounts for an offline signer when no stored account exists", async () => {
    const chainId = "cosmoshub-4";
    const signClient = makeSignClient(chainId, { includeSessionProperties: false });
    useGrazInternalStore.setState({
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });
    useGrazSessionStore.setState({
      accounts: null,
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    const signer = await getWalletConnect().getOfflineSignerAuto(chainId);

    expect("signDirect" in signer).toBe(true);
    expect(signClient.request).toHaveBeenCalledTimes(1);
    expect(signClient.request).toHaveBeenCalledWith({
      chainId: `cosmos:${chainId}`,
      request: {
        method: "cosmos_getAccounts",
        params: {},
      },
      topic: "topic-1",
    });
  });

  it("requests accounts when stored session properties do not include the requested chain", async () => {
    const chainId = "cosmoshub-4";
    const signClient = makeSignClient(chainId, { sessionPropertiesChainId: "osmosis-1" });
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
      wcSignClients,
    });

    const wallet = getWalletConnect();

    await expect(wallet.getKey(chainId)).resolves.toMatchObject({
      bech32Address: getWalletConnectAddress(chainId),
    });
    expect(signClient.request).toHaveBeenCalledWith({
      chainId: `cosmos:${chainId}`,
      request: {
        method: "cosmos_getAccounts",
        params: {},
      },
      topic: "topic-1",
    });
  });

  it("keeps a reused session and previous accounts when approved key materialization fails", async () => {
    const chainId = "cosmoshub-4";
    const additionalChainId = "neutron-1";
    const previousChainId = "osmosis-1";
    const signClient = makeSignClient(chainId);
    signClient.test.session.namespaces.cosmos.accounts.push(
      `cosmos:${additionalChainId}:${getWalletConnectAddress(additionalChainId)}`,
    );
    useGrazInternalStore.setState({
      chains: [makeChainInfo(chainId), makeChainInfo(additionalChainId)],
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });
    const previousAccount = makeWalletConnectKey(previousChainId) as unknown as Key;
    useGrazSessionStore.setState({
      accounts: { [previousChainId]: previousAccount },
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    await expect(getWalletConnect().enable([chainId])).rejects.toThrow(
      `Expected cosmos_getAccounts for cosmos:${chainId}, received cosmos:${additionalChainId}`,
    );
    expect(signClient.disconnect).not.toHaveBeenCalled();
    expect(useGrazSessionStore.getState().accounts).toEqual({ [previousChainId]: previousAccount });
  });

  it("does not update accounts when reused-session materialization resolves after timeout", async () => {
    vi.useFakeTimers();
    const chainId = "cosmoshub-4";
    const previousChainId = "osmosis-1";
    const signClient = makeSignClient(chainId, { includeSessionProperties: false });
    let resolveAccounts!: (accounts: ReturnType<typeof makeWalletConnectKey>[]) => void;
    const accounts = new Promise<ReturnType<typeof makeWalletConnectKey>[]>((resolve) => {
      resolveAccounts = resolve;
    });
    signClient.request.mockImplementationOnce(() => accounts);
    useGrazInternalStore.setState({
      chains: [makeChainInfo(chainId)],
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });
    const previousAccount = makeWalletConnectKey(previousChainId) as unknown as Key;
    useGrazSessionStore.setState({
      accounts: { [previousChainId]: previousAccount },
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    const enable = getWalletConnect().enable([chainId]);
    const timeout = expect(enable).rejects.toThrow("Connection timeout");
    await vi.advanceTimersByTimeAsync(15_000);

    await timeout;
    expect(useGrazSessionStore.getState().accounts).toEqual({ [previousChainId]: previousAccount });

    resolveAccounts([makeWalletConnectKey(chainId)]);
    await vi.advanceTimersByTimeAsync(0);

    expect(useGrazSessionStore.getState().accounts).toEqual({ [previousChainId]: previousAccount });
  });

  it("disconnects a multi-chain session only once", async () => {
    const chainId = "cosmoshub-4";
    const additionalChainId = "neutron-1";
    const signClient = makeSignClient(chainId);
    signClient.test.session.namespaces.cosmos.accounts.push(
      `cosmos:${additionalChainId}:${getWalletConnectAddress(additionalChainId)}`,
    );
    useGrazInternalStore.setState({
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });
    useGrazSessionStore.setState({
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    const disable = getWalletConnect().disable as unknown as (chainIds: string[]) => Promise<void>;
    await expect(disable([chainId, additionalChainId])).resolves.toBeUndefined();
    expect(signClient.disconnect).toHaveBeenCalledTimes(1);
    expect(signClient.disconnect).toHaveBeenCalledWith(expect.objectContaining({ topic: "topic-1" }));
  });

  it("coalesces concurrent disconnects for the same session topic", async () => {
    const chainId = "cosmoshub-4";
    const signClient = makeSignClient(chainId);
    let resolveDisconnect!: () => void;
    const disconnecting = new Promise<void>((resolve) => {
      resolveDisconnect = resolve;
    });
    const disconnect = signClient.disconnect.getMockImplementation();
    let disconnected = false;
    signClient.disconnect.mockImplementation(async (params) => {
      await disconnecting;
      if (disconnected) {
        throw new Error("Missing or invalid. Record was recently deleted - session: topic-1");
      }
      disconnected = true;
      await disconnect?.(params);
    });
    useGrazInternalStore.setState({
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });
    useGrazSessionStore.setState({
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    const firstDisable = getWalletConnect().disable as () => Promise<void>;
    const secondDisable = getWalletConnect().disable as () => Promise<void>;
    const disconnects = Promise.all([firstDisable(), secondDisable()]);
    resolveDisconnect();

    await expect(disconnects).resolves.toEqual([undefined, undefined]);
    expect(signClient.disconnect).toHaveBeenCalledTimes(1);
  });

  it.each([
    "Missing or invalid. Record was recently deleted - session: topic-1",
    "Missing or invalid. session topic does not exist in keychain: topic-1",
  ])("treats an already invalid WalletConnect session as disconnected: %s", async (message) => {
    const chainId = "cosmoshub-4";
    const signClient = makeSignClient(chainId);
    signClient.disconnect.mockImplementationOnce(async () => {
      signClient.session.getAll.mockReturnValue([]);
      throw new Error(message);
    });
    useGrazInternalStore.setState({
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });
    useGrazSessionStore.setState({
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    await expect(getWalletConnect().disable?.()).resolves.toBeUndefined();
    expect(useGrazSessionStore.getState().wcSignClients.get(WalletType.WALLETCONNECT)).toBe(signClient);
  });

  it("does not hide other WalletConnect disconnect failures", async () => {
    const chainId = "cosmoshub-4";
    const signClient = makeSignClient(chainId);
    signClient.disconnect.mockRejectedValueOnce(new Error("Relay unavailable"));
    useGrazInternalStore.setState({
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });
    useGrazSessionStore.setState({
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    await expect(getWalletConnect().disable?.()).rejects.toThrow("Relay unavailable");
  });
});
