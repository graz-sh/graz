import { describe, expect, it, vi } from "vitest";

const cosmWasmConnect = vi.hoisted(() => vi.fn());
const signingCosmWasmConnect = vi.hoisted(() => vi.fn());
const gasPriceFromString = vi.hoisted(() => vi.fn());
const stargateConnect = vi.hoisted(() => vi.fn());
const signingStargateConnect = vi.hoisted(() => vi.fn());

vi.mock("@cosmjs/cosmwasm-stargate", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@cosmjs/cosmwasm-stargate")>();
  return {
    ...actual,
    CosmWasmClient: {
      connect: cosmWasmConnect,
    },
    SigningCosmWasmClient: {
      connectWithSigner: signingCosmWasmConnect,
    },
  };
});

vi.mock("@cosmjs/stargate", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@cosmjs/stargate")>();
  return {
    ...actual,
    GasPrice: {
      ...actual.GasPrice,
      fromString: gasPriceFromString,
    },
    SigningStargateClient: {
      connectWithSigner: signingStargateConnect,
    },
    StargateClient: {
      connect: stargateConnect,
    },
  };
});

import { makeChainInfo } from "../../__tests__/fixtures";
import { createQueryWrapper, renderHook } from "../../__tests__/react";
import { useGrazInternalStore, useGrazSessionStore } from "../../store";
import { WalletType, type Key } from "../../types/wallet";
import { useCosmWasmClient, useStargateClient } from "../clients";
import { useCosmWasmSigningClient, useStargateSigningClient } from "../signingClients";

const makeKey = (chainId: string): Key => ({
  address: new Uint8Array([1, 2, 3]),
  algo: "secp256k1",
  bech32Address: `${chainId}1address`,
  isKeystone: false,
  isNanoLedger: false,
  name: `${chainId} account`,
  pubKey: new Uint8Array([4, 5, 6]),
});

const setWindowValue = (key: string, value: unknown) => {
  Object.defineProperty(window, key, {
    configurable: true,
    value,
    writable: true,
  });
};

