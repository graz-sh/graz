import type { SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { SigningStargateClientOptions } from "@cosmjs/stargate";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import type { HttpEndpoint, TendermintClient } from "@cosmjs/tendermint-rpc";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { checkWallet, getWallet } from "../actions/wallet";
import { useGrazInternalStore } from "../store";
import { type ChainId, createMultiChainAsyncFunction, useChainsFromArgs } from "../utils/multi-chain";
import { useTendermintClient } from "./clients";

type SiginingClientSinglechainArgs<T> = {
  multiChain?: false;
  opts?: Record<string, T>;
};

type SiginingClientMultichainArgs<T> = {
  multiChain?: true;
  opts?: Record<string, T>;
};

type Args<T> = SiginingClientSinglechainArgs<T> | SiginingClientMultichainArgs<T>;

type BaseSigningClientArgs = {
  chainId?: ChainId;
  offlineSigner?: "offlineSigner" | "offlineSignerAuto" | "offlineSignerOnlyAmino";
};
export function useStargateSigningClient(
  args?: BaseSigningClientArgs & SiginingClientSinglechainArgs<SigningStargateClientOptions>,
): UseQueryResult<SigningStargateClient>;
export function useStargateSigningClient(
  args?: BaseSigningClientArgs & SiginingClientMultichainArgs<SigningStargateClientOptions>,
): UseQueryResult<Record<string, SigningStargateClient>>;
/**
 * graz query hook to retrieve a SigningStargateClient.
 *
 * @example
 * ```ts
 * import { useStargateSigningClient } from "graz";
 *
 * const { data:signingClient, isFetching, refetch, ... } = useStargateSigningClient();
 *
 * signingClient.getAccount("address")
 *
 * ```
 */
// eslint-disable-next-line prefer-arrow-functions/prefer-arrow-functions
export function useStargateSigningClient(
  args?: BaseSigningClientArgs & Args<SigningStargateClientOptions>,
): UseQueryResult<SigningStargateClient | Record<string, SigningStargateClient>> {
  const chains = useChainsFromArgs({ chainId: args?.chainId, multiChain: args?.multiChain });
  const wallet = useGrazInternalStore((x) => x.walletType);
  const queryKey = useMemo(
    () => ["USE_STARGATE_SIGNING_CLIENT", chains, wallet, args] as const,
    [args, chains, wallet],
  );

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, _chains, _wallet] }) => {
      if (!_chains) throw new Error("No chains found");
      const res = await createMultiChainAsyncFunction(Boolean(args?.multiChain), _chains, async (_chain) => {
        const isWalletAvailable = checkWallet(_wallet);
        if (!isWalletAvailable) {
          throw new Error(`${_wallet} is not available`);
        }
        const offlineSigner = await (async () => {
          switch (args?.offlineSigner) {
            case "offlineSigner":
              return getWallet(_wallet).getOfflineSigner(_chain.chainId);
            case "offlineSignerAuto":
              return getWallet(_wallet).getOfflineSignerAuto(_chain.chainId);
            case "offlineSignerOnlyAmino":
              return getWallet(_wallet).getOfflineSignerOnlyAmino(_chain.chainId);
            default:
              return getWallet(_wallet).getOfflineSignerAuto(_chain.chainId);
          }
        })();
        const endpoint: HttpEndpoint = { url: _chain.rpc, headers: { ...(_chain.rpcHeaders || {}) } };
        if (args?.multiChain === true) {
          args?.opts;
        }
        const signingClient = await SigningStargateClient.connectWithSigner(
          endpoint,
          offlineSigner,
          args?.multiChain ? args?.opts?.[_chain.chainId] : args?.opts,
        );
        return signingClient;
      });
      return res;
    },
    enabled: Boolean(chains) && chains.length > 0 && Boolean(wallet),
    refetchOnWindowFocus: false,
  });
}

export function useCosmWasmSigningClient(
  args?: BaseSigningClientArgs & SiginingClientSinglechainArgs<SigningCosmWasmClientOptions>,
): UseQueryResult<SigningCosmWasmClient>;
export function useCosmWasmSigningClient(
  args?: BaseSigningClientArgs & SiginingClientMultichainArgs<SigningCosmWasmClientOptions>,
): UseQueryResult<Record<string, SigningCosmWasmClient>>;
/**
 * graz query hook to retrieve a SigningCosmWasmClient.
 *
 * @example
 * ```ts
 * import { useCosmWasmSigningClient } from "graz";
 *
 * const { data:signingClient, isFetching, refetch, ... } = useCosmWasmSigningClient();
 *
 * signingClient.getAccount("address")
 *
 * ```
 */
