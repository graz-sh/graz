import { describe, expect, it, vi } from "vitest";

import {
  executeContract,
  getQueryRaw,
  getQuerySmart,
  instantiateContract,
  sendIbcTokens,
  signArbitrary,
  signAndBroadcast,
  sendTokens,
  verifyArbitrary,
} from "../methods";
import { useGrazInternalStore } from "../../store";
import { WalletType } from "../../types/wallet";

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

describe("transaction and query methods", () => {
  it("guards signAndBroadcast inputs and delegates to the signing client", async () => {
    await expect(
      signAndBroadcast({
        fee: "auto",
        messages: [],
      }),
    ).rejects.toThrow("Stargate signing client is not ready");

    const signingClient = {
      signAndBroadcast: vi.fn().mockResolvedValue(txResponse),
    };
    const messages = [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: {} }];

    await expect(
      signAndBroadcast({
        fee: "auto",
        memo: "memo",
        messages,
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
        timeoutHeight: 123n,
      }),
    ).resolves.toBe(txResponse);

    expect(signingClient.signAndBroadcast).toHaveBeenCalledWith(
      "cosmos1sender",
      messages,
      "auto",
      "memo",
      123n,
    );

    await expect(
      signAndBroadcast({
        fee: "auto",
        messages,
        senderAddress: "",
        signingClient: signingClient as never,
      }),
    ).rejects.toThrow("senderAddress is not defined");

    const error = new Error("broadcast failed");
    signingClient.signAndBroadcast.mockRejectedValueOnce(error);
    await expect(
      signAndBroadcast({
        fee: "auto",
        messages,
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
      }),
    ).rejects.toBe(error);
  });

  it("delegates arbitrary message signing and verification to the selected wallet", async () => {
    const signature = {
      pub_key: { type: "tendermint/PubKeySecp256k1", value: "pubkey" },
      signature: "signature",
    };
    const wallet = {
      signArbitrary: vi.fn().mockResolvedValue(signature),
      verifyArbitrary: vi.fn().mockResolvedValue(true),
    };
    Object.defineProperty(window, "keplr", {
      configurable: true,
      value: wallet,
    });

    await expect(
      signArbitrary({
        chainId: "cosmoshub-4",
        data: "hello",
        signerAddress: "cosmos1sender",
        walletType: WalletType.KEPLR,
      }),
    ).resolves.toBe(signature);

    await expect(
      verifyArbitrary({
        chainId: "cosmoshub-4",
        data: "hello",
        signature,
        signerAddress: "cosmos1sender",
        walletType: WalletType.KEPLR,
      }),
    ).resolves.toBe(true);

    expect(wallet.signArbitrary).toHaveBeenCalledWith("cosmoshub-4", "cosmos1sender", "hello");
    expect(wallet.verifyArbitrary).toHaveBeenCalledWith("cosmoshub-4", "cosmos1sender", "hello", signature);
  });

  it("uses the configured wallet type for arbitrary signing and reports unsupported wallets", async () => {
    useGrazInternalStore.setState({ walletType: WalletType.KEPLR });
    Object.defineProperty(window, "keplr", {
      configurable: true,
      value: {},
    });

    await expect(
      signArbitrary({
        chainId: "cosmoshub-4",
        data: "hello",
        signerAddress: "cosmos1sender",
      }),
    ).rejects.toThrow("keplr does not support signArbitrary");

    await expect(
      verifyArbitrary({
        chainId: "cosmoshub-4",
        data: "hello",
        signature: {
          pub_key: { type: "tendermint/PubKeySecp256k1", value: "pubkey" },
          signature: "signature",
        },
        signerAddress: "cosmos1sender",
      }),
    ).rejects.toThrow("keplr does not support verifyArbitrary");
  });

  it("guards sendTokens inputs and delegates to the signing client", async () => {
    await expect(
      sendTokens({
        amount: [],
        fee: "auto",
        recipientAddress: "cosmos1recipient",
      }),
    ).rejects.toThrow("No connected account detected");

    const signingClient = {
      sendTokens: vi.fn().mockResolvedValue(txResponse),
    };

    await expect(
      sendTokens({
        amount: [{ amount: "1", denom: "uatom" }],
        fee: "auto",
        memo: "memo",
        recipientAddress: "cosmos1recipient",
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
      }),
    ).resolves.toBe(txResponse);

    expect(signingClient.sendTokens).toHaveBeenCalledWith(
      "cosmos1sender",
      "cosmos1recipient",
      [{ amount: "1", denom: "uatom" }],
      "auto",
      "memo",
    );

    await expect(
      sendTokens({
        amount: [],
        fee: "auto",
        recipientAddress: "cosmos1recipient",
        senderAddress: "",
        signingClient: signingClient as never,
      }),
    ).rejects.toThrow("senderAddress is not defined");

    const error = new Error("broadcast failed");
    signingClient.sendTokens.mockRejectedValueOnce(error);
    await expect(
      sendTokens({
        amount: [],
        fee: "auto",
        recipientAddress: "cosmos1recipient",
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
      }),
    ).rejects.toBe(error);
  });

  it("guards sendIbcTokens inputs and delegates to the signing client", async () => {
    await expect(
      sendIbcTokens({
        fee: "auto",
        recipientAddress: "cosmos1recipient",
        sourceChannel: "channel-0",
        sourcePort: "transfer",
        transferAmount: { amount: "1", denom: "uatom" },
      }),
    ).rejects.toThrow("Stargate signing client is not ready");

    const signingClient = {
      sendIbcTokens: vi.fn().mockResolvedValue(txResponse),
    };

    await expect(
      sendIbcTokens({
        fee: "auto",
        memo: "memo",
        recipientAddress: "cosmos1recipient",
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
        sourceChannel: "channel-0",
        sourcePort: "transfer",
        timeoutTimestamp: 123,
        transferAmount: { amount: "1", denom: "uatom" },
      }),
    ).resolves.toBe(txResponse);

    expect(signingClient.sendIbcTokens).toHaveBeenCalledWith(
      "cosmos1sender",
      "cosmos1recipient",
      { amount: "1", denom: "uatom" },
      "transfer",
      "channel-0",
      undefined,
      123,
      "auto",
      "memo",
    );

    await expect(
      sendIbcTokens({
        fee: "auto",
        recipientAddress: "cosmos1recipient",
        senderAddress: "",
        signingClient: signingClient as never,
        sourceChannel: "channel-0",
        sourcePort: "transfer",
        transferAmount: { amount: "1", denom: "uatom" },
      }),
    ).rejects.toThrow("senderAddress is not defined");

    const error = new Error("ibc failed");
    signingClient.sendIbcTokens.mockRejectedValueOnce(error);
    await expect(
      sendIbcTokens({
        fee: "auto",
        recipientAddress: "cosmos1recipient",
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
        sourceChannel: "channel-0",
        sourcePort: "transfer",
        transferAmount: { amount: "1", denom: "uatom" },
      }),
    ).rejects.toBe(error);
  });

  it("delegates CosmWasm instantiate and execute calls", async () => {
    const signingClient = {
      execute: vi.fn().mockResolvedValue({ ...txResponse, logs: [] }),
      instantiate: vi.fn().mockResolvedValue({ ...txResponse, contractAddress: "cosmos1contract", logs: [] }),
    };

    await expect(
      instantiateContract({
        codeId: 1,
        fee: "auto",
        label: "label",
        msg: { init: {} },
        options: { admin: "cosmos1admin" },
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
      }),
    ).resolves.toMatchObject({ contractAddress: "cosmos1contract" });

    await expect(
      executeContract({
        contractAddress: "cosmos1contract",
        fee: "auto",
        funds: [{ amount: "1", denom: "uatom" }],
        memo: "memo",
        msg: { ping: {} },
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
      }),
    ).resolves.toMatchObject({ transactionHash: "ABC123" });

    expect(signingClient.instantiate).toHaveBeenCalledWith(
      "cosmos1sender",
      1,
      { init: {} },
      "label",
      "auto",
      { admin: "cosmos1admin" },
    );
    expect(signingClient.execute).toHaveBeenCalledWith(
      "cosmos1sender",
      "cosmos1contract",
      { ping: {} },
      "auto",
      "memo",
      [{ amount: "1", denom: "uatom" }],
    );

    await expect(
      instantiateContract({
        codeId: 1,
        fee: "auto",
        label: "label",
        msg: { init: {} },
        senderAddress: "cosmos1sender",
      }),
    ).rejects.toThrow("CosmWasm signing client is not ready");

    await expect(
      executeContract({
        contractAddress: "cosmos1contract",
        fee: "auto",
        funds: [],
        memo: "",
        msg: { ping: {} },
        senderAddress: "cosmos1sender",
      }),
    ).rejects.toThrow("CosmWasm signing client is not ready");

    const instantiateError = new Error("instantiate failed");
    signingClient.instantiate.mockRejectedValueOnce(instantiateError);
    await expect(
      instantiateContract({
        codeId: 1,
        fee: "auto",
        label: "label",
        msg: { init: {} },
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
      }),
    ).rejects.toBe(instantiateError);

    const executeError = new Error("execute failed");
    signingClient.execute.mockRejectedValueOnce(executeError);
    await expect(
      executeContract({
        contractAddress: "cosmos1contract",
        fee: "auto",
        funds: [],
        memo: "",
        msg: { ping: {} },
        senderAddress: "cosmos1sender",
        signingClient: signingClient as never,
      }),
    ).rejects.toBe(executeError);
  });

  it("delegates smart and raw queries", async () => {
    const client = {
      queryContractRaw: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      queryContractSmart: vi.fn().mockResolvedValue({ count: 1 }),
    };

    await expect(getQuerySmart("cosmos1contract", { count: {} }, client as never)).resolves.toEqual({ count: 1 });
    await expect(getQueryRaw("cosmos1contract", "state-key", client as never)).resolves.toEqual(new Uint8Array([1, 2, 3]));

    expect(client.queryContractSmart).toHaveBeenCalledWith("cosmos1contract", { count: {} });
    expect(client.queryContractRaw).toHaveBeenCalledWith("cosmos1contract", new TextEncoder().encode("state-key"));

    await expect(getQuerySmart("cosmos1contract", { count: {} })).rejects.toThrow("CosmWasm client is not ready");
    await expect(getQueryRaw("cosmos1contract", "state-key")).rejects.toThrow("CosmWasm client is not ready");

    const smartError = new Error("smart query failed");
    client.queryContractSmart.mockRejectedValueOnce(smartError);
    await expect(getQuerySmart("cosmos1contract", { count: {} }, client as never)).rejects.toBe(smartError);

    const rawError = new Error("raw query failed");
    client.queryContractRaw.mockRejectedValueOnce(rawError);
    await expect(getQueryRaw("cosmos1contract", "state-key", client as never)).rejects.toBe(rawError);
  });
});
