import type { Keplr } from "@keplr-wallet/types";

export interface GrazE2EChainConfig {
  chainId: string;
  chainName: string;
  rpc: string;
  rest: string;
  bech32Prefix: string;
  denom: string;
  displayDenom: string;
  gasPrice: string;
  rpcHeaders?: Record<string, string>;
  expectedAddress?: string;
  enableTx?: boolean;
  recipientAddress?: string;
}

export interface GrazE2EConfig {
  mnemonic?: string;
  chain: GrazE2EChainConfig;
}

export interface GrazE2EWalletState {
  enabledChainIds: string[];
  suggestedChainIds: string[];
  calls: string[];
}

declare global {
  interface Window {
    __GRAZ_E2E_CONFIG__?: GrazE2EConfig;
    __GRAZ_E2E_WALLET_STATE__?: GrazE2EWalletState;
    keplr?: Keplr;
  }
}
