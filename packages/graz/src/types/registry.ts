/**
 * Asset lists are a similar mechanism to allow frontends and other UIs to fetch metadata
 * associated with Cosmos SDK denoms, especially for assets sent over IBC.
 */
export interface AssetList {
  $schema?: string;
  assets: Asset[];
  chain_name: string;
}

export interface Asset {
  /**
   * [OPTIONAL] The address of the asset. Only required for type_asset : cw20, snip20
   */
  address?: string;
  /**
   * The base unit of the asset. Must be in denom_units.
   */
  base: string;
  /**
   * [OPTIONAL] The coingecko id to fetch asset data from coingecko v3 api. See
   * https://api.coingecko.com/api/v3/coins/list
   */
  coingecko_id?: string;
  denom_units: DenomUnit[];
  /**
   * [OPTIONAL] A short description of the asset
   */
  description?: string;
  /**
   * The human friendly unit of the asset. Must be in denom_units.
   */
  display: string;
  /**
   * [OPTIONAL] IBC Channel between src and dst between chain
   */
  ibc?: Ibc;
  images?: AssetImage[];
  keywords?: string[];
  logo_URIs?: AssetLogoURIs;
  /**
   * The project name of the asset. For example Bitcoin.
   */
  name: string;
  /**
   * The symbol of an asset. For example BTC.
   */
  symbol: string;
  /**
   * The origin of the asset, starting with the index, and capturing all transitions in form
   * and location.
   */
  traces?: Trace[];
  /**
   * [OPTIONAL] The potential options for type of asset. By default, assumes sdk.coin
   */
  type_asset?: TypeAsset;
}

export interface DenomUnit {
  aliases?: string[];
  denom: string;
  exponent: number;
}

/**
 * [OPTIONAL] IBC Channel between src and dst between chain
 */
export interface Ibc {
  dst_channel: string;
  source_channel: string;
  source_denom: string;
}

export interface AssetImage {
  png?: string;
  svg?: string;
  theme?: Theme;
}

export interface Theme {
  primary_color_hex?: string;
}

export interface AssetLogoURIs {
  png?: string;
  svg?: string;
}

export interface Trace {
  chain?: TraceChain;
  counterparty: Counterparty;
  /**
   * The entity offering the service. E.g., 'Gravity Bridge' [Network] or 'Tether' [Company].
   */
  provider?: string;
  type: TraceType;
}

export interface TraceChain {
  /**
   * The chain's IBC transfer channel(, e.g., 'channel-1').
   */
  channel_id?: string;
  /**
   * The contract address where the transition takes place, where applicable. E.g., The
   * Ethereum contract that locks up the asset while it's minted on another chain.
   */
  contract?: string;
  /**
   * The port/channel/denom input string that generates the 'ibc/...' denom.
   */
  path?: string;
  /**
   * The port used to transfer IBC assets; often 'transfer', but sometimes varies, e.g., for
   * outgoing cw20 transfers.
   */
  port?: string;
}

export interface Counterparty {
  /**
   * The base unit of the asset on its source platform. E.g., when describing ATOM from Cosmos
   * Hub, specify 'uatom', NOT 'atom' nor 'ATOM'; base units are unique per platform.
   */
  base_denom: string;
  /**
   * The name of the counterparty chain. (must match exactly the chain name used in the Chain
   * Registry)
   *
   * The chain or platform from which the asset originates. E.g., 'cosmoshub', 'ethereum',
   * 'forex', or 'nasdaq'
   */
  chain_name: string;
  /**
   * The counterparty IBC transfer channel(, e.g., 'channel-1').
   */
  channel_id?: string;
  /**
   * The contract address where the transition takes place, where applicable. E.g., The
   * Ethereum contract that locks up the asset while it's minted on another chain.
   */
  contract?: string;
  /**
   * The port used to transfer IBC assets; often 'transfer', but sometimes varies, e.g., for
   * outgoing cw20 transfers.
   */
  port?: string;
}

export enum TraceType {
  Bridge = "bridge",
  Ibc = "ibc",
  IbcCw20 = "ibc-cw20",
  LiquidStake = "liquid-stake",
  Synthetic = "synthetic",
  Wrapped = "wrapped",
}

/**
 * [OPTIONAL] The potential options for type of asset. By default, assumes sdk.coin
 */
