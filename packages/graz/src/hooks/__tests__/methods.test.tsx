import { act } from "react";
import { describe, expect, it, vi } from "vitest";

const useCosmWasmClientMock = vi.hoisted(() => vi.fn());

vi.mock("../clients", () => ({
  useCosmWasmClient: useCosmWasmClientMock,
}));

import { createQueryWrapper, renderHook } from "../../__tests__/react";
import {
  useExecuteContract,
  useInstantiateContract,
  useQueryRaw,
  useQuerySmart,
  useSendIbcTokens,
  useSendTokens,
  useSignAndBroadcast,
} from "../methods";

const txResponse = {
  code: 0,
  events: [],
  gasUsed: 1n,
  gasWanted: 1n,
  height: 1,
  msgResponses: [],
  rawLog: "",
  transactionHash: "ABC123",
  txIndex: 0,
};

describe("method hooks", () => {
  it("wraps signAndBroadcast mutations and forwards success callbacks", async () => {
    const { wrapper } = createQueryWrapper();
    const signAndBroadcastSuccess = vi.fn();
    const signingClient = {
      signAndBroadcast: vi.fn().mockResolvedValue(txResponse),
    };
    const messages = [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: {} }];

    const rendered = renderHook(() => useSignAndBroadcast({ onSuccess: signAndBroadcastSuccess }), { wrapper });

    await act(async () => {
      await rendered.result.signAndBroadcastAsync({
        fee: "auto",
        memo: "memo",
        messages,
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
      });
    });

    expect(signingClient.signAndBroadcast).toHaveBeenCalledWith(
      "cosmos1sender",
      messages,
      "auto",
      "memo",
      undefined,
    );
    expect(signAndBroadcastSuccess).toHaveBeenCalledWith(txResponse);
    rendered.unmount();
  });

  it("wraps token transfer mutations and forwards success callbacks", async () => {
    const { wrapper } = createQueryWrapper();
    const sendTokensSuccess = vi.fn();
    const sendIbcTokensSuccess = vi.fn();
    const signingClient = {
      sendIbcTokens: vi.fn().mockResolvedValue(txResponse),
      sendTokens: vi.fn().mockResolvedValue(txResponse),
    };

    const rendered = renderHook(
      () => ({
        ibc: useSendIbcTokens({ onSuccess: sendIbcTokensSuccess }),
        send: useSendTokens({ onSuccess: sendTokensSuccess }),
      }),
      { wrapper },
    );

    await act(async () => {
      await rendered.result.send.sendTokensAsync({
        amount: [{ amount: "1", denom: "uatom" }],
        fee: "auto",
        recipientAddress: "cosmos1recipient",
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
      });
      await rendered.result.ibc.sendIbcTokensAsync({
        fee: "auto",
        recipientAddress: "cosmos1recipient",
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
        sourceChannel: "channel-0",
        sourcePort: "transfer",
        transferAmount: { amount: "1", denom: "uatom" },
      });
    });

    expect(signingClient.sendTokens).toHaveBeenCalledWith(
      "cosmos1sender",
      "cosmos1recipient",
      [{ amount: "1", denom: "uatom" }],
      "auto",
      undefined,
    );
    expect(signingClient.sendIbcTokens).toHaveBeenCalledWith(
      "cosmos1sender",
      "cosmos1recipient",
      { amount: "1", denom: "uatom" },
      "transfer",
      "channel-0",
      undefined,
      undefined,
      "auto",
      undefined,
    );
    expect(sendTokensSuccess).toHaveBeenCalledWith(txResponse);
    expect(sendIbcTokensSuccess).toHaveBeenCalledWith(txResponse);
    rendered.unmount();
  });

  it("wraps CosmWasm instantiate and execute mutations with hook defaults", async () => {
    const { wrapper } = createQueryWrapper();
    const instantiateSuccess = vi.fn();
    const executeSuccess = vi.fn();
    const instantiateResult = {
      ...txResponse,
      contractAddress: "cosmos1contract",
      logs: [],
    };
    const executeResult = {
      ...txResponse,
      logs: [],
    };
    const signingClient = {
      execute: vi.fn().mockResolvedValue(executeResult),
      instantiate: vi.fn().mockResolvedValue(instantiateResult),
    };

    const rendered = renderHook(
      () => ({
        execute: useExecuteContract({
          contractAddress: "cosmos1contract",
          onSuccess: executeSuccess,
        }),
        instantiate: useInstantiateContract({
          codeId: 7,
          onSuccess: instantiateSuccess,
        }),
      }),
      { wrapper },
    );

    await act(async () => {
      await rendered.result.instantiate.instantiateContractAsync({
        label: "label",
        msg: { init: true },
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
      });
      await rendered.result.execute.executeContractAsync({
        msg: { ping: true },
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
      });
    });

    expect(signingClient.instantiate).toHaveBeenCalledWith(
      "cosmos1sender",
      7,
      { init: true },
      "label",
      "auto",
      undefined,
    );
    expect(signingClient.execute).toHaveBeenCalledWith(
      "cosmos1sender",
      "cosmos1contract",
      { ping: true },
      "auto",
      "",
      [],
    );
    expect(instantiateSuccess).toHaveBeenCalledWith(instantiateResult);
    expect(executeSuccess).toHaveBeenCalledWith(executeResult);
    rendered.unmount();
  });

  it("queries smart and raw contract state from the first CosmWasm client", async () => {
    const { wrapper } = createQueryWrapper();
    const client = {
      queryContractRaw: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      queryContractSmart: vi.fn().mockResolvedValue({ count: 1 }),
    };
    useCosmWasmClientMock.mockReturnValue({
      data: {
        "cosmoshub-4": client,
      },
    });

    const rendered = renderHook(
      () => ({
        raw: useQueryRaw({ address: "cosmos1contract", key: "state-key" }),
        smart: useQuerySmart<{ count: number }, Error>({
          address: "cosmos1contract",
          queryMsg: { count: {} },
        }),
      }),
      { wrapper },
    );

    await vi.waitFor(() => {
      expect(rendered.result.smart.data).toEqual({ count: 1 });
      expect(rendered.result.raw.data).toEqual(new Uint8Array([1, 2, 3]));
    });
    expect(client.queryContractSmart).toHaveBeenCalledWith("cosmos1contract", { count: {} });
    expect(client.queryContractRaw).toHaveBeenCalledWith("cosmos1contract", new TextEncoder().encode("state-key"));
    rendered.unmount();
  });
});
