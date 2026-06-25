import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeChainInfo } from "../../__tests__/fixtures";
import { useGrazInternalStore } from "../../store";
import { WalletType } from "../../types/wallet";
import {
  addChain,
  clearRecentChain,
  getChainInfo,
  getChainInfos,
  getRecentChainIds,
  getRecentChains,
  suggestChain,
  suggestChainAndConnect,
} from "../chains";
import { getWallet } from "../wallet";

vi.mock("../wallet", () => ({
  getWallet: vi.fn(),
}));

vi.mock("../account", () => ({
  connect: vi.fn(async (args) => ({
    accounts: {},
    chains: [args.chainInfo].filter(Boolean),
    walletType: args.walletType ?? WalletType.KEPLR,
  })),
}));

describe("chain actions", () => {
  const getWalletMock = vi.mocked(getWallet);

  beforeEach(() => {
    getWalletMock.mockReturnValue({
      experimentalSuggestChain: vi.fn().mockResolvedValue(undefined),
    } as unknown as ReturnType<typeof getWallet>);
  });

  it("reads and clears recent chains", () => {
    const cosmoshub = makeChainInfo();
    const osmosis = makeChainInfo("osmosis-1");
    useGrazInternalStore.setState({
      chains: [cosmoshub, osmosis],
      recentChainIds: [cosmoshub.chainId, osmosis.chainId],
    });

    expect(getRecentChainIds()).toEqual(["cosmoshub-4", "osmosis-1"]);
    expect(getRecentChains()).toEqual([cosmoshub, osmosis]);

    clearRecentChain();

    expect(getRecentChainIds()).toBeNull();
  });

  it("gets one or many configured chains", () => {
    const cosmoshub = makeChainInfo();
    const osmosis = makeChainInfo("osmosis-1");
    useGrazInternalStore.setState({ chains: [cosmoshub, osmosis] });

    expect(getChainInfo({ chainId: "cosmoshub-4" })).toBe(cosmoshub);
    expect(getChainInfo({ chainId: "missing" })).toBeUndefined();
    expect(getChainInfos()).toEqual([cosmoshub, osmosis]);
    expect(getChainInfos({ chainId: ["osmosis-1"] })).toEqual([osmosis]);
  });

  it("adds a new chain and rejects duplicates", async () => {
    const cosmoshub = makeChainInfo();

    await expect(addChain({ chainInfo: cosmoshub })).resolves.toBe(cosmoshub);
    expect(useGrazInternalStore.getState().chains).toEqual([cosmoshub]);
    await expect(addChain({ chainInfo: cosmoshub })).rejects.toThrow(
      'Chain with chainId "cosmoshub-4" already exists in the store',
    );
  });

  it("suggests a chain through the selected wallet and stores it once", async () => {
    const chainInfo = makeChainInfo("juno-1");
    const wallet = {
      experimentalSuggestChain: vi.fn().mockResolvedValue(undefined),
    };
    getWalletMock.mockReturnValue(wallet as unknown as ReturnType<typeof getWallet>);

    await expect(suggestChain({ chainInfo, walletType: WalletType.KEPLR })).resolves.toBe(chainInfo);
    await expect(suggestChain({ chainInfo, walletType: WalletType.KEPLR })).resolves.toBe(chainInfo);

    expect(wallet.experimentalSuggestChain).toHaveBeenCalledTimes(2);
    expect(useGrazInternalStore.getState().chains).toEqual([chainInfo]);
  });

  it("suggests then connects with the provided wallet", async () => {
    const chainInfo = makeChainInfo("juno-1");

    await expect(
      suggestChainAndConnect({
        autoReconnect: true,
        chainInfo,
        walletType: WalletType.COSMOSTATION,
      }),
    ).resolves.toMatchObject({
      walletType: WalletType.COSMOSTATION,
    });
  });
});