export enum TypeAsset {
  Cw20 = "cw20",
  Erc20 = "erc20",
  Ics20 = "ics20",
  SDKCoin = "sdk.coin",
  Snip20 = "snip20",
  Snip25 = "snip25",
}

/**
 * Cosmos Chain.json is a metadata file that contains information about a cosmos sdk based
 * chain.
 */
export interface Chain {
  $schema?: string;
  alternative_slip44s?: number[];
  apis?: Apis;
  /**
   * Used to override the bech32_prefix for specific uses.
   */
  bech32_config?: Bech32Config;
  /**
   * The default prefix for the human-readable part of addresses that identifies the coin
   * type. Must be registered with SLIP-0173. E.g., 'cosmos'
   */
  bech32_prefix: string;
  chain_id: string;
  chain_name: string;
  codebase?: Codebase;
  daemon_name?: string;
  explorers?: Explorer[];
  extra_codecs?: ExtraCodec[];
  fees?: Fees;
  images?: ChainImage[];
  key_algos?: KeyAlgo[];
  keywords?: string[];
  logo_URIs?: ChainLogoURIs;
  network_type?: NetworkType;
  node_home?: string;
  peers?: Peers;
  pretty_name?: string;
  slip44?: number;
  staking?: Staking;
  status?: Status;
  update_link?: string;
  website?: string;
}

export interface Apis {
  "evm-http-jsonrpc"?: Api[];
  grpc?: Api[];
  "grpc-web"?: Api[];
  rest?: Api[];
  rpc?: Api[];
  wss?: Api[];
}

export interface Api {
  address: string;
  archive?: boolean;
  provider?: string;
}

/**
 * Used to override the bech32_prefix for specific uses.
 */
export interface Bech32Config {
  /**
   * e.g., 'cosmos'
   */
  bech32PrefixAccAddr?: string;
  /**
   * e.g., 'cosmospub'
   */
  bech32PrefixAccPub?: string;
  /**
   * e.g., 'cosmosvalcons'
   */
  bech32PrefixConsAddr?: string;
  /**
   * e.g., 'cosmosvalconspub'
   */
  bech32PrefixConsPub?: string;
  /**
   * e.g., 'cosmosvaloper'
   */
  bech32PrefixValAddr?: string;
  /**
   * e.g., 'cosmosvaloperpub'
   */
  bech32PrefixValPub?: string;
}

export interface Codebase {
  binaries?: CodebaseBinaries;
  compatible_versions?: string[];
  consensus?: CodebaseConsensus;
  cosmos_sdk_version?: string;
  cosmwasm_enabled?: boolean;
  /**
   * Relative path to the cosmwasm directory. ex. $HOME/.juno/data/wasm
   */
  cosmwasm_path?: string;
  cosmwasm_version?: string;
  genesis?: Genesis;
  git_repo?: string;
  ibc_go_version?: string;
  /**
   * List of IBC apps (usually corresponding to a ICS standard) which have been enabled on the
   * network.
   */
  ics_enabled?: ICSEnabled[];
  recommended_version?: string;
  versions?: Version[];
}

export interface CodebaseBinaries {
  "darwin/amd64"?: string;
  "darwin/arm64"?: string;
  "linux/amd64"?: string;
  "linux/arm64"?: string;
  "windows/amd64"?: string;
}

export interface CodebaseConsensus {
  type: ConsensusType;
  version?: string;
}

export enum ConsensusType {
  Cometbft = "cometbft",
  Tendermint = "tendermint",
}

export interface Genesis {
  genesis_url: string;
  name?: string;
}

/**
 * IBC app or ICS standard.
 */
export enum ICSEnabled {
  Ics201 = "ics20-1",
  Ics271 = "ics27-1",
  Mauth = "mauth",
}

export interface Version {
  binaries?: VersionBinaries;
  compatible_versions?: string[];
  consensus?: VersionConsensus;
  cosmos_sdk_version?: string;
  cosmwasm_enabled?: boolean;
  /**
   * Relative path to the cosmwasm directory. ex. $HOME/.juno/data/wasm
   */
  cosmwasm_path?: string;
  cosmwasm_version?: string;
  /**
   * Block Height
   */
  height?: number;
  ibc_go_version?: string;
  /**
   * List of IBC apps (usually corresponding to a ICS standard) which have been enabled on the
   * network.
   */
  ics_enabled?: ICSEnabled[];
  /**
   * Official Upgrade Name
   */
  name: string;
  /**
   * [Optional] Name of the following version
   */
  next_version_name?: string;
  /**
   * Proposal that will officially signal community acceptance of the upgrade.
   */
  proposal?: number;
  recommended_version?: string;
  /**
   * Git Upgrade Tag
   */
  tag?: string;
}

