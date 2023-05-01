type KeplrWindow = import("@keplr-wallet/types").Window;

declare interface Window extends KeplrWindow {
  leap: KeplrWindow["keplr"];
}