describe("client hooks", () => {
  it("creates read clients with RPC headers from chain config", async () => {
    const { wrapper } = createQueryWrapper();
    const chain = makeChainInfo();
    const stargateClient = { kind: "stargate" };
    const cosmWasmClient = { kind: "cosmwasm" };
    stargateConnect.mockResolvedValue(stargateClient);
    cosmWasmConnect.mockResolvedValue(cosmWasmClient);
    useGrazInternalStore.setState({
      chains: [chain],
      chainsConfig: {
        [chain.chainId]: {
          rpcHeaders: {
            Authorization: "Bearer test",
          },
        },
      },
    });

    const rendered = renderHook(
      () => ({
        cosmwasm: useCosmWasmClient({ chainId: [chain.chainId] }),
        stargate: useStargateClient({ chainId: [chain.chainId] }),
      }),
      { wrapper },
    );

    await vi.waitFor(() => {
      expect(rendered.result.stargate.data).toEqual({ [chain.chainId]: stargateClient });
      expect(rendered.result.cosmwasm.data).toEqual({ [chain.chainId]: cosmWasmClient });
    });
    expect(stargateConnect).toHaveBeenCalledWith({
      headers: { Authorization: "Bearer test" },
      url: chain.rpc,
    });
    expect(cosmWasmConnect).toHaveBeenCalledWith({
      headers: { Authorization: "Bearer test" },
      url: chain.rpc,
    });
    rendered.unmount();
  });

  it("creates signing clients with selected signer, gas config, and per-chain options", async () => {
    const { wrapper } = createQueryWrapper();
    const chain = makeChainInfo();
    const account = makeKey(chain.chainId);
    const offlineSigner = { signer: "direct" };
    const offlineSignerAmino = { signer: "amino" };
    const offlineSignerAuto = { signer: "auto" };
    const gasPrice = { amount: "0.025", denom: "uatom" };
    const stargateSigningClient = { kind: "stargate-signing" };
    const cosmWasmSigningClient = { kind: "cosmwasm-signing" };
    const wallet = {
      enable: vi.fn(),
      experimentalSuggestChain: vi.fn(),
      getKey: vi.fn(async () => account),
      getOfflineSigner: vi.fn(() => offlineSigner),
      getOfflineSignerAuto: vi.fn(async () => offlineSignerAuto),
      getOfflineSignerOnlyAmino: vi.fn(() => offlineSignerAmino),
      signAmino: vi.fn(),
      signDirect: vi.fn(),
    };
    setWindowValue("keplr", wallet);
    gasPriceFromString.mockReturnValue(gasPrice);
    signingStargateConnect.mockResolvedValue(stargateSigningClient);
    signingCosmWasmConnect.mockResolvedValue(cosmWasmSigningClient);
    useGrazInternalStore.setState({
      _reconnectConnector: WalletType.KEPLR,
      chains: [chain],
      chainsConfig: {
        [chain.chainId]: {
          gas: {
            denom: "uatom",
            price: "0.025",
          },
          rpcHeaders: {
            Authorization: "Bearer test",
          },
        },
      },
      walletType: WalletType.KEPLR,
    });
    useGrazSessionStore.setState({
      accounts: { [chain.chainId]: account },
      activeChainIds: [chain.chainId],
      status: "connected",
    });

    const rendered = renderHook(
      () => ({
        cosmwasm: useCosmWasmSigningClient({
          chainId: [chain.chainId],
          offlineSigner: "offlineSigner",
          opts: {
            [chain.chainId]: {
              broadcastTimeoutMs: 2000,
            },
          },
        }),
        stargate: useStargateSigningClient({
          chainId: [chain.chainId],
          offlineSigner: "offlineSignerOnlyAmino",
          opts: {
            [chain.chainId]: {
              broadcastPollIntervalMs: 100,
            },
          },
        }),
      }),
      { wrapper },
    );

    await vi.waitFor(() => {
      expect(rendered.result.stargate.data).toEqual({ [chain.chainId]: stargateSigningClient });
      expect(rendered.result.cosmwasm.data).toEqual({ [chain.chainId]: cosmWasmSigningClient });
    });

    expect(wallet.getOfflineSignerOnlyAmino).toHaveBeenCalledWith(chain.chainId);
    expect(wallet.getOfflineSigner).toHaveBeenCalledWith(chain.chainId);
    expect(signingStargateConnect).toHaveBeenCalledWith(
      {
        headers: { Authorization: "Bearer test" },
        url: chain.rpc,
      },
      offlineSignerAmino,
      { broadcastPollIntervalMs: 100 },
    );
    expect(gasPriceFromString).toHaveBeenCalledWith("0.025uatom");
    expect(signingCosmWasmConnect).toHaveBeenCalledWith(
      {
        headers: { Authorization: "Bearer test" },
        url: chain.rpc,
      },
      offlineSigner,
      {
        broadcastTimeoutMs: 2000,
        gasPrice,
      },
    );
    rendered.unmount();
  });

  it("does not run signing client queries while the wallet is disconnected", async () => {
    const { wrapper } = createQueryWrapper();
    const chain = makeChainInfo();
    useGrazInternalStore.setState({
      _reconnectConnector: WalletType.KEPLR,
      chains: [chain],
      walletType: WalletType.KEPLR,
    });
    useGrazSessionStore.setState({
      activeChainIds: [chain.chainId],
      status: "disconnected",
    });

    const rendered = renderHook(
      () => ({
        cosmwasm: useCosmWasmSigningClient({ chainId: [chain.chainId] }),
        stargate: useStargateSigningClient({ chainId: [chain.chainId] }),
      }),
      { wrapper },
    );

    expect(rendered.result.cosmwasm.fetchStatus).toBe("idle");
    expect(rendered.result.stargate.fetchStatus).toBe("idle");
    expect(rendered.result.cosmwasm.data).toBeUndefined();
    expect(rendered.result.stargate.data).toBeUndefined();
    expect(signingCosmWasmConnect).not.toHaveBeenCalled();
    expect(signingStargateConnect).not.toHaveBeenCalled();
    rendered.unmount();
  });

  it("returns null for inactive chains and uses the default auto signer", async () => {
    const { wrapper } = createQueryWrapper();
    const cosmoshub = makeChainInfo();
    const osmosis = makeChainInfo("osmosis-1");
    const account = makeKey(cosmoshub.chainId);
    const offlineSignerAuto = { signer: "auto" };
    const stargateSigningClient = { kind: "stargate-signing" };
    const cosmWasmSigningClient = { kind: "cosmwasm-signing" };
    const wallet = {
      enable: vi.fn(),
      experimentalSuggestChain: vi.fn(),
      getKey: vi.fn(async () => account),
      getOfflineSigner: vi.fn(),
      getOfflineSignerAuto: vi.fn(async () => offlineSignerAuto),
      getOfflineSignerOnlyAmino: vi.fn(),
      signAmino: vi.fn(),
      signDirect: vi.fn(),
    };
    setWindowValue("keplr", wallet);
    signingStargateConnect.mockResolvedValue(stargateSigningClient);
    signingCosmWasmConnect.mockResolvedValue(cosmWasmSigningClient);
    useGrazInternalStore.setState({
      _reconnectConnector: WalletType.KEPLR,
      chains: [cosmoshub, osmosis],
      walletType: WalletType.KEPLR,
    });
    useGrazSessionStore.setState({
      accounts: { [cosmoshub.chainId]: account },
      activeChainIds: [cosmoshub.chainId],
      status: "connected",
    });

    const rendered = renderHook(
      () => ({
        cosmwasm: useCosmWasmSigningClient({ chainId: [cosmoshub.chainId, osmosis.chainId] as const }),
        stargate: useStargateSigningClient({ chainId: [cosmoshub.chainId, osmosis.chainId] as const }),
      }),
      { wrapper },
    );

    await vi.waitFor(() => {
      expect(rendered.result.stargate.data).toEqual({
        [cosmoshub.chainId]: stargateSigningClient,
        [osmosis.chainId]: null,
      });
      expect(rendered.result.cosmwasm.data).toEqual({
        [cosmoshub.chainId]: cosmWasmSigningClient,
        [osmosis.chainId]: null,
      });
    });

    expect(wallet.getOfflineSignerAuto).toHaveBeenCalledWith(cosmoshub.chainId);
    expect(wallet.getOfflineSignerAuto).not.toHaveBeenCalledWith(osmosis.chainId);
    expect(signingStargateConnect).toHaveBeenCalledWith(
      {
        headers: {},
        url: cosmoshub.rpc,
      },
      offlineSignerAuto,
      undefined,
    );
    expect(signingCosmWasmConnect).toHaveBeenCalledWith(
      {
        headers: {},
        url: cosmoshub.rpc,
      },
      offlineSignerAuto,
      {
        gasPrice: undefined,
      },
    );
    rendered.unmount();
  });
});
