import { beforeEach, describe, expect, it, vi } from "vitest";
import { encodeSecp256k1Pubkey } from "@cosmjs/amino";
import { fromBech32, toBase64, toBech32 } from "@cosmjs/encoding";

const walletConnectModalMock = vi.hoisted(() => {
  const instances: Array<{
    closeModal: ReturnType<typeof vi.fn>;
    config: unknown;
    openModal: ReturnType<typeof vi.fn>;
    subscribeModal: ReturnType<typeof vi.fn>;
  }> = [];

  return {
    instances,
  };
});

vi.mock("@walletconnect/modal", () => ({
  WalletConnectModal: vi.fn(function WalletConnectModal(config: unknown) {
    const instance = {
      closeModal: vi.fn(),
      config,
      openModal: vi.fn().mockResolvedValue(undefined),
      subscribeModal: vi.fn(),
    };
    walletConnectModalMock.instances.push(instance);
    return instance;
  }),
}));

import { useGrazInternalStore, useGrazSessionStore } from "../../../store";
import { WalletType } from "../../../types/wallet";
import { makeChainInfo } from "../../../__tests__/fixtures";
import { getWalletConnect } from "../wallet-connect";

type WalletConnectStoredKey = {
  address: number[];
  algo: string;
  bech32Address: string;
  chainId: string;
  isKeystone: boolean;
  isNanoLedger: boolean;
  name: string;
  pubKey: string;
};

const getWalletConnectAddressBytes = (chainId: string) =>
  Uint8Array.from({ length: 20 }, (_, index) => chainId.charCodeAt(index % chainId.length));

const getWalletConnectAddress = (chainId: string) => toBech32("cosmos", getWalletConnectAddressBytes(chainId));

const makeWalletConnectKey = (chainId: string): WalletConnectStoredKey => ({
  address: Array.from(getWalletConnectAddressBytes(chainId)),
  algo: "secp256k1",
  bech32Address: getWalletConnectAddress(chainId),
  chainId,
  isKeystone: false,
  isNanoLedger: false,
  name: `${chainId} account`,
  pubKey: Buffer.from(new Uint8Array([4, 5, 6])).toString("base64"),
});

const getWalletConnectChainId = (chainId: string) => chainId.split(":")[1] || chainId;

const makeApprovedSession = (keys: WalletConnectStoredKey[], includeSessionProperties = true) => ({
  expiry: Math.floor(Date.now() / 1000) + 60,
  namespaces: {
    cosmos: {
      accounts: keys.map((key) => `cosmos:${key.chainId}:${key.bech32Address}`),
      events: ["chainChanged", "accountsChanged"],
      methods: ["cosmos_getAccounts", "cosmos_signAmino", "cosmos_signDirect"],
    },
  },
  ...(includeSessionProperties
    ? {
        sessionProperties: {
          keys: JSON.stringify(keys),
        },
      }
    : {}),
  topic: "topic-1",
});

