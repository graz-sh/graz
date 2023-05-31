import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import type { CreateClientArgs, CreateSigningClientArgs } from "../actions/clients";
import { createSigningClients } from "../actions/clients";
import { createClients } from "../actions/clients";
import type { GrazSessionStore } from "../store";
import { useGrazSessionStore } from "../store";

/**
 * graz query hook to retrieve a CosmWasmClient, StargateClient and Tendermint34Client. If there's no given arguments it will be using the current connected client
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
export const useClients = (args?: CreateClientArgs): UseQueryResult<GrazSessionStore["clients"]> => {
  const currentClient = useGrazSessionStore((x) => x.clients);

  const queryKey = ["USE_CLIENTS", args, currentClient] as const;
  const query = useQuery(
    queryKey,
    ({ queryKey: [, _args, _current] }) => {
      return _args?.rpc ? createClients(_args) : _current;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onSuccess: (clients) => {
        useGrazSessionStore.setState({ clients });
      },
      initialData: currentClient,
    },
  );

  return query;
};

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
export const useSigningClients = (
  args?: CreateSigningClientArgs,
): UseQueryResult<GrazSessionStore["signingClients"]> => {
  const currentSigningClient = useGrazSessionStore((x) => x.signingClients);

  const queryKey = ["USE_SIGNING_CLIENTS", args, currentSigningClient] as const;
  const query = useQuery(
    queryKey,
    ({ queryKey: [, _args, _current] }) => {
      return _args?.rpc ? createSigningClients(_args) : _current;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onSuccess: (signingClients) => {
        useGrazSessionStore.setState({ signingClients });
      },
      initialData: currentSigningClient,
    },
  );

  return query;
};
