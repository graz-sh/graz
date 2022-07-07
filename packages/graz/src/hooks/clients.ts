import { useQuery } from "react-query";

import type { CreateClientArgs, CreateSigningClientArgs } from "../actions/clients";
import { createClient, createSigningClient } from "../actions/clients";
import { useGrazStore } from "../store";

type WithRefetchOpts<T> = T & { keepRefetchBehavior?: boolean };

export function useClient(args?: WithRefetchOpts<CreateClientArgs>) {
  const currentClient = useGrazStore((x) => x.client);

  const queryKey = ["USE_CLIENT", args, currentClient] as const;
  const query = useQuery(
    queryKey,
    ({ queryKey: [, _args, _current] }) => {
      return _args?.rpc ? createClient(_args) : _current;
    },
    {
      refetchOnMount: Boolean(args?.keepRefetchBehavior),
      refetchOnWindowFocus: Boolean(args?.keepRefetchBehavior),
    },
  );

  return {
    data: query.data,
    error: query.error,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    status: query.status,
  };
}

export function useSigningClient(args?: WithRefetchOpts<CreateSigningClientArgs>) {
  const currentClient = useGrazStore((x) => x.signingClient);

  const queryKey = ["USE_SIGNING_CLIENT", args, currentClient] as const;
  const query = useQuery(
    queryKey,
    ({ queryKey: [, _args, _current] }) => {
      return _args?.rpc ? createSigningClient(_args) : _current;
    },
    {
      refetchOnMount: Boolean(args?.keepRefetchBehavior),
      refetchOnWindowFocus: Boolean(args?.keepRefetchBehavior),
    },
  );

  return {
    data: query.data,
    error: query.error,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    status: query.status,
  };
}
