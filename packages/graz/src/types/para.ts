import type { StdSignature } from "@cosmjs/amino";
import type { ChainInfo } from "@keplr-wallet/types";
import type { QueryClient } from "@tanstack/react-query";

import type { ParaWeb } from "@getpara/web-sdk";

import type { Wallet } from "./wallet";

/**
 * Para Web SDK client type
 * Re-exported from @getpara/web-sdk
 *
 * Note: Users must install @getpara/web-sdk or @getpara/react-sdk-lite
 * Note: Users must install @getpara/graz-integration for connector functionality
 */
export type { ParaWeb } from "@getpara/web-sdk";

/**
 * Para wallet entity (compatible with Wallet from @getpara/core-sdk)
 * Represents a wallet within the Para ecosystem (different from Graz Wallet)
 */
export interface ParaWallet {
  createdAt?: string;
  id: string;
  name?: string;
  signer: string;
  address?: string;
  addressSecondary?: string;
  publicKey?: string;
  type?: string;
  isPregen?: boolean;
  pregenIdentifier?: string;
  pregenIdentifierType?: string;
  userId?: string;
  partnerId?: string;
  lastUsedAt?: string;
  lastUsedPartnerId?: string;
  isExternal?: boolean;
  isExternalWithParaAuth?: boolean;
  externalProviderId?: string;
  isExternalWithVerification?: boolean;
  isExternalConnectionOnly?: boolean;
  ensName?: string | null;
  ensAvatar?: string | null;
}

/**
 * Event callbacks for Para wallet connector lifecycle events
 */
export interface ParaGrazConnectorEvents {
  onEnabled?: (chainIds: string[], connector: ParaGrazConnector) => void;
}

/**
 * Modal props for Para wallet UI
 * Compatible with ParaModalProps from @getpara/react-sdk-lite
 */
export interface ParaModalProps {
  /**
   * Application name displayed in the Para modal
   */
  appName: string;
  /**
   * Optional additional props for modal customization
   * See Para docs: https://docs.getpara.com/v2/react/guides/customization/modal
   */
  [key: string]: unknown;
}

/**
 * Configuration for Para wallet connector
 *
 * Note: To use Para wallet functionality, install @getpara/react-sdk-lite package
 * For modal support, you may also need @getpara/graz-integration
 */
export interface ParaGrazConfig {
  /**
   * Instance of ParaWeb SDK client
   */
  paraWeb: ParaWeb;
  /**
   * Optional event handlers for connector lifecycle
   */
  events?: ParaGrazConnectorEvents;
  /**
   * If true, skip showing the Para modal UI
   * @default false
   */
  noModal?: boolean;
  /**
   * Required connector class constructor
   * Must be provided to use Para wallet functionality
   */
  connectorClass: new (config: ParaGrazConfig, chains?: ChainInfo[] | null) => ParaGrazConnector;
  /**
   * Props for customizing the Para modal appearance and behavior
   * Only used when using @getpara/graz-integration with modal support
   */
  modalProps?: ParaModalProps;
  /**
   * React Query client instance
   * Should match the client used in your app's QueryClientProvider
   * Only needed when using @getpara/graz-integration with modal support
   */
  queryClient?: QueryClient;
}

/**
 * Para wallet connector interface
 *
 * Structural contract for the connector instance provided by
 * @getpara/graz-integration. Defined here so graz's published types stay
 * self-contained and do not pin a specific @getpara/graz-connector install.
 */
export interface ParaGrazConnector
  extends Pick<
    Wallet,
    | "enable"
    | "getKey"
    | "getOfflineSigner"
    | "getOfflineSignerOnlyAmino"
    | "getOfflineSignerAuto"
    | "signAmino"
    | "signDirect"
  > {
  disconnect: () => Promise<void>;
  getParaWebClient: () => ParaWeb;
  signArbitrary: (chainId: string, signer: string, data: string | Uint8Array) => Promise<StdSignature>;
}
