import { describe, expect, it, vi } from "vitest";

const useStargateClientMock = vi.hoisted(() => vi.fn());

vi.mock("../clients", () => ({
  useStargateClient: useStargateClientMock,
}));

import { makeChainInfo } from "../../__tests__/fixtures";
import { createQueryWrapper, flushReact, renderHook } from "../../__tests__/react";
import { useGrazInternalStore } from "../../store";
import { useBalance, useBalances, useBalanceStaked } from "../account";

describe("balance hooks", () => {
  it("queries all, single, and staked balances with a ready Stargate client", async () => {
    const { wrapper } = createQueryWrapper();
    const chain = makeChainInfo();
    const client = {
      getAllBalances: vi.fn().mockResolvedValue([{ amount: "1", denom: "uatom" }]),
      getBalance: vi.fn().mockResolvedValue({ amount: "42", denom: "uatom" }),
      getBalanceStaked: vi.fn().mockResolvedValue({ amount: "7", denom: "uatom" }),
    };
    useGrazInternalStore.setState({ chains: [chain] });
    useStargateClientMock.mockReturnValue({
      data: {
        [chain.chainId]: client,
      },
    });

    const rendered = renderHook(
      () => ({
        balance: useBalance({
          bech32Address: "cosmos1address",
          chainId: chain.chainId,
          denom: "uatom",
        }),
        balances: useBalances({
          bech32Address: "cosmos1address",
          chainId: chain.chainId,
        }),
        staked: useBalanceStaked({
          bech32Address: "cosmos1address",
          chainId: chain.chainId,
        }),
      }),
      { wrapper },
    );

    await vi.waitFor(() => {
      expect(rendered.result.balances.data).toEqual([{ amount: "1", denom: "uatom" }]);
      expect(rendered.result.balance.data).toEqual({ amount: "42", denom: "uatom" });
      expect(rendered.result.staked.data).toEqual({ amount: "7", denom: "uatom" });
    });
    expect(client.getAllBalances).toHaveBeenCalledWith("cosmos1address");
    expect(client.getBalance).toHaveBeenCalledWith("cosmos1address", "uatom");
    expect(client.getBalanceStaked).toHaveBeenCalledWith("cosmos1address");
    rendered.unmount();
  });

  it("returns undefined for zero single-denom balances", async () => {
    const { wrapper } = createQueryWrapper();
    const chain = makeChainInfo();
    const client = {
      getBalance: vi.fn().mockResolvedValue({ amount: "0", denom: "uatom" }),
    };
    useGrazInternalStore.setState({ chains: [chain] });
    useStargateClientMock.mockReturnValue({
      data: {
        [chain.chainId]: client,
      },
    });

    const rendered = renderHook(
      () =>
        useBalance({
          bech32Address: "cosmos1address",
          chainId: chain.chainId,
          denom: "uatom",
        }),
      { wrapper },
    );

    await vi.waitFor(() => {
      expect(rendered.result.isSuccess).toBe(true);
    });
    expect(rendered.result.data).toBeUndefined();
    rendered.unmount();
  });

  it("keeps balance queries idle while required arguments are undefined", async () => {
    const { wrapper } = createQueryWrapper();
    const chain = makeChainInfo();
    const client = {
      getAllBalances: vi.fn(),
      getBalance: vi.fn(),
      getBalanceStaked: vi.fn(),
    };
    useGrazInternalStore.setState({ chains: [chain] });
    useStargateClientMock.mockReturnValue({
      data: {
        [chain.chainId]: client,
      },
    });

    const rendered = renderHook(
      () => ({
        balance: useBalance({
          bech32Address: "cosmos1address",
          chainId: chain.chainId,
          denom: undefined,
        }),
        balances: useBalances({
          bech32Address: undefined,
          chainId: chain.chainId,
        }),
        staked: useBalanceStaked({
          bech32Address: "cosmos1address",
          chainId: undefined,
        }),
      }),
      { wrapper },
    );
    await flushReact();

    expect(rendered.result.balance.fetchStatus).toBe("idle");
    expect(rendered.result.balances.fetchStatus).toBe("idle");
    expect(rendered.result.staked.fetchStatus).toBe("idle");
    expect(client.getAllBalances).not.toHaveBeenCalled();
    expect(client.getBalance).not.toHaveBeenCalled();
    expect(client.getBalanceStaked).not.toHaveBeenCalled();
    expect(useStargateClientMock).toHaveBeenCalledWith({ chainId: [chain.chainId], enabled: false });
    expect(useStargateClientMock).toHaveBeenCalledWith({ chainId: [], enabled: false });
    rendered.unmount();
  });
});
