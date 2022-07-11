import type { CosmWasmClient, HttpEndpoint, SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { OfflineSigner } from "@cosmjs/proto-signing";

import type { GrazChain } from "../chains";

export type CreateClientArgs = Pick<GrazChain, "rpc" | "rpcHeaders">;

export async function createClient({ rpc, rpcHeaders }: CreateClientArgs): Promise<CosmWasmClient> {
  const endpoint: HttpEndpoint = { url: rpc, headers: { ...(rpcHeaders || {}) } };
  const client = await SigningCosmWasmClient.connect(endpoint);
  return client;
}

export type CreateSigningClientArgs = CreateClientArgs & {
  offlineSigner: OfflineSigner;
  signerOptions?: SigningCosmWasmClientOptions;
};

export async function createSigningClient(args: CreateSigningClientArgs): Promise<SigningCosmWasmClient> {
  const { rpc, rpcHeaders, offlineSigner, signerOptions = {} } = args;
  const endpoint: HttpEndpoint = { url: rpc, headers: { ...(rpcHeaders || {}) } };
  const signingClient = await SigningCosmWasmClient.connectWithSigner(endpoint, offlineSigner, signerOptions);
  return signingClient;
}
