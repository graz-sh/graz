type KeplrWindow = import("@keplr-wallet/types").Window;
type VectisWindow = import("@vectis/extension-client").VectisWindow;
type EthereumWindow = import("@metamask/providers").MetaMaskInpageProvider;

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
  ethereum?: EthereumWindow;
}
