import type { HttpEndpoint, SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { OfflineSigner } from "@cosmjs/proto-signing";
import type { SigningStargateClientOptions } from "@cosmjs/stargate";
import { SigningStargateClient } from "@cosmjs/stargate";

import type { GrazChain } from "../chains";
import type { GrazStore } from "../store";

export type CreateClientArgs = Pick<GrazChain, "rpc" | "rpcHeaders">;

export async function createClients({ rpc, rpcHeaders }: CreateClientArgs): Promise<GrazStore["clients"]> {
  const endpoint: HttpEndpoint = { url: rpc, headers: { ...(rpcHeaders || {}) } };
  const [cosmWasm, stargate] = await Promise.all([
    SigningCosmWasmClient.connect(endpoint),
    SigningStargateClient.connect(endpoint),
  ]);
  return { cosmWasm, stargate };
}

export type CreateSigningClientArgs = CreateClientArgs & {
  offlineSigner: OfflineSigner;
  cosmWasmSignerOptions?: SigningCosmWasmClientOptions;
  stargateSignerOptions?: SigningStargateClientOptions;
};

export async function createSigningClients(args: CreateSigningClientArgs): Promise<GrazStore["signingClients"]> {
  const { rpc, rpcHeaders, offlineSigner, cosmWasmSignerOptions = {}, stargateSignerOptions = {} } = args;
  const endpoint: HttpEndpoint = { url: rpc, headers: { ...(rpcHeaders || {}) } };
  const [cosmWasm, stargate] = await Promise.all([
    SigningCosmWasmClient.connectWithSigner(endpoint, offlineSigner, cosmWasmSignerOptions),
    SigningStargateClient.connectWithSigner(endpoint, offlineSigner, stargateSignerOptions),
  ]);
  return { cosmWasm, stargate };
}
