import type { GrazChain } from "../chains";
import type { GrazStore } from "../store";
import { useGrazStore } from "../store";
import { registerKeplrNotFound } from "./keplr";

export interface ConfigureGrazArgs {
  defaultChain?: GrazChain;
  defaultSigningClient?: GrazStore["defaultSigningClient"];
  onKeplrNotFound?: () => void;
}

export function configureGraz(args: ConfigureGrazArgs = {}): ConfigureGrazArgs {
  if (args.defaultChain) {
    useGrazStore.setState({ defaultChain: args.defaultChain });
  }
  if (args.defaultSigningClient) {
    useGrazStore.setState({ defaultSigningClient: args.defaultSigningClient });
  }
  if (args.onKeplrNotFound) {
    registerKeplrNotFound(args.onKeplrNotFound);
  }
  return args;
}
