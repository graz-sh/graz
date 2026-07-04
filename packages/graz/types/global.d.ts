import type { InitiaWallet } from "../src/actions/wallet/initia";

type KeplrWindow = import("@keplr-wallet/types").Window;
type VectisWindow = import("@vectis/extension-client").VectisWindow;

type StationChainInfoResponse = {
  chainId: string;
  chainName: string;
  chainSymbolImageUrl: string;
  stakeCurrency: {
    coinDecimals: number;
    coinDenom: string;
    coinImageUrl: string;
    coinMinimalDenom: string;
  };
  bip44: {
    coinType: number;
  };
  bech32Config: {
    bech32PrefixAccAddr: string;
    bech32PrefixAccPub: string;
    bech32PrefixConsAddr: string;
    bech32PrefixConsPub: string;
    bech32PrefixValAddr: string;
    bech32PrefixValPub: string;
  };
  currencies: {
    coinDecimals: number;
    coinDenom: string;
    coinImageUrl: string;
    coinMinimalDenom: string;
  }[];
  /**
   * This indicates which coin or token can be used for fee to send transaction.
   * You can get actual currency information from Currencies.
   */
  feeCurrencies: {
    coinDecimals: number;
    coinDenom: string;
    coinImageUrl: string;
    coinMinimalDenom: string;
    gasPriceStep: {
      average: number;
      high: number;
      low: number;
    };
  }[];
};

declare global {
  interface Window extends KeplrWindow, VectisWindow {
    compass?: KeplrWindow["keplr"];
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
    station?: {
      keplr: KeplrWindow["keplr"] & {
        experimentalSuggestChain: (chainInfo: StationChainInfoResponse) => Promise<void>;
      };
    };
    xfi?: {
      keplr: KeplrWindow["keplr"];
    };
    initia?: InitiaWallet;
    cactuslink_cosmos?: KeplrWindow["keplr"];
  }
}
