type KeplrWindow = import("@keplr-wallet/types").Window;
type VectisWindow = import("@vectis/extension-client").VectisWindow;

declare interface Window extends KeplrWindow {
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
  vectis: VectisWindow["vectis"];
}
