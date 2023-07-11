import type { HttpEndpoint, SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { OfflineDirectSigner, OfflineSigner } from "@cosmjs/proto-signing";
import type { StargateClientOptions } from "@cosmjs/stargate";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";

import type { GrazChain } from "../chains";

export type Clients = "cosmWasm" | "stargate" | "tendermint";

export type ConnectClientArgs<T extends Clients> = Pick<GrazChain, "rpc" | "rpcHeaders"> & {
  client: T;
};

export type ConnectClient<T> = T extends "cosmWasm"
  ? CosmWasmClient
  : T extends "stargate"
  ? StargateClient
  : T extends "tendermint"
  ? Tendermint34Client
  : never;

export const connectClient = async <T extends Clients>({ rpc, rpcHeaders, client }: ConnectClientArgs<T>) => {
  const endpoint: HttpEndpoint = { url: rpc, headers: { ...(rpcHeaders || {}) } };
  const result = await (async () => {
    switch (client) {
      case "cosmWasm":
        return CosmWasmClient.connect(endpoint);
      case "stargate":
        return StargateClient.connect(endpoint);
      case "tendermint":
        return Tendermint34Client.connect(rpc);
      default:
        throw new Error(`Unknown client: ${client}`);
    }
  })();
  return result as ConnectClient<T>;
};

export type SigningClients = "cosmWasm" | "stargate";

export type ConnectSigningClientArgs<T extends SigningClients> = Pick<GrazChain, "rpc" | "rpcHeaders"> & {
  client: T;
  offlineSignerAuto: OfflineSigner | OfflineDirectSigner;
  options?: T extends "cosmWasm" ? SigningCosmWasmClientOptions : T extends "stargate" ? StargateClientOptions : never;
};

export type ConnectSigningClient<T> = T extends "cosmWasm"
  ? SigningCosmWasmClient
  : T extends "stargate"
  ? SigningStargateClient
  : never;

export const connectSigningClient = async <T extends SigningClients>(args: ConnectSigningClientArgs<T>) => {
  const { rpc, rpcHeaders, offlineSignerAuto, client, options = {} } = args;
  const endpoint: HttpEndpoint = { url: rpc, headers: { ...(rpcHeaders || {}) } };
  const result = await (async () => {
    switch (client) {
      case "cosmWasm":
        return SigningCosmWasmClient.connectWithSigner(
          endpoint,
          offlineSignerAuto,
          options as SigningCosmWasmClientOptions,
        );
      case "stargate":
        return SigningStargateClient.connectWithSigner(endpoint, offlineSignerAuto, options as StargateClientOptions);
      default:
        throw new Error(`Unknown client: ${client}`);
    }
  })();
  return result as ConnectSigningClient<T>;
};
