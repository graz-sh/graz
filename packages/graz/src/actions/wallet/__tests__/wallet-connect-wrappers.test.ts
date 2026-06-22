import { beforeEach, describe, expect, it, vi } from "vitest";

const getWalletConnectMock = vi.hoisted(() => vi.fn((params: unknown) => params));

vi.mock("../wallet-connect", () => ({
  getWalletConnect: getWalletConnectMock,
}));

import { useGrazInternalStore } from "../../../store";
import { WalletType } from "../../../types/wallet";
import { getWCClot } from "../wallet-connect/clot";
import { getWCCosmostation } from "../wallet-connect/cosmostation";
import { getWCKeplr } from "../wallet-connect/keplr";
import { getWCLeap } from "../wallet-connect/leap";

type CapturedWalletConnectParams = {
  appUrl: {
    mobile: {
      android: string;
      ios: string;
    };
  };
  encoding: string;
  formatNativeUrl: (appUrl: string, wcUri: string | undefined, os: string) => string;
  walletType: WalletType;
};

const setUserAgent = (userAgent: string) => {
  vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue(userAgent);
};

const getParams = (wallet: unknown): CapturedWalletConnectParams => wallet as CapturedWalletConnectParams;

describe("WalletConnect mobile wrappers", () => {
  beforeEach(() => {
    getWalletConnectMock.mockClear();
    useGrazInternalStore.setState({
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });
  });

  it("guards project id and mobile user agents before creating wrappers", () => {
    useGrazInternalStore.setState({ walletConnect: null });

    expect(() => getWCKeplr()).toThrow("walletConnect.options.projectId is not defined");

    useGrazInternalStore.setState({
      walletConnect: {
        options: {
          projectId: "project-id",
        },
      },
    });
    setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)");

    expect(() => getWCLeap()).toThrow("WalletConnect Leap mobile is only supported in mobile");
    expect(getWalletConnectMock).not.toHaveBeenCalled();
  });

  it("formats Keplr mobile deep links for iOS, Android, and fallback OS values", () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)");

    const params = getParams(getWCKeplr());

    expect(params).toMatchObject({
      encoding: "base64",
      walletType: WalletType.WC_KEPLR_MOBILE,
    });
    expect(params.formatNativeUrl(params.appUrl.mobile.ios, undefined, "ios")).toBe("keplrwallet://wcV2");
    expect(params.formatNativeUrl(params.appUrl.mobile.ios, "wc:topic", "ios")).toBe(
      "keplrwallet://wcV2?wc%3Atopic",
    );
    expect(params.formatNativeUrl(params.appUrl.mobile.android, undefined, "android")).toBe(
      "intent://wcV2#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;",
    );
    expect(params.formatNativeUrl(params.appUrl.mobile.android, "wc:topic", "android")).toBe(
      "intent://wcV2?wc%3Atopic#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;",
    );
    expect(params.formatNativeUrl("keplrwallet://", "wc:topic", "other")).toBe(
      "keplrwallet://wc?uri=wc%3Atopic",
    );
  });

  it("formats Leap, Cosmostation, and Clot mobile deep links", () => {
    setUserAgent("Mozilla/5.0 (Linux; Android 14)");

    const leap = getParams(getWCLeap());
    const cosmostation = getParams(getWCCosmostation());
    const clot = getParams(getWCClot());

    expect(leap).toMatchObject({
      encoding: "base64",
      walletType: WalletType.WC_LEAP_MOBILE,
    });
    expect(leap.formatNativeUrl(leap.appUrl.mobile.ios, "wc:topic", "ios")).toBe("leapcosmos://wcV2?wc%3Atopic");
    expect(leap.formatNativeUrl(leap.appUrl.mobile.android, undefined, "android")).toBe(
      "intent://wcV2#Intent;package=io.leapwallet.cosmos;scheme=leapwallet;end;",
    );
    expect(leap.formatNativeUrl(leap.appUrl.mobile.android, "wc:topic", "android")).toBe(
      "intent://wcV2?wc%3Atopic#Intent;package=io.leapwallet.cosmos;scheme=leapwallet;end;",
    );
    expect(leap.formatNativeUrl("leapcosmos://", "wc:topic", "other")).toBe("leapcosmos://wc?uri=wc%3Atopic");

    expect(cosmostation).toMatchObject({
      encoding: "hex",
      walletType: WalletType.WC_COSMOSTATION_MOBILE,
    });
    expect(cosmostation.formatNativeUrl(cosmostation.appUrl.mobile.android, undefined, "android")).toBe(
      "cosmostation://wc",
    );
    expect(cosmostation.formatNativeUrl(cosmostation.appUrl.mobile.android, "wc:topic", "android")).toBe(
      "cosmostation://wc?wc:topic",
    );

    expect(clot).toMatchObject({
      encoding: "base64",
      walletType: WalletType.WC_CLOT_MOBILE,
    });
    expect(clot.formatNativeUrl(clot.appUrl.mobile.ios, undefined, "ios")).toBe("clot://wcV2");
    expect(clot.formatNativeUrl(clot.appUrl.mobile.ios, "wc:topic", "ios")).toBe("clot://wcV2?wc%3Atopic");
    expect(clot.formatNativeUrl(clot.appUrl.mobile.android, undefined, "android")).toBe("clot://wc");
    expect(clot.formatNativeUrl(clot.appUrl.mobile.android, "wc:topic", "android")).toBe("clot://wc?uri=wc%3Atopic");
  });
});
