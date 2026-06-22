import { toBech32 } from "@cosmjs/encoding";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeChainInfo } from "../../../__tests__/fixtures";
import { useGrazInternalStore, useGrazSessionStore } from "../../../store";
import { WalletType, type Key } from "../../../types/wallet";
import { getInitia } from "../initia";
import { getPara } from "../para";
import { getStation } from "../station";
import { getVectis } from "../vectis";

const makeKey = (chainId: string): Key => ({
  address: new Uint8Array([1, 2, 3]),
  algo: "secp256k1",
  bech32Address: `${chainId}1address`,
  isKeystone: false,
  isNanoLedger: false,
  name: `${chainId} account`,
  pubKey: new Uint8Array([4, 5, 6]),
});

const directSignResponse = {
  signature: {
    pub_key: {
      type: "tendermint/PubKeySecp256k1",
      value: "pubkey",
    },
    signature: "signature",
  },
  signed: {
    accountNumber: {
      toString: () => "7",
    },
    authInfoBytes: new Uint8Array([1]),
    bodyBytes: new Uint8Array([2]),
    chainId: "cosmoshub-4",
  },
};

const setWindowValue = (key: string, value: unknown) => {
  Object.defineProperty(window, key, {
    configurable: true,
    value,
    writable: true,
  });
};

