import { beforeEach, describe, expect, it, vi } from "vitest";

const walletConnectModalMock = vi.hoisted(() => {
  const instances: Array<{
    closeModal: ReturnType<typeof vi.fn>;
    openModal: ReturnType<typeof vi.fn>;
    subscribeModal: ReturnType<typeof vi.fn>;
  }> = [];

  return {
    instances,
  };
});

vi.mock("@walletconnect/modal", () => ({
  WalletConnectModal: vi.fn(function WalletConnectModal() {
    const instance = {
      closeModal: vi.fn(),
      openModal: vi.fn().mockResolvedValue(undefined),
      subscribeModal: vi.fn(),
    };
    walletConnectModalMock.instances.push(instance);
    return instance;
  }),
}));

import { useGrazInternalStore, useGrazSessionStore } from "../../../store";
import { WalletType } from "../../../types/wallet";
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

const makeWalletConnectKey = (chainId: string): WalletConnectStoredKey => ({
  address: [1, 2, 3],
  algo: "secp256k1",
  bech32Address: `${chainId}1address`,
  chainId,
  isKeystone: false,
  isNanoLedger: false,
  name: `${chainId} account`,
  pubKey: Buffer.from(new Uint8Array([4, 5, 6])).toString("base64"),
});

const getWalletConnectChainId = (chainId: string) => chainId.split(":")[1] || chainId;

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
    const approval = vi.fn().mockResolvedValue({
      sessionProperties: {
        keys: JSON.stringify([cosmoshub, osmosis]),
      },
    });
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

    const wallet = getWalletConnect();

    await expect(wallet.enable([cosmoshub.chainId, osmosis.chainId])).resolves.toBeUndefined();

    expect(signClient.connect).toHaveBeenCalledWith({
      requiredNamespaces: {
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

  it("requests accounts when an approved session does not include session properties", async () => {
    const chainId = "cosmoshub-4";
    const approval = vi.fn().mockResolvedValue({
      topic: "topic-1",
    });
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
        bech32Address: `${chainId}1address`,
      },
    });
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
