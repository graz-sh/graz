import { act } from "react";
import { describe, expect, it, vi } from "vitest";

import { makeChainInfo } from "../../__tests__/fixtures";
import { createQueryWrapper, flushReact, renderHook } from "../../__tests__/react";
import { useGrazInternalStore, useGrazSessionStore } from "../../store";
import { WalletType } from "../../types/wallet";
import {
  useActiveChainCurrency,
  useActiveChainIds,
  useActiveChains,
  useAddChain,
  useChainInfo,
  useChainInfos,
  useQueryClientValidators,
  useRecentChainIds,
  useRecentChains,
  useSuggestChain,
} from "../chains";

const setWindowValue = (key: string, value: unknown) => {
  Object.defineProperty(window, key, {
    configurable: true,
    value,
    writable: true,
  });
};

describe("chain hooks", () => {
  it("derives active, configured, and recent chains from the stores", () => {
    const cosmoshub = makeChainInfo();
    const osmosis = makeChainInfo("osmosis-1");
    useGrazInternalStore.setState({
      chains: [cosmoshub, osmosis],
      recentChainIds: [osmosis.chainId],
    });
    useGrazSessionStore.setState({
      activeChainIds: [cosmoshub.chainId],
    });

    const rendered = renderHook(() => ({
      activeChainIds: useActiveChainIds(),
      activeChains: useActiveChains(),
      chainInfo: useChainInfo({ chainId: cosmoshub.chainId }),
      chainInfos: useChainInfos({ chainId: [osmosis.chainId] }),
      recentChainIds: useRecentChainIds(),
      recentChains: useRecentChains(),
    }));

    expect(rendered.result.activeChainIds).toEqual([cosmoshub.chainId]);
    expect(rendered.result.activeChains).toEqual([cosmoshub]);
    expect(rendered.result.chainInfo).toBe(cosmoshub);
    expect(rendered.result.chainInfos).toEqual([osmosis]);
    expect(rendered.result.recentChainIds.data).toEqual([osmosis.chainId]);
    expect(rendered.result.recentChains.data).toEqual([osmosis]);

    act(() => {
      rendered.result.recentChainIds.clear();
    });

    expect(useGrazInternalStore.getState().recentChainIds).toBeNull();
    rendered.unmount();
  });

  it("queries active chain currency", async () => {
    const { wrapper } = createQueryWrapper();
    const cosmoshub = makeChainInfo();
    useGrazInternalStore.setState({ chains: [cosmoshub] });
    useGrazSessionStore.setState({ activeChainIds: [cosmoshub.chainId] });

    const rendered = renderHook(
      () => useActiveChainCurrency({ denom: "uatom" }),
      { wrapper },
    );
    await flushReact();

    await vi.waitFor(() => {
      expect(rendered.result.data).toEqual(cosmoshub.currencies[0]);
    });
    rendered.unmount();
  });

  it("queries staking validators when a query client is provided", async () => {
    const { wrapper } = createQueryWrapper();
    const validatorsResponse = {
      pagination: undefined,
      validators: [{ operatorAddress: "cosmosvaloper1validator" }],
    };
    const queryClient = {
      staking: {
        validators: vi.fn().mockResolvedValue(validatorsResponse),
      },
    };

    const rendered = renderHook(
      () =>
        useQueryClientValidators({
          queryClient: queryClient as never,
          status: "BOND_STATUS_UNBONDED",
        }),
      { wrapper },
    );

    await vi.waitFor(() => {
      expect(rendered.result.data).toBe(validatorsResponse);
    });
    expect(queryClient.staking.validators).toHaveBeenCalledWith("BOND_STATUS_UNBONDED");
    rendered.unmount();
  });

  it("adds and suggests chains through mutations", async () => {
    const { wrapper } = createQueryWrapper();
    const addSuccess = vi.fn();
    const suggestSuccess = vi.fn();
    const chain = makeChainInfo("juno-1");
    const suggested = makeChainInfo("stargaze-1");
    const wallet = {
      experimentalSuggestChain: vi.fn().mockResolvedValue(undefined),
    };
    setWindowValue("keplr", wallet);

    const rendered = renderHook(
      () => ({
        add: useAddChain({ onSuccess: addSuccess }),
        suggest: useSuggestChain({ onSuccess: suggestSuccess }),
      }),
      { wrapper },
    );

    await act(async () => {
      await rendered.result.add.addChainAsync({ chainInfo: chain });
      await rendered.result.suggest.suggestAsync({
        chainInfo: suggested,
        walletType: WalletType.KEPLR,
      });
    });

    expect(addSuccess).toHaveBeenCalledWith(chain);
    expect(suggestSuccess).toHaveBeenCalledWith(suggested);
    expect(wallet.experimentalSuggestChain).toHaveBeenCalledWith(suggested);
    expect(useGrazInternalStore.getState().chains).toEqual([chain, suggested]);
    rendered.unmount();
  });

  it("runs loading and error callbacks for chain mutations", async () => {
    const { wrapper } = createQueryWrapper();
    const addError = vi.fn();
    const addLoading = vi.fn();
    const addSuccess = vi.fn();
    const suggestError = vi.fn();
    const suggestLoading = vi.fn();
    const duplicate = makeChainInfo("duplicate-1");
    useGrazInternalStore.setState({ chains: [duplicate] });

    const rendered = renderHook(
      () => ({
        add: useAddChain({
          onError: addError,
          onLoading: addLoading,
          onSuccess: addSuccess,
        }),
        suggest: useSuggestChain({
          onError: suggestError,
          onLoading: suggestLoading,
        }),
      }),
      { wrapper },
    );

    await expect(
      act(async () => {
        await rendered.result.add.addChainAsync({ chainInfo: duplicate });
      }),
    ).rejects.toThrow('Chain with chainId "duplicate-1" already exists in the store');
    expect(addLoading).toHaveBeenCalledWith(duplicate);
    expect(addError).toHaveBeenCalledWith(expect.any(Error), duplicate);
    expect(addSuccess).not.toHaveBeenCalled();

    Reflect.deleteProperty(window, "keplr");
    await expect(
      act(async () => {
        await rendered.result.suggest.suggestAsync({
          chainInfo: makeChainInfo("missing-wallet-1"),
          walletType: WalletType.KEPLR,
        });
      }),
    ).rejects.toThrow("window.keplr is not defined");
    expect(suggestLoading).toHaveBeenCalledWith(expect.objectContaining({ chainId: "missing-wallet-1" }));
    expect(suggestError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ chainId: "missing-wallet-1" }),
    );
    rendered.unmount();
  });
});
