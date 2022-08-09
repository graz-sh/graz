import type { GrazChain } from "../chains";
import { useGrazStore } from "../store";
import { registerKeplrNotFound } from "./keplr";

export interface ConfigureGrazArgs {
  defaultChain?: GrazChain;
  onKeplrNotFound?: () => void;
}

export function configureGraz(args: ConfigureGrazArgs = {}): ConfigureGrazArgs {
  const { defaultChain, onKeplrNotFound } = args;

  if (defaultChain) {
    useGrazStore.setState({ defaultChain });
  }

  if (onKeplrNotFound) {
    registerKeplrNotFound(onKeplrNotFound);
  }

  return args;
}
