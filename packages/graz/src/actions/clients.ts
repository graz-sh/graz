import type { HttpEndpoint, SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { OfflineDirectSigner, OfflineSigner } from "@cosmjs/proto-signing";
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
  offlineSignerAuto: OfflineSigner | OfflineDirectSigner;
  cosmWasmSignerOptions?: SigningCosmWasmClientOptions;
  stargateSignerOptions?: SigningStargateClientOptions;
};

export async function createSigningClients(args: CreateSigningClientArgs): Promise<GrazStore["signingClients"]> {
  const { rpc, rpcHeaders, offlineSignerAuto, cosmWasmSignerOptions = {}, stargateSignerOptions = {} } = args;
  const endpoint: HttpEndpoint = { url: rpc, headers: { ...(rpcHeaders || {}) } };
  const [cosmWasm, stargate] = await Promise.all([
    SigningCosmWasmClient.connectWithSigner(endpoint, offlineSignerAuto, cosmWasmSignerOptions),
    SigningStargateClient.connectWithSigner(endpoint, offlineSignerAuto, stargateSignerOptions),
  ]);
  return { cosmWasm, stargate };
}