// eslint-disable-next-line prefer-arrow-functions/prefer-arrow-functions
export function useCosmWasmSigningClient(
  args?: BaseSigningClientArgs & Args<SigningStargateClientOptions>,
): UseQueryResult<SigningCosmWasmClient | Record<string, SigningCosmWasmClient>> {
  const chains = useChainsFromArgs({ chainId: args?.chainId, multiChain: args?.multiChain });
  const wallet = useGrazInternalStore((x) => x.walletType);
  const queryKey = useMemo(
    () => ["USE_COSMWASM_SIGNING_CLIENT", chains, wallet, args] as const,
    [args, chains, wallet],
  );

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, _chains, _wallet] }) => {
      if (!_chains) throw new Error("No chains found");
      const res = await createMultiChainAsyncFunction(Boolean(args?.multiChain), _chains, async (_chain) => {
        const isWalletAvailable = checkWallet(_wallet);
        if (!isWalletAvailable) {
          throw new Error(`${_wallet} is not available`);
        }
        const offlineSigner = await (async () => {
          switch (args?.offlineSigner) {
            case "offlineSigner":
              return getWallet(_wallet).getOfflineSigner(_chain.chainId);
            case "offlineSignerAuto":
              return getWallet(_wallet).getOfflineSignerAuto(_chain.chainId);
            case "offlineSignerOnlyAmino":
              return getWallet(_wallet).getOfflineSignerOnlyAmino(_chain.chainId);
            default:
              return getWallet(_wallet).getOfflineSignerAuto(_chain.chainId);
          }
        })();
        const endpoint: HttpEndpoint = { url: _chain.rpc, headers: { ...(_chain.rpcHeaders || {}) } };
        const gasPrice = _chain.gas ? GasPrice.fromString(`${_chain.gas.price}${_chain.gas.denom}`) : undefined;
        const signingClient = await SigningCosmWasmClient.connectWithSigner(endpoint, offlineSigner, {
          gasPrice,
          ...(args?.multiChain ? args?.opts?.[_chain.chainId] : args?.opts || {}),
        });
        return signingClient;
      });
      return res;
    },
    enabled: Boolean(chains) && chains.length > 0 && Boolean(wallet),
    refetchOnWindowFocus: false,
  });
}

export function useStargateTmSigningClient(
  args: {
    type: "tm34" | "tm37";
  } & BaseSigningClientArgs &
    SiginingClientSinglechainArgs<SigningStargateClientOptions>,
): UseQueryResult<SigningStargateClient>;
export function useStargateTmSigningClient(
  args: {
    type: "tm34" | "tm37";
  } & BaseSigningClientArgs &
    SiginingClientMultichainArgs<SigningStargateClientOptions>,
): UseQueryResult<Record<string, SigningStargateClient>>;
/**
 * graz query hook to retrieve a SigningStargateClient with tendermint client.
 *
 * @example
 * ```ts
 * import { useStargateTmSigningClient } from "graz";
 *
 * const { data:signingClient, isFetching, refetch, ... } = useStargateTmSigningClient("tm34");
 *
 * signingClient.getAccount("address")
 *
 * ```
 */
// eslint-disable-next-line prefer-arrow-functions/prefer-arrow-functions
export function useStargateTmSigningClient(
  args: {
    type: "tm34" | "tm37";
  } & BaseSigningClientArgs &
    Args<SigningStargateClientOptions>,
): UseQueryResult<SigningStargateClient | Record<string, SigningStargateClient>> {
  const chains = useChainsFromArgs({ chainId: args?.chainId, multiChain: args?.multiChain });
  const wallet = useGrazInternalStore((x) => x.walletType);
  const queryKey = useMemo(
    () => ["USE_STARGATE_TM_SIGNING_CLIENT", chains, wallet, args] as const,
    [args, chains, wallet],
  );

  const { data: tmClient } = useTendermintClient({
    type: args.type,
    chainId: args.chainId,
    multiChain: args.multiChain,
  });

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, _chains, _wallet] }) => {
      if (!_chains) throw new Error("No chains found");
      const res = await createMultiChainAsyncFunction(Boolean(args?.multiChain), _chains, async (_chain) => {
        const isWalletAvailable = checkWallet(_wallet);
        if (!isWalletAvailable) {
          throw new Error(`${_wallet} is not available`);
        }
        if (!tmClient) throw new Error("No tendermint client found");
        const offlineSigner = await (async () => {
          switch (args.offlineSigner) {
            case "offlineSigner":
              return getWallet(_wallet).getOfflineSigner(_chain.chainId);
            case "offlineSignerAuto":
              return getWallet(_wallet).getOfflineSignerAuto(_chain.chainId);
            case "offlineSignerOnlyAmino":
              return getWallet(_wallet).getOfflineSignerOnlyAmino(_chain.chainId);
            default:
              return getWallet(_wallet).getOfflineSignerAuto(_chain.chainId);
          }
        })();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const tendermintClient = (args?.multiChain ? tmClient[_chain.chainId] : tmClient) as TendermintClient;
        const client = await SigningStargateClient.createWithSigner(
          tendermintClient,
          offlineSigner,
          args?.multiChain ? args?.opts?.[_chain.chainId] : args?.opts,
        );
        return client;
      });
      return res;
    },
    enabled: Boolean(chains) && chains.length > 0 && Boolean(wallet) && Boolean(tmClient),
    refetchOnWindowFocus: false,
  });
}

