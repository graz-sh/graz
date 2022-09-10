import type { GrazChain } from "../chains";
import type { GrazStore } from "../store";
import { useGrazStore } from "../store";

export interface ConfigureGrazArgs {
  defaultChain?: GrazChain;
  defaultSigningClient?: GrazStore["defaultSigningClient"];
  onNotFound?: () => void;
}

export function configureGraz(args: ConfigureGrazArgs = {}): ConfigureGrazArgs {
  useGrazStore.setState((prev) => ({
    defaultChain: args.defaultChain || prev.defaultChain,
    defaultSigningClient: args.defaultSigningClient || args.defaultSigningClient,
    _notFoundFn: args.onNotFound || prev._notFoundFn,
  }));
  return args;
}