export interface VersionBinaries {
  "darwin/amd64"?: string;
  "darwin/arm64"?: string;
  "linux/amd64"?: string;
  "linux/arm64"?: string;
  "windows/amd64"?: string;
}

export interface VersionConsensus {
  type: ConsensusType;
  version?: string;
}

export interface Explorer {
  account_page?: string;
  kind?: string;
  tx_page?: string;
  url?: string;
}

export enum ExtraCodec {
  Ethermint = "ethermint",
  Injective = "injective",
}

export interface Fees {
  fee_tokens: FeeToken[];
}

export interface FeeToken {
  average_gas_price?: number;
  denom: string;
  fixed_min_gas_price?: number;
  gas_costs?: GasCosts;
  high_gas_price?: number;
  low_gas_price?: number;
}

export interface GasCosts {
  cosmos_send?: number;
  ibc_transfer?: number;
}

export interface ChainImage {
  png?: string;
  svg?: string;
  theme?: Theme;
}

export enum KeyAlgo {
  Ed25519 = "ed25519",
  Ethsecp256K1 = "ethsecp256k1",
  Secp256K1 = "secp256k1",
  Sr25519 = "sr25519",
}

export interface ChainLogoURIs {
  png?: string;
  svg?: string;
}

export enum NetworkType {
  Devnet = "devnet",
  Mainnet = "mainnet",
  Testnet = "testnet",
}

export interface Peers {
  persistent_peers?: PersistentPeer[];
  seeds?: PersistentPeer[];
}

export interface PersistentPeer {
  address: string;
  id: string;
  provider?: string;
}

export interface Staking {
  lock_duration?: LockDuration;
  staking_tokens: StakingToken[];
}

export interface LockDuration {
  /**
   * The number of blocks for which the staked tokens are locked.
   */
  blocks?: number;
  /**
   * The approximate time for which the staked tokens are locked.
   */
  time?: string;
}

export interface StakingToken {
  denom: string;
}

export enum Status {
  Killed = "killed",
  Live = "live",
  Upcoming = "upcoming",
}

export interface IbcDataSchema {
  $schema?: string;
  chain_1: IbcDataSchemaChain;
  chain_2: IbcDataSchemaChain;
  channels: Channel[];
}

/**
 * Top level IBC data pertaining to the chain. `chain_1` and `chain_2` should be in
 * alphabetical order.
 */
export interface IbcDataSchemaChain {
  chain_name: string;
  /**
   * The client ID on the corresponding chain representing the other chain's light client.
   */
  client_id: string;
  /**
   * The connection ID on the corresponding chain representing a connection to the other chain.
   */
  connection_id: string;
}

export interface Channel {
  chain_1: ChannelChain;
  chain_2: ChannelChain;
  /**
   * Human readable description of the channel.
   */
  description?: string;
  /**
   * Determines if packets from a sending module must be 'ordered' or 'unordered'.
   */
  ordering: Ordering;
  /**
   * Human readable key:value pairs that help describe and distinguish channels.
   */
  tags?: Tags;
  /**
   * IBC Version
   */
  version: string;
}

export interface ChannelChain {
  /**
   * The channel ID on the corresponding chain's connection representing a channel on the
   * other chain.
   */
  channel_id: string;
  /**
   * The IBC port ID which a relevant module binds to on the corresponding chain.
   */
  port_id: string;
}

/**
 * Determines if packets from a sending module must be 'ordered' or 'unordered'.
 */
export enum Ordering {
  Ordered = "ordered",
  Unordered = "unordered",
}

/**
 * Human readable key:value pairs that help describe and distinguish channels.
 */
export interface Tags {
  dex?: string;
  preferred?: boolean;
  /**
   * String that helps describe non-dex use cases ex: interchain accounts(ICA).
   */
  properties?: string;
  status?: Status;
  [property: string]: any;
}

export interface MemoKeysSchema {
  $schema?: string;
  memo_keys: MemoKey[];
}

export interface MemoKey {
  description: string;
  git_repo: string;
  key: string;
  memo: Record<string, any>;
  [property: string]: any;
}
