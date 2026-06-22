import { describe, expect, it, vi } from "vitest";

const cosmiframeMock = vi.hoisted(() => {
  const client = {
    enable: vi.fn().mockResolvedValue(undefined),
    experimentalSuggestChain: vi.fn().mockResolvedValue(undefined),
    getKey: vi.fn(async (chainId: string) => ({
      address: new Uint8Array([1, 2, 3]),
      algo: "secp256k1",
      bech32Address: `${chainId}1address`,
      name: "iframe account",
      pubKey: new Uint8Array([4, 5, 6]),
    })),
    getOfflineSigner: vi.fn(),
    getOfflineSignerAuto: vi.fn(),
    getOfflineSignerOnlyAmino: vi.fn(),
    signAmino: vi.fn(),
    signDirect: vi.fn(),
  };
  const isReady = vi.fn().mockResolvedValue(true);

  return { client, isReady };
});

vi.mock("@dao-dao/cosmiframe", () => ({
  Cosmiframe: vi.fn(function Cosmiframe() {
    return {
      getKeplrClient: () => cosmiframeMock.client,
      isReady: cosmiframeMock.isReady,
    };
  }),
  isInIframe: vi.fn(() => true),
}));

import { makeChainInfo } from "../../__tests__/fixtures";
import { flushReact, renderComponent } from "../../__tests__/react";
import { useGrazInternalStore, useGrazSessionStore } from "../../store";
import { WalletType } from "../../types/wallet";
import { GrazEvents } from "../events";

describe("GrazEvents iframe auto-connect", () => {
  it("connects all configured chains when Cosmiframe is ready", async () => {
    const cosmoshub = makeChainInfo();
    const osmosis = makeChainInfo("osmosis-1");
    useGrazInternalStore.setState({
      chains: [cosmoshub, osmosis],
      iframeOptions: {
        allowedIframeParentOrigins: ["https://app.example"],
        autoConnect: true,
      },
    });

    const rendered = renderComponent(<GrazEvents />);

    await vi.waitFor(() => {
      expect(cosmiframeMock.client.enable).toHaveBeenCalledWith([cosmoshub.chainId, osmosis.chainId]);
    });
    expect(useGrazInternalStore.getState().walletType).toBe(WalletType.COSMIFRAME);
    expect(useGrazSessionStore.getState()).toMatchObject({
      activeChainIds: [cosmoshub.chainId, osmosis.chainId],
      status: "connected",
    });

    rendered.unmount();
    await flushReact();
  });
});
