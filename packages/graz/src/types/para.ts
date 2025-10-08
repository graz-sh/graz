import type { AminoSignResponse, OfflineAminoSigner, StdSignature, StdSignDoc } from "@cosmjs/amino";
import type { DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { ChainInfo, KeplrSignOptions } from "@keplr-wallet/types";

import type { Key, SignDoc, Wallet } from "./wallet";

// Import for local use in this file
import type { ParaWeb } from "@getpara/web-sdk";
import type { ParaGrazConfig as ExternalParaGrazConfig } from "@getpara/graz-connector";

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
 * Extracted from @getpara/graz-connector ParaGrazConfig
 */
export type ParaGrazConnectorEvents = NonNullable<ExternalParaGrazConfig["events"]>;

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
   * Optional connector class constructor to use instead of default
   * Allows for custom Para connector implementations
   */
  connectorClass?: new (config: ParaGrazConfig, chains?: ChainInfo[] | null) => ParaGrazConnector;
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
  queryClient?: import("@tanstack/react-query").QueryClient;
}

/**
 * Para wallet connector interface
 * Implements the Graz Wallet interface with Para-specific methods
 */
export interface ParaGrazConnector extends Omit<Wallet, "experimentalSuggestChain"> {
  /**
   * Enable connection to one or more chains
   * @param chainIds - Single chain ID or array of chain IDs
   */
  enable(chainIds: string | string[]): Promise<void>;

  /**
   * Disconnect from Para wallet
   */
  disconnect(): Promise<void>;

  /**
   * Get the Para Web SDK client instance
   */
  getParaWebClient(): ParaWeb;

  /**
   * Get the connector configuration
   */
  getConfig(): ParaGrazConfig;

  /**
   * Get account key for a specific chain
   * @param chainId - The chain identifier
   */
  getKey(chainId: string): Promise<Key>;

  /**
   * Get offline signer that only supports Amino signing
   * @param chainId - The chain identifier
   */
  getOfflineSignerOnlyAmino(chainId: string): OfflineAminoSigner;

  /**
   * Get hybrid offline signer supporting both Amino and Direct signing
   * @param chainId - The chain identifier
   */
  getOfflineSigner(chainId: string): OfflineAminoSigner & OfflineDirectSigner;

  /**
   * Get offline signer, automatically choosing between Amino and Direct
   * @param chainId - The chain identifier
   */
  getOfflineSignerAuto(chainId: string): Promise<OfflineAminoSigner | OfflineDirectSigner>;

  /**
   * Sign transaction using Amino format
   * @param chainId - The chain identifier
   * @param signer - The signer address
   * @param signDoc - The Amino sign document
   * @param signOptions - Optional signing options
   */
  signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: KeplrSignOptions,
  ): Promise<AminoSignResponse>;

  /**
   * Sign transaction using Direct/Protobuf format
   * @param chainId - The chain identifier
   * @param signer - The signer address
   * @param signDoc - The Direct sign document
   * @param signOptions - Optional signing options
   */
  signDirect(
    chainId: string,
    signer: string,
    signDoc: SignDoc,
    signOptions?: KeplrSignOptions,
  ): Promise<DirectSignResponse>;

  /**
   * Sign arbitrary data
   * @param chainId - The chain identifier
   * @param signer - The signer address
   * @param data - Data to sign (string or bytes)
   */
  signArbitrary(chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature>;
}
