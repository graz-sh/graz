import type { HttpEndpoint, SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { OfflineDirectSigner, OfflineSigner } from "@cosmjs/proto-signing";
import type { StargateClientOptions } from "@cosmjs/stargate";
import { SigningStargateClient, StargateClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";

import type { GrazChain } from "../chains";

export type GrazClients = "cosmWasm" | "stargate" | "tendermint";

export type GrazConnectClientArgs<T extends GrazClients> = Pick<GrazChain, "rpc" | "rpcHeaders"> & {
  client: T;
};

export type GrazConnectClient<T> = T extends "cosmWasm"
  ? CosmWasmClient
  : T extends "stargate"
  ? StargateClient
  : T extends "tendermint"
  ? Tendermint34Client
  : never;

export const connectClient = async <T extends GrazClients>({ rpc, rpcHeaders, client }: GrazConnectClientArgs<T>) => {
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
  return result as GrazConnectClient<T>;
};

export type GrazSigningClients = "cosmWasm" | "stargate";

export type GrazConnectSigningClientArgs<T extends GrazSigningClients> = Pick<GrazChain, "rpc" | "rpcHeaders"> & {
  client: T;
  offlineSignerAuto: OfflineSigner | OfflineDirectSigner;
  options?: T extends "cosmWasm" ? SigningCosmWasmClientOptions : T extends "stargate" ? StargateClientOptions : never;
};

export type GrazConnectSigningClient<T> = T extends "cosmWasm"
  ? SigningCosmWasmClient
  : T extends "stargate"
  ? SigningStargateClient
  : never;

export const connectSigningClient = async <T extends GrazSigningClients>(args: GrazConnectSigningClientArgs<T>) => {
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
  return result as GrazConnectSigningClient<T>;
};