describe("WalletConnect first-session flow", () => {
  beforeEach(() => {
    walletConnectModalMock.instances.length = 0;
    useGrazInternalStore.setState({
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });
  });

  it("opens the modal, approves a new session, and stores approved accounts", async () => {
    const cosmoshub = makeWalletConnectKey("cosmoshub-4");
    const osmosis = makeWalletConnectKey("osmosis-1");
    const approval = vi.fn().mockResolvedValue(makeApprovedSession([cosmoshub, osmosis]));
    const signClient = {
      connect: vi.fn().mockResolvedValue({
        approval,
        uri: "wc:topic",
      }),
      session: {
        getAll: vi.fn(() => []),
      },
    };
    useGrazSessionStore.setState({
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });
    useGrazInternalStore.setState({
      chains: [makeChainInfo(cosmoshub.chainId), makeChainInfo(osmosis.chainId)],
    });

    const wallet = getWalletConnect();

    await expect(wallet.enable([cosmoshub.chainId, osmosis.chainId])).resolves.toBeUndefined();

    expect(signClient.connect).toHaveBeenCalledWith({
      optionalNamespaces: {
        cosmos: {
          chains: [`cosmos:${cosmoshub.chainId}`, `cosmos:${osmosis.chainId}`],
          events: ["chainChanged", "accountsChanged"],
          methods: ["cosmos_getAccounts", "cosmos_signAmino", "cosmos_signDirect"],
        },
      },
    });
    expect(approval).toHaveBeenCalledTimes(1);
    expect(walletConnectModalMock.instances[0]?.openModal).toHaveBeenCalledWith({ uri: "wc:topic" });
    expect(walletConnectModalMock.instances[0]?.closeModal).toHaveBeenCalledTimes(1);
    expect(useGrazSessionStore.getState().accounts).toMatchObject({
      [cosmoshub.chainId]: {
        bech32Address: cosmoshub.bech32Address,
      },
      [osmosis.chainId]: {
        bech32Address: osmosis.bech32Address,
      },
    });
  });

  it("passes custom mobile and desktop wallet lists to the WalletConnect modal", async () => {
    const chainId = "cosmoshub-4";
    const approval = vi.fn().mockResolvedValue(makeApprovedSession([makeWalletConnectKey(chainId)]));
    const signClient = {
      connect: vi.fn().mockResolvedValue({
        approval,
        uri: "wc:topic",
      }),
      session: {
        getAll: vi.fn(() => []),
      },
    };
    const mobileWallets = [
      {
        id: "keplr-mobile",
        name: "Keplr Mobile",
        links: {
          native: "keplrwallet://",
          universal: "https://keplr.app",
        },
      },
    ];
    const desktopWallets = [
      {
        id: "keplr-desktop",
        name: "Keplr Desktop",
        links: {
          native: "keplrwallet://",
          universal: "https://keplr.app",
        },
      },
    ];
    useGrazInternalStore.setState({
      chains: [makeChainInfo(chainId)],
      walletConnect: {
        options: {
          projectId: "project-id",
        },
        walletConnectModal: {
          desktopWallets,
          mobileWallets,
        },
      },
    });
    useGrazSessionStore.setState({
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    const wallet = getWalletConnect();

    await expect(wallet.enable([chainId])).resolves.toBeUndefined();

    expect(walletConnectModalMock.instances[0]?.config).toMatchObject({
      desktopWallets,
      mobileWallets,
      projectId: "project-id",
    });
  });

  it("requests accounts when an approved session does not include session properties", async () => {
    const chainId = "cosmoshub-4";
    const approval = vi.fn().mockResolvedValue(makeApprovedSession([makeWalletConnectKey(chainId)], false));
    const signClient = {
      connect: vi.fn().mockResolvedValue({
        approval,
        uri: "wc:topic",
      }),
      request: vi.fn(({ chainId: requestChainId }) => [makeWalletConnectKey(getWalletConnectChainId(requestChainId))]),
      session: {
        getAll: vi.fn(() => []),
      },
    };
    useGrazSessionStore.setState({
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });
    useGrazInternalStore.setState({
      chains: [makeChainInfo(chainId)],
    });

    const wallet = getWalletConnect();

    await expect(wallet.enable([chainId])).resolves.toBeUndefined();

    expect(signClient.request).toHaveBeenCalledWith({
      chainId: `cosmos:${chainId}`,
      request: {
        method: "cosmos_getAccounts",
        params: {},
      },
      topic: "topic-1",
    });
    expect(useGrazSessionStore.getState().accounts).toMatchObject({
      [chainId]: {
        bech32Address: getWalletConnectAddress(chainId),
      },
    });
  });

  it("normalizes standard Cosmos RPC accounts without session properties", async () => {
    const chainId = "dimension_37-1";
    const address = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    const bech32Address = "xpla1qypqxpq9qcrsszg2pvxq6rs0zqg3yyc5p95zd0";
    const pubKey = Uint8Array.from([4, 5, 6]);
    const encodedPubKey = toBase64(pubKey);
    const approved = {
      ...makeWalletConnectKey(chainId),
      address: [...address],
      bech32Address,
      pubKey: encodedPubKey,
    };
    const approval = vi.fn().mockResolvedValue(makeApprovedSession([approved], false));
    const signClient = {
      connect: vi.fn().mockResolvedValue({ approval, uri: "wc:topic" }),
      request: vi.fn().mockResolvedValue([
        {
          address: bech32Address,
          algo: "secp256k1",
          pubkey: encodedPubKey,
        },
      ]),
      session: { getAll: vi.fn(() => []) },
    };
    useGrazInternalStore.setState({ chains: [makeChainInfo(chainId)] });
    useGrazSessionStore.setState({
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    await expect(getWalletConnect().enable([chainId])).resolves.toBeUndefined();

    expect(Object.keys(useGrazSessionStore.getState().accounts ?? {})).toEqual([chainId]);
    expect(useGrazSessionStore.getState().accounts?.[chainId]).toMatchObject({
      address,
      bech32Address,
      pubKey,
    });
  });

  it("reuses a materialized approved account for offline signing", async () => {
    const chainId = "dimension_37-1";
    const bech32Address = "xpla1qypqxpq9qcrsszg2pvxq6rs0zqg3yyc5p95zd0";
    const encodedPubKey = toBase64(new Uint8Array([4, 5, 6]));
    const approved = {
      ...makeWalletConnectKey(chainId),
      bech32Address,
      pubKey: encodedPubKey,
    };
    const session = makeApprovedSession([approved], false);
    let sessions: ReturnType<typeof makeApprovedSession>[] = [];
    const approval = vi.fn(async () => {
      sessions = [session];
      return session;
    });
    const request = vi.fn(async ({ request }: { chainId: string; request: { method: string } }) => {
      if (request.method === "cosmos_getAccounts") {
        return [{ address: bech32Address, algo: "secp256k1", pubkey: encodedPubKey }];
      }
      if (request.method === "cosmos_signDirect") {
        return {
          signature: {
            pub_key: { type: "tendermint/PubKeySecp256k1", value: encodedPubKey },
            signature: "signature",
          },
          signed: {
            accountNumber: "7",
            authInfoBytes: toBase64(new Uint8Array([1])),
            bodyBytes: toBase64(new Uint8Array([2])),
            chainId,
          },
        };
      }
      throw new Error(`Unexpected WalletConnect method: ${request.method}`);
    });
    const signClient = {
      connect: vi.fn().mockResolvedValue({ approval, uri: "wc:topic" }),
      request,
      session: { getAll: vi.fn(() => sessions) },
    };
    useGrazInternalStore.setState({ chains: [makeChainInfo(chainId)] });
    useGrazSessionStore.setState({
      accounts: null,
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    const wallet = getWalletConnect();
    await expect(wallet.enable([chainId])).resolves.toBeUndefined();
    expect(request).toHaveBeenCalledTimes(1);

    const signer = await wallet.getOfflineSignerAuto(chainId);
    await expect(signer.getAccounts()).resolves.toMatchObject([{ address: bech32Address }]);
    expect(request).toHaveBeenCalledTimes(1);

    await expect(
      "signDirect" in signer
        ? signer.signDirect(bech32Address, {
            accountNumber: 7n,
            authInfoBytes: new Uint8Array([1]),
            bodyBytes: new Uint8Array([2]),
            chainId,
          })
        : Promise.reject(new Error("Expected direct signer")),
    ).resolves.toBeDefined();
    expect(request.mock.calls.map(([call]) => call.request.method)).toEqual([
      "cosmos_getAccounts",
      "cosmos_signDirect",
    ]);
  });

  it("restores a persisted approved public key before offline signing", async () => {
    const chainId = "dimension_37-1";
    const bech32Address = "xpla1lg22287cj523vgdah8z4287nuzct43tmdtj69w";
    const encodedPubKey = "A3m6JXpt05gNs8LQJhrNd+8vSzBstrWRGfsRdzmrjPVi";
    const approved = {
      ...makeWalletConnectKey(chainId),
      bech32Address,
      pubKey: encodedPubKey,
    };
    const session = makeApprovedSession([approved], false);
    const request = vi.fn().mockResolvedValue([
      {
        address: bech32Address,
        algo: "secp256k1",
        pubkey: encodedPubKey,
      },
    ]);
    const signClient = {
      connect: vi.fn().mockResolvedValue({ approval: vi.fn().mockResolvedValue(session), uri: "wc:topic" }),
      request,
      session: { getAll: vi.fn(() => [session]) },
    };
    useGrazInternalStore.setState({ chains: [makeChainInfo(chainId)] });
    useGrazSessionStore.setState({
      accounts: null,
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    const wallet = getWalletConnect();
    await wallet.enable([chainId]);
    const persistedAccounts = JSON.parse(
      JSON.stringify(useGrazSessionStore.getState().accounts),
    ) as NonNullable<ReturnType<typeof useGrazSessionStore.getState>["accounts"]>;
    useGrazSessionStore.setState({ accounts: persistedAccounts });

    const signer = await wallet.getOfflineSignerAuto(chainId);
    const [account] = await signer.getAccounts();
    if (!account) throw new Error("Expected an offline signer account");

    expect(() => encodeSecp256k1Pubkey(account.pubkey)).not.toThrow();
    expect(request).toHaveBeenCalledTimes(1);
  });

  it.each(["dimension_37-1", "cosmos:dimension_37-1"])(
    "normalizes standard Cosmos RPC account chain ID %s",
    async (responseChainId) => {
      const chainId = "dimension_37-1";
      const bech32Address = "xpla1qypqxpq9qcrsszg2pvxq6rs0zqg3yyc5p95zd0";
      const encodedPubKey = toBase64(new Uint8Array([4, 5, 6]));
      const approved = {
        ...makeWalletConnectKey(chainId),
        bech32Address,
      };
      const session = makeApprovedSession([approved], false);
      const signClient = {
        request: vi.fn().mockResolvedValue([
          {
            address: bech32Address,
            algo: "secp256k1",
            chainId: responseChainId,
            pubkey: encodedPubKey,
          },
        ]),
        session: { getAll: vi.fn(() => [session]) },
      };
      useGrazInternalStore.setState({ chains: [makeChainInfo(chainId)] });
      useGrazSessionStore.setState({
        accounts: null,
        wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
      });

      await expect(getWalletConnect().enable([chainId])).resolves.toBeUndefined();
      expect(useGrazSessionStore.getState().accounts?.[chainId]?.bech32Address).toBe(bech32Address);
    },
  );

  it("rejects a standard Cosmos RPC account with a non-Cosmos CAIP-2 chain ID", async () => {
    const chainId = "dimension_37-1";
    const bech32Address = "xpla1qypqxpq9qcrsszg2pvxq6rs0zqg3yyc5p95zd0";
    const approved = {
      ...makeWalletConnectKey(chainId),
      bech32Address,
    };
    const session = makeApprovedSession([approved], false);
    const signClient = {
      request: vi.fn().mockResolvedValue([
        {
          address: bech32Address,
          algo: "secp256k1",
          chainId: `eip155:${chainId}`,
          pubkey: toBase64(new Uint8Array([4, 5, 6])),
        },
      ]),
      session: { getAll: vi.fn(() => [session]) },
    };
    useGrazInternalStore.setState({ chains: [makeChainInfo(chainId)] });
    useGrazSessionStore.setState({
      accounts: null,
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    await expect(getWalletConnect().enable([chainId])).rejects.toThrow(
      `No WalletConnect accounts for approved chains: ${chainId}`,
    );
    expect(useGrazSessionStore.getState().accounts).toBeNull();
  });

  it("derives a legacy account byte address from its approved bech32 address", async () => {
    const chainId = "dimension_37-1";
    const bech32Address = "xpla1qypqxpq9qcrsszg2pvxq6rs0zqg3yyc5p95zd0";
    const approved = {
      ...makeWalletConnectKey(chainId),
      address: [99, 98, 97],
      bech32Address,
    };
    const session = makeApprovedSession([approved]);
    const signClient = {
      request: vi.fn(),
      session: { getAll: vi.fn(() => [session]) },
    };
    useGrazInternalStore.setState({ chains: [makeChainInfo(chainId)] });
    useGrazSessionStore.setState({
      accounts: null,
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    await expect(getWalletConnect().enable([chainId])).resolves.toBeUndefined();

    expect(useGrazSessionStore.getState().accounts?.[chainId]?.address).toEqual(fromBech32(bech32Address).data);
    expect(signClient.request).not.toHaveBeenCalled();
  });

  it("rejects a standard Cosmos RPC account outside the approved namespace", async () => {
    const chainId = "dimension_37-1";
    const approvedAddress = "xpla1qypqxpq9qcrsszg2pvxq6rs0zqg3yyc5p95zd0";
    const responseAddress = "xpla1zsf3yygspu8q6rqtpgysspcxq5zqxqspn7xtws";
    const approved = {
      ...makeWalletConnectKey(chainId),
      bech32Address: approvedAddress,
    };
    const session = makeApprovedSession([approved], false);
    const signClient = {
      request: vi.fn().mockResolvedValue([
        {
          address: responseAddress,
          algo: "secp256k1",
          pubkey: toBase64(new Uint8Array([4, 5, 6])),
        },
      ]),
      session: { getAll: vi.fn(() => [session]) },
    };
    useGrazInternalStore.setState({ chains: [makeChainInfo(chainId)] });
    useGrazSessionStore.setState({
      accounts: null,
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    await expect(getWalletConnect().enable([chainId])).rejects.toThrow(
      `No WalletConnect accounts for approved chains: ${chainId}`,
    );
    expect(useGrazSessionStore.getState().accounts).toBeNull();
  });

  it("materializes the approved configured subset, including configured chains outside the request", async () => {
    const requested = makeWalletConnectKey("cosmoshub-4");
    const omitted = makeWalletConnectKey("osmosis-1");
    const additional = makeWalletConnectKey("neutron-1");
    const approval = vi.fn().mockResolvedValue(makeApprovedSession([requested, additional]));
    const signClient = {
      connect: vi.fn().mockResolvedValue({ approval, uri: "wc:topic" }),
      session: { getAll: vi.fn(() => []) },
    };
    useGrazInternalStore.setState({
      chains: [makeChainInfo(requested.chainId), makeChainInfo(omitted.chainId), makeChainInfo(additional.chainId)],
    });
    useGrazSessionStore.setState({
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    const wallet = getWalletConnect();

    await expect(wallet.enable([requested.chainId, omitted.chainId])).resolves.toBeUndefined();
    expect(useGrazSessionStore.getState().accounts).toMatchObject({
      [requested.chainId]: { bech32Address: requested.bech32Address },
      [additional.chainId]: { bech32Address: additional.bech32Address },
    });
    expect(useGrazSessionStore.getState().accounts?.[omitted.chainId]).toBeUndefined();
  });

  it("starts a fresh connection when the latest session has no requested account overlap", async () => {
    const requested = makeWalletConnectKey("cosmoshub-4");
    const existing = makeWalletConnectKey("osmosis-1");
    const approval = vi.fn().mockResolvedValue({
      ...makeApprovedSession([requested]),
      topic: "fresh-topic",
    });
    const signClient = {
      connect: vi.fn().mockResolvedValue({ approval, uri: "wc:fresh-topic" }),
      session: { getAll: vi.fn(() => [makeApprovedSession([existing])]) },
    };
    useGrazInternalStore.setState({
      chains: [makeChainInfo(requested.chainId), makeChainInfo(existing.chainId)],
    });
    useGrazSessionStore.setState({
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    await expect(getWalletConnect().enable([requested.chainId])).resolves.toBeUndefined();
    expect(signClient.connect).toHaveBeenCalledTimes(1);
    expect(useGrazSessionStore.getState().accounts?.[requested.chainId]).toMatchObject({
      bech32Address: requested.bech32Address,
    });
  });

  it("disconnects an expired latest session before starting a fresh connection", async () => {
    const requested = makeWalletConnectKey("cosmoshub-4");
    const expiredSession = {
      ...makeApprovedSession([requested]),
      expiry: Math.floor(Date.now() / 1000) - 1,
      topic: "expired-topic",
    };
    const approval = vi.fn().mockResolvedValue({
      ...makeApprovedSession([requested]),
      topic: "fresh-topic",
    });
    const disconnect = vi.fn().mockResolvedValue(undefined);
    const signClient = {
      connect: vi.fn().mockResolvedValue({ approval, uri: "wc:fresh-topic" }),
      core: {
        pairing: {
          pairings: {
            delete: vi.fn(),
            getAll: vi.fn(() => []),
          },
        },
      },
      disconnect,
      session: { getAll: vi.fn(() => [expiredSession]) },
    };
    useGrazInternalStore.setState({ chains: [makeChainInfo(requested.chainId)] });
    useGrazSessionStore.setState({
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    await expect(getWalletConnect().enable([requested.chainId])).resolves.toBeUndefined();
    expect(disconnect).toHaveBeenCalledWith(expect.objectContaining({ topic: expiredSession.topic }));
    expect(signClient.connect).toHaveBeenCalledTimes(1);
  });

  it("disconnects a fresh session and preserves accounts when approved key materialization fails", async () => {
    const requested = makeWalletConnectKey("cosmoshub-4");
    const additional = makeWalletConnectKey("neutron-1");
    const previous = makeWalletConnectKey("osmosis-1");
    const approvedSession = makeApprovedSession([requested, additional]);
    approvedSession.sessionProperties = {
      keys: JSON.stringify([requested]),
    };
    const approval = vi.fn().mockResolvedValue(approvedSession);
    const disconnect = vi.fn().mockResolvedValue(undefined);
    const signClient = {
      connect: vi.fn().mockResolvedValue({ approval, uri: "wc:topic" }),
      core: {
        pairing: {
          pairings: {
            delete: vi.fn(),
            getAll: vi.fn(() => []),
          },
        },
      },
      disconnect,
      request: vi.fn().mockRejectedValue(new Error("account request failed")),
      session: { getAll: vi.fn(() => []) },
    };
    useGrazInternalStore.setState({
      chains: [makeChainInfo(requested.chainId), makeChainInfo(additional.chainId)],
    });
    useGrazSessionStore.setState({
      accounts: { [previous.chainId]: previous as never },
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    const wallet = getWalletConnect();

    await expect(wallet.enable([requested.chainId])).rejects.toThrow("account request failed");
    expect(disconnect).toHaveBeenCalledWith(
      expect.objectContaining({
        topic: approvedSession.topic,
      }),
    );
    expect(useGrazSessionStore.getState().accounts).toEqual({ [previous.chainId]: previous });
  });

  it("rejects and disconnects a fresh session without an approved configured account", async () => {
    const requested = makeWalletConnectKey("cosmoshub-4");
    const unconfigured = makeWalletConnectKey("neutron-1");
    const approvedSession = makeApprovedSession([unconfigured]);
    const approval = vi.fn().mockResolvedValue(approvedSession);
    const disconnect = vi.fn().mockResolvedValue(undefined);
    const signClient = {
      connect: vi.fn().mockResolvedValue({ approval, uri: "wc:topic" }),
      core: {
        pairing: {
          pairings: {
            delete: vi.fn(),
            getAll: vi.fn(() => []),
          },
        },
      },
      disconnect,
      session: { getAll: vi.fn(() => []) },
    };
    useGrazInternalStore.setState({ chains: [makeChainInfo(requested.chainId)] });
    useGrazSessionStore.setState({
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    await expect(getWalletConnect().enable([requested.chainId])).rejects.toThrow(
      "No approved WalletConnect accounts for configured chains",
    );
    expect(disconnect).toHaveBeenCalledWith(expect.objectContaining({ topic: approvedSession.topic }));
  });

  it("rejects a new session without a WalletConnect URI", async () => {
    const signClient = {
      connect: vi.fn().mockResolvedValue({
        approval: vi.fn(),
        uri: undefined,
      }),
      session: {
        getAll: vi.fn(() => []),
      },
    };
    useGrazSessionStore.setState({
      wcSignClients: new Map([[WalletType.WALLETCONNECT, signClient as never]]),
    });

    const wallet = getWalletConnect();

    await expect(wallet.enable(["cosmoshub-4"])).rejects.toThrow("No wallet connect uri");
  });
});
