import type { HttpEndpoint, SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { OfflineDirectSigner, OfflineSigner } from "@cosmjs/proto-signing";
import type { SigningStargateClientOptions } from "@cosmjs/stargate";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";

import type { GrazChain } from "../chains";
import type { GrazSessionStore } from "../store";

export * from "./clients/tendermint";

export type CreateClientArgs = Pick<GrazChain, "rpc" | "rpcHeaders">;

export const createClients = async ({ rpc, rpcHeaders }: CreateClientArgs): Promise<GrazSessionStore["clients"]> => {
  const endpoint: HttpEndpoint = { url: rpc, headers: { ...(rpcHeaders || {}) } };
  const [cosmWasm, stargate, tendermint] = await Promise.all([
    SigningCosmWasmClient.connect(endpoint),
    SigningStargateClient.connect(endpoint),
    Tendermint34Client.connect(rpc),
  ]);
  return { cosmWasm, stargate, tendermint };
};

export type CreateSigningClientArgs = CreateClientArgs & {
  offlineSignerAuto: OfflineSigner | OfflineDirectSigner;
  cosmWasmSignerOptions?: SigningCosmWasmClientOptions;
  stargateSignerOptions?: SigningStargateClientOptions;
};

export const createSigningClients = async (
  args: CreateSigningClientArgs,
): Promise<GrazSessionStore["signingClients"]> => {
  const { rpc, rpcHeaders, offlineSignerAuto, cosmWasmSignerOptions = {}, stargateSignerOptions = {} } = args;
  const endpoint: HttpEndpoint = { url: rpc, headers: { ...(rpcHeaders || {}) } };
  const [cosmWasm, stargate] = await Promise.all([
    SigningCosmWasmClient.connectWithSigner(endpoint, offlineSignerAuto, cosmWasmSignerOptions),
    SigningStargateClient.connectWithSigner(endpoint, offlineSignerAuto, stargateSignerOptions),
  ]);
  return { cosmWasm, stargate };
};
