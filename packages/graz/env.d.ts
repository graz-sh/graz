type KeplrWindow = import("@keplr-wallet/types").Window;

declare namespace NodeJS {
  interface ProcessEnv {
    readonly GRAZ_REGISTRY_SRC?: string;
  }
}

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
}
