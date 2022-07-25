import type { CosmWasmClient, HttpEndpoint, SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { OfflineSigner } from "@cosmjs/proto-signing";
import type { SigningStargateClientOptions, StargateClient } from "@cosmjs/stargate";
import { SigningStargateClient } from "@cosmjs/stargate";

import type { GrazChain } from "../chains";

export interface SigningClients {
  signingCosmWasmClient: SigningCosmWasmClient;
  signingStargateClient: SigningStargateClient;
}

export interface Clients {
  cosmWasmClient: CosmWasmClient;
  stargateClient: StargateClient;
}

export type CreateClientArgs = Pick<GrazChain, "rpc" | "rpcHeaders">;

export async function createClients({ rpc, rpcHeaders }: CreateClientArgs): Promise<Clients> {
  const endpoint: HttpEndpoint = { url: rpc, headers: { ...(rpcHeaders || {}) } };
  const cosmWasmClient = await SigningCosmWasmClient.connect(endpoint);
  const stargateClient = await SigningStargateClient.connect(endpoint);
  return {
    cosmWasmClient,
    stargateClient,
  };
}

export type CreateSigningClientArgs = CreateClientArgs & {
  offlineSigner: OfflineSigner;
  cosmWasmSignerOptions?: SigningCosmWasmClientOptions;
  stargateSignerOptions?: SigningStargateClientOptions;
};

export async function createSigningClient(args: CreateSigningClientArgs): Promise<SigningClients> {
  const { rpc, rpcHeaders, offlineSigner, cosmWasmSignerOptions = {}, stargateSignerOptions = {} } = args;
  const endpoint: HttpEndpoint = { url: rpc, headers: { ...(rpcHeaders || {}) } };
  const signingCosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
    endpoint,
    offlineSigner,
    cosmWasmSignerOptions,
  );
  const signingStargateClient = await SigningStargateClient.connectWithSigner(
    endpoint,
    offlineSigner,
    stargateSignerOptions,
  );
  return {
    signingCosmWasmClient,
    signingStargateClient,
  };
}
