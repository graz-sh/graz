import type { AminoSignResponse, OfflineAminoSigner, StdSignature, StdSignDoc } from "@cosmjs/amino";
import type { DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { ChainInfo, KeplrSignOptions } from "@keplr-wallet/types";

import type { Key, SignDoc, Wallet } from "./wallet";

/**
 * Para Web SDK client type (compatible with ParaWeb from @getpara/web-sdk)
 * This represents the main Para class for web interactions
 *
 * Note: Users must install @getpara/graz-integration to use Para wallet functionality
 *
 * Note: This interface only defines the minimum required properties.
 * The actual Para class may have additional methods and properties.
 */
export interface ParaWeb {
  isReady: boolean;
  isFarcasterMiniApp: boolean;
  ready(): Promise<void>;
  isPasskeySupported(): Promise<boolean>;
  logout(): Promise<void>;
}

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
  /**
   * Called when chains are successfully enabled in the Para connector
   * @param chainIds - Array of enabled chain IDs
   * @param connector - The initialized Para connector instance
   */
  onEnabled?: (chainIds: string[], connector: any) => void;
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
  queryClient?: unknown;
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
