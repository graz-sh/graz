import type Station from "@terra-money/station-connector";

import type { InitiaWallet } from "../src/actions/wallet/initia";
import { CactusCosmosWallet } from "../src/actions/wallet/cactus";

type KeplrWindow = import("@keplr-wallet/types").Window;
type VectisWindow = import("@vectis/extension-client").VectisWindow;

declare global {
  interface Window extends KeplrWindow, VectisWindow {
    leap?: KeplrWindow["keplr"];
    compass?: KeplrWindow["keplr"];
    cactuslink_cosmos?: CactusCosmosWallet;
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
    okxwallet?: import("@metamask/providers").BaseProvider & {
      keplr: KeplrWindow["keplr"];
    };
    station?: Station;
    xfi?: {
      keplr: KeplrWindow["keplr"];
    };
    initia?: InitiaWallet;
  }
}
