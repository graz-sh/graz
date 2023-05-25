import type { GrazChain } from "../chains";
import type { GrazStore } from "../store";
import { useGrazStore } from "../store";
import type { WalletType } from "../types/wallet";

export interface ConfigureGrazArgs {
  defaultChain?: GrazChain;
  defaultSigningClient?: GrazStore["defaultSigningClient"];
  defaultWallet?: WalletType;
  onNotFound?: () => void;
  onReconnectFailed?: () => void;
  walletConnect?: GrazStore["walletConnect"];
  /**
   * default to true
   */
  autoReconnect?: boolean;
}

export const configureGraz = (args: ConfigureGrazArgs = {}): ConfigureGrazArgs => {
  useGrazStore.setState((prev) => ({
    defaultChain: args.defaultChain || prev.defaultChain,
    defaultSigningClient: args.defaultSigningClient || prev.defaultSigningClient,
    walletConnect: args.walletConnect || prev.walletConnect,
    walletType: args.defaultWallet || prev.walletType,
    _notFoundFn: args.onNotFound || prev._notFoundFn,
    _onReconnectFailed: args.onReconnectFailed || prev._onReconnectFailed,
    _reconnect: args.autoReconnect === undefined ? true : args.autoReconnect || prev._reconnect,
  }));
  return args;
};
