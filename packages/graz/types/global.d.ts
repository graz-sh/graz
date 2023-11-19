type KeplrWindow = import("@keplr-wallet/types").Window;
type VectisWindow = import("@vectis/extension-client").VectisWindow;
type StationWindow = import("@terra-money/station-wallet").Window;
import { Station } from "@terra-money/station-connector";

interface Window extends KeplrWindow, VectisWindow, StationWindow {
  leap: KeplrWindow["keplr"];
  cosmostation: {
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
}
