import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { CreateClientArgs, CreateSigningClientArgs } from "../actions/clients";
import { createClients, createSigningClients } from "../actions/clients";
import type { GrazStore } from "../store";
import { useGrazStore } from "../store";

export * from "./clients/tendermint";

/**
 * graz query hook to retrieve a CosmWasmClient. If there's no given arguments it will be using the current connected client
 *
 * @example
 * ```ts
 * import { useClient } from "graz";
 *
 * // use connected client's cosmwasm client
 * const { data, isFetching, refetch, ... } = useClient();
 *
 * // initialize new custom client from given arguments
 * useClient({ rpc: "https://rpc.cosmoshub.strange.love", });
 * ```
 */
export function useClients(args?: CreateClientArgs): UseQueryResult<GrazStore["clients"]> {
  const currentClient = useGrazStore((x) => x.clients);

  const queryKey = ["USE_CLIENTS", args, currentClient] as const;
  const query = useQuery(
    queryKey,
    ({ queryKey: [, _args, _current] }) => {
      return _args?.rpc ? createClients(_args) : _current;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  return query;
}

/**
 * graz query hook to retrieve a SigningCosmWasmClient. If there's no given args it will be using the current connected signer
 *
 * @example
 * ```ts
 * import { useSigningClient } from "graz";
 *
 * // get connected client's cosmwasm client
 * const { data, isFetching, refetch, ... } = useSigningClient();
 *
 * // initialize new custom client with given args
 * useSigningClient({
 *   rpc: "https://rpc.cosmoshub.strange.love",
 *   offlineSigner: customOfflineSigner,
 *   ...
 * });
 * ```
 */
export function useSigningClients(args?: CreateSigningClientArgs): UseQueryResult<GrazStore["signingClients"]> {
  const currentClient = useGrazStore((x) => x.signingClients);

  const queryKey = ["USE_SIGNING_CLIENTS", args, currentClient] as const;
  const query = useQuery(
    queryKey,
    ({ queryKey: [, _args, _current] }) => {
      return _args?.rpc ? createSigningClients(_args) : _current;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  return query;
}
