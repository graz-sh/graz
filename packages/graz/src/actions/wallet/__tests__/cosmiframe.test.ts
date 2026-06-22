import { beforeEach, describe, expect, it, vi } from "vitest";

const cosmiframeMock = vi.hoisted(() => {
  const client = {
    enable: vi.fn().mockResolvedValue(undefined),
    experimentalSuggestChain: vi.fn().mockResolvedValue(undefined),
    getKey: vi.fn().mockResolvedValue({ bech32Address: "cosmos1address" }),
    getOfflineSigner: vi.fn(() => ({ mode: "direct" })),
    getOfflineSignerAuto: vi.fn().mockResolvedValue({ mode: "auto" }),
    getOfflineSignerOnlyAmino: vi.fn(() => ({ mode: "amino" })),
    signAmino: vi.fn().mockResolvedValue({ signed: {}, signature: {} }),
    signDirect: vi.fn().mockResolvedValue({ signed: {}, signature: {} }),
  };
  const origins: string[][] = [];
  const isInIframe = vi.fn();

  return { client, isInIframe, origins };
});

vi.mock("@dao-dao/cosmiframe", () => ({
  Cosmiframe: vi.fn(function Cosmiframe(origins: string[]) {
    cosmiframeMock.origins.push(origins);
    return {
      getKeplrClient: () => cosmiframeMock.client,
    };
  }),
  isInIframe: cosmiframeMock.isInIframe,
}));

import { useGrazInternalStore } from "../../../store";
import { getCosmiframe } from "../cosmiframe";

describe("Cosmiframe adapter", () => {
  beforeEach(() => {
    cosmiframeMock.isInIframe.mockReset();
    cosmiframeMock.origins.length = 0;
    for (const mock of Object.values(cosmiframeMock.client)) {
      if (typeof mock === "function") mock.mockClear();
    }
  });

  it("validates iframe options and parent iframe state", () => {
    const onNotFound = vi.fn();
    useGrazInternalStore.setState({ _notFoundFn: onNotFound });

    expect(() => getCosmiframe()).toThrow("no iframe options set");

    useGrazInternalStore.setState({
      iframeOptions: {
        allowedIframeParentOrigins: ["https://app.example"],
      },
    });
    cosmiframeMock.isInIframe.mockReturnValue(false);
    expect(() => getCosmiframe()).toThrow("not in iframe");

    useGrazInternalStore.setState({
      iframeOptions: {
        allowedIframeParentOrigins: [],
      },
    });
    cosmiframeMock.isInIframe.mockReturnValue(true);
    expect(() => getCosmiframe()).toThrow("no iframe allowed origins");
    expect(onNotFound).toHaveBeenCalledTimes(3);
  });

  it("delegates wallet methods to the Cosmiframe Keplr client", async () => {
    useGrazInternalStore.setState({
      iframeOptions: {
        allowedIframeParentOrigins: ["https://app.example"],
      },
    });
    cosmiframeMock.isInIframe.mockReturnValue(true);

    const wallet = getCosmiframe();

    await expect(wallet.enable(["cosmoshub-4"])).resolves.toBeUndefined();
    await expect(wallet.getKey("cosmoshub-4")).resolves.toMatchObject({ bech32Address: "cosmos1address" });
    expect(wallet.getOfflineSigner("cosmoshub-4")).toEqual({ mode: "direct" });
    await expect(wallet.getOfflineSignerAuto("cosmoshub-4")).resolves.toEqual({ mode: "auto" });
    expect(wallet.getOfflineSignerOnlyAmino("cosmoshub-4")).toEqual({ mode: "amino" });
    await expect(wallet.experimentalSuggestChain({ chainId: "cosmoshub-4" } as never)).resolves.toBeUndefined();
    await expect(wallet.signAmino("cosmoshub-4", "cosmos1address", {} as never)).resolves.toEqual({
      signed: {},
      signature: {},
    });
    await expect(wallet.signDirect("cosmoshub-4", "cosmos1address", {} as never)).resolves.toEqual({
      signed: {},
      signature: {},
    });
    expect(cosmiframeMock.origins).toEqual([["https://app.example"]]);
  });
});
