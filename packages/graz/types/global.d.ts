import type Station from "@terra-money/station-connector";

type KeplrWindow = import("@keplr-wallet/types").Window;
type VectisWindow = import("@vectis/extension-client").VectisWindow;

declare global {
  interface Window extends KeplrWindow, VectisWindow {
    leap?: KeplrWindow["keplr"];
    cosmostation?: {
      cosmos: {
        on: (type: string, listener: EventListenerOrEventListenerObject) => void;
        off: (type: string, listener: EventListenerOrEventListenerObject) => void;
      };
      providers: {
        keplr: KeplrWindow["keplr"];
      };
    };
    ethereum?: import("@metamask/providers").MetaMaskInpageProvider;
    station?: Station;
    xfi?: {
      keplr: KeplrWindow["keplr"];
    };
  }
}
