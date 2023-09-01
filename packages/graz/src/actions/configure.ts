import type { GrazChain } from "../chains";
import type { GrazInternalStore } from "../store";
import { useGrazInternalStore } from "../store";
import type { WalletType } from "../types/wallet";

export interface ConfigureGrazArgs {
  defaultChain?: GrazChain;
  defaultWallet?: WalletType;
  onNotFound?: () => void;
  onReconnectFailed?: () => void;
  walletConnect?: GrazInternalStore["walletConnect"];
  /**
   * default to true
   */
  autoReconnect?: boolean;
}

export const configureGraz = (args: ConfigureGrazArgs = {}): ConfigureGrazArgs => {
  useGrazInternalStore.setState((prev) => ({
    defaultChain: args.defaultChain || prev.defaultChain,
    walletConnect: args.walletConnect || prev.walletConnect,
    walletType: args.defaultWallet || prev.walletType,
    _notFoundFn: args.onNotFound || prev._notFoundFn,
    _onReconnectFailed: args.onReconnectFailed || prev._onReconnectFailed,
    _reconnect: args.autoReconnect === undefined ? true : args.autoReconnect || prev._reconnect,
  }));
  return args;
};
