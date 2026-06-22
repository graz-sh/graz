import { describe, expect, it, vi } from "vitest";

const cosmosSnapClient = vi.hoisted(() => ({
  deleteChain: vi.fn().mockResolvedValue(undefined),
  experimentalSuggestChain: vi.fn().mockResolvedValue(undefined),
  getKey: vi.fn(),
  getOfflineSigner: vi.fn(),
  getOfflineSignerOnlyAmino: vi.fn(),
  signAmino: vi.fn(),
  signArbitrary: vi.fn(),
  signDirect: vi.fn(),
}));
const installSnap = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const isSnapInstalled = vi.hoisted(() => vi.fn());

vi.mock("@cosmsnap/snapper", () => ({
  CosmosSnap: vi.fn(function CosmosSnap() {
    return cosmosSnapClient;
  }),
  installSnap,
  isSnapInstalled,
}));

import { makeChainInfo } from "../../../__tests__/fixtures";
import { getMetamaskSnapCosmos } from "../cosmos-metamask-snap";
import { getMetamaskSnap } from "../leap-metamask-snap";
import { getMetamaskSnapLeap } from "../leap-metamask-snap/leap";

type EthereumRequest = {
  method: string;
  params?: {
    request?: {
      method: string;
      params?: unknown;
    };
  };
};

const setWindowValue = (key: string, value: unknown) => {
  Object.defineProperty(window, key, {
    configurable: true,
    value,
    writable: true,
  });
};