export function useCosmWasmTmSigningClient(
  args: {
    type: "tm34" | "tm37";
  } & BaseSigningClientArgs &
    SiginingClientSinglechainArgs<SigningCosmWasmClientOptions>,
): UseQueryResult<SigningCosmWasmClient>;
export function useCosmWasmTmSigningClient(
  args: {
    type: "tm34" | "tm37";
  } & BaseSigningClientArgs &
    SiginingClientMultichainArgs<SigningCosmWasmClientOptions>,
): UseQueryResult<Record<string, SigningCosmWasmClient>>;
/**
 * graz query hook to retrieve a SigningCosmWasmClient with tendermint client.
 *
 * @example
 * ```ts
 * import { useCosmWasmTmSigningClient } from "graz";
 *
 * const { data:signingClient, isFetching, refetch, ... } = useCosmWasmTmSigningClient("tm34");
 *
 * signingClient.getAccount("address")
 *
 * ```
 */
// eslint-disable-next-line prefer-arrow-functions/prefer-arrow-functions
export function useCosmWasmTmSigningClient(
  args: {
    type: "tm34" | "tm37";
  } & BaseSigningClientArgs &
    Args<SigningCosmWasmClientOptions>,
): UseQueryResult<SigningCosmWasmClient | Record<string, SigningCosmWasmClient>> {
  const chains = useChainsFromArgs({ chainId: args?.chainId, multiChain: args?.multiChain });
  const wallet = useGrazInternalStore((x) => x.walletType);
  const queryKey = useMemo(
    () => ["USE_COSMWASM_TM_SIGNING_CLIENT", chains, wallet, args] as const,
    [args, chains, wallet],
  );

  const { data: tmClient } = useTendermintClient({
    type: args.type,
    chainId: args.chainId,
    multiChain: false,
    enabled: !args.multiChain,
  });

  const { data: tmClients } = useTendermintClient({
    type: args.type,
    chainId: args.chainId,
    multiChain: true,
    enabled: Boolean(args.multiChain),
  });

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, _chains, _wallet] }) => {
      if (!_chains) throw new Error("No chains found");
      const res = await createMultiChainAsyncFunction(Boolean(args?.multiChain), _chains, async (_chain) => {
        const isWalletAvailable = checkWallet(_wallet);
        if (!isWalletAvailable) {
          throw new Error(`${_wallet} is not available`);
        }
        const offlineSigner = await (async () => {
          switch (args.offlineSigner) {
            case "offlineSigner":
              return getWallet(_wallet).getOfflineSigner(_chain.chainId);
            case "offlineSignerAuto":
              return getWallet(_wallet).getOfflineSignerAuto(_chain.chainId);
            case "offlineSignerOnlyAmino":
              return getWallet(_wallet).getOfflineSignerOnlyAmino(_chain.chainId);
            default:
              return getWallet(_wallet).getOfflineSignerAuto(_chain.chainId);
          }
        })();
        const gasPrice = _chain.gas ? GasPrice.fromString(`${_chain.gas.price}${_chain.gas.denom}`) : undefined;
        const tendermintClient = args?.multiChain ? tmClients?.[_chain.chainId] : tmClient;
        if (!tendermintClient) throw new Error("No tendermint client found");
        const client = await SigningCosmWasmClient.createWithSigner(tendermintClient, offlineSigner, {
          gasPrice,
          ...(args?.multiChain ? args?.opts?.[_chain.chainId] : args?.opts || {}),
        });
        return client;
      });
      return res;
    },
    enabled: Boolean(chains) && chains.length > 0 && Boolean(wallet) && (Boolean(tmClient) || Boolean(tmClients)),
    refetchOnWindowFocus: false,
  });
}