describe("specialized wallet adapters", () => {
  beforeEach(() => {
    for (const key of ["initia", "station", "vectis"]) {
      Reflect.deleteProperty(window, key);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("adapts Station key, signing, chain suggestion, and subscription behavior", async () => {
    const chain = makeChainInfo();
    const aminoSigner = {
      getAccounts: vi.fn(),
      signAmino: vi.fn(),
    };
    const station = {
      disable: vi.fn().mockResolvedValue(undefined),
      enable: vi.fn().mockResolvedValue(undefined),
      experimentalSuggestChain: vi.fn().mockResolvedValue(undefined),
      getKey: vi.fn().mockResolvedValue({
        address: new Uint8Array([1, 2, 3]),
        algo: "secp256k1",
        bech32Address: "station1address",
        isNanoLedger: false,
        name: "Station",
        pubKey: new Uint8Array([4, 5, 6]),
      }),
      getOfflineSignerAuto: vi.fn(() => aminoSigner),
      getOfflineSignerOnlyAmino: vi.fn(() => aminoSigner),
      signAmino: vi.fn().mockResolvedValue({ signed: {}, signature: {} }),
      signDirect: vi.fn(),
    };
    setWindowValue("station", { keplr: station });

    const wallet = getStation();
    const reconnect = vi.fn();
    const cleanup = wallet.subscription?.(reconnect);

    window.dispatchEvent(new Event("station_wallet_change"));

    await expect(wallet.getKey(chain.chainId)).resolves.toMatchObject({
      isKeystone: false,
      name: "Station",
    });
    await expect(wallet.experimentalSuggestChain(chain)).resolves.toBeUndefined();
    expect(station.experimentalSuggestChain).toHaveBeenCalledWith(
      expect.objectContaining({
        chainId: chain.chainId,
        chainSymbolImageUrl: "",
      }),
    );
    expect(() =>
      wallet.getOfflineSigner(chain.chainId).signDirect("signer", {
        accountNumber: 1n,
        authInfoBytes: new Uint8Array(),
        bodyBytes: new Uint8Array(),
        chainId: chain.chainId,
      }),
    ).toThrow("signDirect not supported by Station");
    expect(reconnect).toHaveBeenCalledTimes(1);
    cleanup?.();
  });

  it("adapts Vectis signers, key shape, chain suggestion, and account-change subscription", async () => {
    const chain = makeChainInfo();
    const bech32Address = toBech32("cosmos", new Uint8Array(20).fill(1));
    const aminoSigner = {
      getAccounts: vi.fn(),
      signAmino: vi.fn(),
    };
    const directSigner = {
      getAccounts: vi.fn(),
      signAmino: vi.fn(),
      signDirect: vi.fn().mockResolvedValue(directSignResponse),
    };
    const vectis = {
      enable: vi.fn().mockResolvedValue(undefined),
      getKey: vi.fn().mockResolvedValue({
        address: bech32Address,
        algo: "secp256k1",
        isNanoLedger: true,
        name: "Vectis",
        pubKey: new Uint8Array([4, 5, 6]),
      }),
      getOfflineSigner: vi.fn(() => directSigner),
      getOfflineSignerAmino: vi.fn(() => aminoSigner),
      getOfflineSignerAuto: vi.fn().mockResolvedValue(directSigner),
      signAmino: vi.fn().mockResolvedValue({ signed: {}, signature: {} }),
      signDirect: vi.fn().mockResolvedValue(directSignResponse),
      suggestChains: vi.fn().mockResolvedValue(undefined),
    };
    setWindowValue("vectis", { cosmos: vectis });

    const wallet = getVectis();
    const reconnect = vi.fn();
    const cleanup = wallet.subscription?.(reconnect);

    window.dispatchEvent(new Event("vectis_accountChanged"));

    await expect(wallet.getKey(chain.chainId)).resolves.toMatchObject({
      bech32Address,
      isKeystone: false,
      isNanoLedger: true,
      name: "Vectis",
    });
    await expect(wallet.experimentalSuggestChain(chain)).resolves.toBeUndefined();
    expect(vectis.suggestChains).toHaveBeenCalledWith([
      expect.objectContaining({
        bech32Prefix: "cosmos",
        chainId: chain.chainId,
        prettyName: "CosmosHub",
      }),
    ]);
    await expect(wallet.signDirect(chain.chainId, "cosmos1signer", {
      accountNumber: 7n,
      authInfoBytes: new Uint8Array([1]),
      bodyBytes: new Uint8Array([2]),
      chainId: chain.chainId,
    })).resolves.toMatchObject({
      signed: {
        accountNumber: 7n,
      },
    });
    await expect(
      wallet.getOfflineSigner(chain.chainId).signDirect("cosmos1signer", {
        accountNumber: 7n,
        authInfoBytes: new Uint8Array([1]),
        bodyBytes: new Uint8Array([2]),
        chainId: chain.chainId,
      }),
    ).resolves.toMatchObject({
      signed: {
        accountNumber: 7n,
      },
    });
    expect(wallet.getOfflineSignerOnlyAmino(chain.chainId)).toBe(aminoSigner);
    await expect(wallet.getOfflineSignerAuto(chain.chainId)).resolves.toMatchObject({
      signDirect: expect.any(Function),
    });
    expect(reconnect).toHaveBeenCalledTimes(1);
    cleanup?.();
  });

  it("adapts Initia accounts, signers, arbitrary signatures, and chain suggestions", async () => {
    const chain = makeChainInfo();
    const account = {
      address: "init1address000000000000000000000000000000",
      algo: "secp256k1" as const,
      pubkey: new Uint8Array(33).fill(2),
    };
    const directSigner = {
      getAccounts: vi.fn().mockResolvedValue([account]),
      signDirect: vi.fn().mockResolvedValue({
        signature: { pub_key: { type: "type", value: "value" }, signature: "direct" },
        signed: {
          accountNumber: 1n,
          authInfoBytes: new Uint8Array([1]),
          bodyBytes: new Uint8Array([2]),
          chainId: chain.chainId,
        },
      }),
    };
    const aminoSigner = {
      signAmino: vi.fn().mockResolvedValue({ signed: {}, signature: {} }),
    };
    const initia = {
      getAddress: vi.fn().mockResolvedValue(account.address),
      getOfflineSigner: vi.fn(() => directSigner),
      getOfflineSignerOnlyAmino: vi.fn(() => aminoSigner),
      requestAddInitiaLayer: vi.fn().mockResolvedValue(undefined),
      signArbitrary: vi.fn().mockResolvedValue("arbitrary-signature"),
    };
    setWindowValue("initia", initia);

    const wallet = getInitia();

    await expect(wallet.enable([chain.chainId])).resolves.toBeUndefined();
    await expect(wallet.getKey(chain.chainId)).resolves.toMatchObject({
      algo: "secp256k1",
      bech32Address: account.address,
      isKeystone: false,
      name: "init1a...000000",
    });
    expect(wallet.getOfflineSigner(chain.chainId)).toMatchObject({
      getAccounts: expect.any(Function),
      signAmino: expect.any(Function),
      signDirect: expect.any(Function),
    });
    await expect(wallet.getOfflineSignerAuto(chain.chainId)).resolves.toBe(directSigner);
    expect(wallet.getOfflineSignerOnlyAmino(chain.chainId)).toBe(aminoSigner);
    await expect(wallet.experimentalSuggestChain(chain)).resolves.toBeUndefined();
    expect(initia.requestAddInitiaLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        bech32_prefix: "init",
        chain_id: chain.chainId,
      }),
    );
    await expect(wallet.signDirect(chain.chainId, account.address, {
      accountNumber: 1n,
      authInfoBytes: new Uint8Array([1]),
      bodyBytes: new Uint8Array([2]),
      chainId: chain.chainId,
    })).resolves.toMatchObject({
      signature: {
        signature: "direct",
      },
    });
    await expect(wallet.signArbitrary?.(chain.chainId, account.address, "hello")).resolves.toMatchObject({
      signature: "arbitrary-signature",
    });
  });

  it("initializes and delegates Para connector operations", async () => {
    const chain = makeChainInfo();
    const account = makeKey(chain.chainId);
    const connector = {
      disconnect: vi.fn().mockResolvedValue(undefined),
      enable: vi.fn().mockResolvedValue(undefined),
      getKey: vi.fn().mockResolvedValue(account),
      getOfflineSigner: vi.fn(() => ({ mode: "direct" })),
      getOfflineSignerAuto: vi.fn(() => Promise.resolve({ mode: "auto" })),
      getOfflineSignerOnlyAmino: vi.fn(() => ({ mode: "amino" })),
      getParaWebClient: vi.fn(() => ({
        logout: vi.fn().mockResolvedValue(undefined),
      })),
      signAmino: vi.fn().mockResolvedValue({ signed: {}, signature: {} }),
      signArbitrary: vi.fn().mockResolvedValue({ pub_key: {}, signature: "arbitrary" }),
      signDirect: vi.fn().mockResolvedValue({ signed: {}, signature: {} }),
    };
    const ConnectorClass = vi.fn(function Connector() {
      return connector;
    });
    useGrazInternalStore.setState({
      chains: [chain],
      paraConfig: {
        connectorClass: ConnectorClass,
        paraWeb: {},
      } as never,
    });

    const wallet = getPara();

    await expect(wallet.enable(chain.chainId)).resolves.toBeUndefined();
    expect(ConnectorClass).toHaveBeenCalledWith(expect.objectContaining({ paraWeb: {} }), [chain]);
    expect(connector.enable).toHaveBeenCalledWith([chain.chainId]);
    expect(useGrazSessionStore.getState()).toMatchObject({
      accounts: { [chain.chainId]: account },
      activeChainIds: [chain.chainId],
      paraConnector: connector,
      status: "connected",
    });
    expect(useGrazInternalStore.getState()).toMatchObject({
      _reconnectConnector: WalletType.PARA,
      recentChainIds: [chain.chainId],
      walletType: WalletType.PARA,
    });
    await expect(wallet.getKey(chain.chainId)).resolves.toBe(account);
    expect(wallet.getOfflineSigner(chain.chainId)).toEqual({ mode: "direct" });
    await expect(wallet.getOfflineSignerAuto(chain.chainId)).resolves.toEqual({ mode: "auto" });
    expect(wallet.getOfflineSignerOnlyAmino(chain.chainId)).toEqual({ mode: "amino" });
    await expect(wallet.experimentalSuggestChain(chain)).rejects.toThrow("Chain suggestion not supported");
    await expect(wallet.disable?.()).resolves.toBeUndefined();
    expect(connector.disconnect).toHaveBeenCalledTimes(1);
    expect(useGrazSessionStore.getState()).toMatchObject({
      paraConnector: null,
      status: "disconnected",
    });
  });
});