describe("MetaMask Snap adapters", () => {
  it("initializes and delegates the Cosmos Snap adapter", async () => {
    const chain = makeChainInfo();
    const key = {
      address: new Uint8Array([1, 2, 3]),
      algo: "secp256k1",
      bech32Address: "cosmos1address",
      isNanoLedger: true,
      name: "Cosmos Snap",
      pubKey: new Uint8Array([4, 5, 6]),
    };
    const aminoSigner = { mode: "amino" };
    const directSigner = { mode: "direct" };
    cosmosSnapClient.getKey.mockResolvedValue(key);
    cosmosSnapClient.getOfflineSigner.mockReturnValue(directSigner);
    cosmosSnapClient.getOfflineSignerOnlyAmino.mockReturnValue(aminoSigner);
    cosmosSnapClient.signAmino.mockResolvedValue({ signed: {}, signature: {} });
    cosmosSnapClient.signArbitrary.mockResolvedValue({ pub_key: {}, signature: "arbitrary" });
    cosmosSnapClient.signDirect.mockResolvedValue({
      signed: {
        accountNumber: 1n,
        authInfoBytes: new Uint8Array([1]),
        bodyBytes: new Uint8Array([2]),
        chainId: chain.chainId,
      },
      signature: {
        pub_key: {
          type: "type",
          value: "value",
        },
        signature: "direct",
      },
    });
    isSnapInstalled.mockResolvedValueOnce(false).mockResolvedValue(true);
    const ethereum = {
      request: vi.fn(async ({ method }: EthereumRequest) => {
        if (method === "web3_clientVersion") return "MetaMask/v11.0.0";
        return undefined;
      }),
    };
    setWindowValue("ethereum", ethereum);

    const wallet = getMetamaskSnapCosmos();

    await expect(wallet.init?.()).resolves.toBe(true);
    expect(installSnap).toHaveBeenCalledTimes(1);
    await expect(wallet.enable(chain.chainId)).resolves.toBeUndefined();
    await expect(wallet.getKey(chain.chainId)).resolves.toBe(key);
    expect(wallet.getOfflineSigner(chain.chainId)).toBe(directSigner);
    await expect(wallet.getOfflineSignerAuto(chain.chainId)).resolves.toBe(aminoSigner);
    expect(wallet.getOfflineSignerOnlyAmino(chain.chainId)).toBe(aminoSigner);
    await expect(wallet.experimentalSuggestChain(chain)).resolves.toBeUndefined();
    expect(cosmosSnapClient.experimentalSuggestChain).toHaveBeenCalledWith(chain);
    await expect(wallet.signAmino(chain.chainId, "cosmos1address", {
      account_number: "0",
      chain_id: chain.chainId,
      fee: { amount: [], gas: "0" },
      memo: "",
      msgs: [],
      sequence: "0",
    })).resolves.toEqual({ signed: {}, signature: {} });
    await expect(wallet.signDirect(chain.chainId, "cosmos1address", {
      accountNumber: 1n,
      authInfoBytes: new Uint8Array([1]),
      bodyBytes: new Uint8Array([2]),
      chainId: chain.chainId,
    })).resolves.toMatchObject({
      signature: {
        signature: "direct",
      },
    });
    await expect(wallet.signArbitrary?.(chain.chainId, "cosmos1address", "hello")).resolves.toMatchObject({
      signature: "arbitrary",
    });
    await expect(wallet.disable?.(chain.chainId)).resolves.toBeUndefined();
    expect(cosmosSnapClient.deleteChain).toHaveBeenCalledWith(chain.chainId);
  });

  it("selects MetaMask for the Cosmos Snap adapter when another wallet owns window.ethereum", async () => {
    const phantom = {
      isPhantom: true,
      request: vi.fn(async ({ method }: EthereumRequest) => {
        if (method === "web3_clientVersion") return "Phantom/v1.0.0";
        return undefined;
      }),
    };
    const metamask = {
      isMetaMask: true,
      request: vi.fn(async ({ method }: EthereumRequest) => {
        if (method === "web3_clientVersion") return "MetaMask/v11.0.0";
        return undefined;
      }),
    };
    setWindowValue("ethereum", {
      ...phantom,
      providers: [phantom, metamask],
    });
    isSnapInstalled.mockResolvedValue(true);

    const wallet = getMetamaskSnapCosmos();

    await expect(wallet.init?.()).resolves.toBe(true);
    expect(window.ethereum).toBe(metamask);
    expect(metamask.request).toHaveBeenCalledWith({ method: "web3_clientVersion" });
    expect(phantom.request).not.toHaveBeenCalled();
  });

  it("initializes and delegates the Leap MetaMask Snap adapter", async () => {
    const chain = makeChainInfo();
    const requests: EthereumRequest[] = [];
    const ethereum = {
      request: vi.fn(async (request: EthereumRequest) => {
        requests.push(request);
        if (request.method === "web3_clientVersion") return "MetaMask/v11.0.0";
        if (request.method === "wallet_getSnaps") return {};
        if (request.method === "wallet_requestSnaps") return null;
        if (request.method === "wallet_invokeSnap") {
          const snapMethod = request.params?.request?.method;
          if (snapMethod === "getKey") {
            return {
              algo: "secp256k1",
              bech32Address: "cosmos1address",
              isNanoLedger: false,
              name: "Leap Snap",
              pubkey: {
                0: 4,
                1: 5,
                2: 6,
              },
            };
          }
          if (snapMethod === "signAmino") return { signed: {}, signature: {} };
          if (snapMethod === "signDirect") {
            return {
              signed: {
                authInfoBytes: {
                  0: 1,
                },
                bodyBytes: {
                  0: 2,
                },
                chainId: chain.chainId,
              },
              signature: {
                pub_key: {
                  type: "type",
                  value: "value",
                },
                signature: "direct",
              },
            };
          }
          if (snapMethod === "suggestChain") return null;
        }
        return undefined;
      }),
    };
    setWindowValue("ethereum", ethereum);

    expect(getMetamaskSnapLeap()).toMatchObject({
      init: expect.any(Function),
    });

    const wallet = getMetamaskSnap({ id: "npm:@leapwallet/metamask-cosmos-snap" });

    await expect(wallet.init?.()).resolves.toBe(true);
    await expect(wallet.enable(chain.chainId)).resolves.toBeUndefined();
    await expect(wallet.getKey(chain.chainId)).resolves.toMatchObject({
      bech32Address: "cosmos1address",
      name: "Leap Snap",
      pubKey: new Uint8Array([4, 5, 6]),
    });
    await expect(wallet.getOfflineSignerOnlyAmino(chain.chainId).getAccounts()).resolves.toEqual([
      {
        address: "cosmos1address",
        algo: "secp256k1",
        pubkey: new Uint8Array([4, 5, 6]),
      },
    ]);
    await expect(wallet.getOfflineSignerAuto(chain.chainId)).resolves.toMatchObject({
      signAmino: expect.any(Function),
    });
    await expect(wallet.signAmino(chain.chainId, "cosmos1address", {
      account_number: "0",
      chain_id: chain.chainId,
      fee: { amount: [], gas: "0" },
      memo: "",
      msgs: [],
      sequence: "0",
    })).resolves.toEqual({ signed: {}, signature: {} });
    await expect(wallet.signDirect(chain.chainId, "cosmos1address", {
      accountNumber: 7n,
      authInfoBytes: new Uint8Array([1]),
      bodyBytes: new Uint8Array([2]),
      chainId: chain.chainId,
    })).resolves.toMatchObject({
      signature: {
        signature: "direct",
      },
    });
    await expect(wallet.experimentalSuggestChain(chain)).resolves.toBeUndefined();
    expect(requests.some((request) => request.params?.request?.method === "suggestChain")).toBe(true);
  });

  it("selects MetaMask for the Leap Snap adapter when another wallet owns window.ethereum", async () => {
    const requests: EthereumRequest[] = [];
    const phantom = {
      isPhantom: true,
      request: vi.fn(async ({ method }: EthereumRequest) => {
        if (method === "web3_clientVersion") return "Phantom/v1.0.0";
        return undefined;
      }),
    };
    const metamask = {
      isMetaMask: true,
      request: vi.fn(async (request: EthereumRequest) => {
        requests.push(request);
        if (request.method === "web3_clientVersion") return "MetaMask/v11.0.0";
        if (request.method === "wallet_getSnaps") return {};
        if (request.method === "wallet_requestSnaps") return null;
        return undefined;
      }),
    };
    setWindowValue("ethereum", {
      ...phantom,
      providers: [phantom, metamask],
    });

    const wallet = getMetamaskSnap({ id: "npm:@leapwallet/metamask-cosmos-snap" });

    await expect(wallet.init?.()).resolves.toBe(true);
    expect(window.ethereum).toBe(metamask);
    expect(requests.map((request) => request.method)).toEqual([
      "web3_clientVersion",
      "wallet_getSnaps",
      "wallet_requestSnaps",
    ]);
    expect(phantom.request).not.toHaveBeenCalled();
  });
});
