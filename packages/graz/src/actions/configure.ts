import type { GrazChain } from "../chains";
import { configureDefaultChain } from "./chains";
import { registerKeplrNotFound } from "./keplr";

export interface ConfigureGrazArgs {
  defaultChain?: GrazChain;
  onKeplrNotFound?: () => void;
}

export function configureGraz(args: ConfigureGrazArgs = {}): ConfigureGrazArgs {
  const { defaultChain, onKeplrNotFound } = args;

  if (defaultChain) {
    configureDefaultChain(defaultChain);
  }

  if (onKeplrNotFound) {
    registerKeplrNotFound(onKeplrNotFound);
  }

  return args;
}
