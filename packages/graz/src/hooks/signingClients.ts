import type { SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { SigningStargateClientOptions } from "@cosmjs/stargate";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import type { HttpEndpoint } from "@cosmjs/tendermint-rpc";
import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { checkWallet, getWallet } from "../actions/wallet";
import { useGrazInternalStore, useGrazSessionStore } from "../store";
import { type ChainId, createMultiChainAsyncFunction, useChainsFromArgs } from "../utils/multi-chain";
import { useTendermintClient } from "./clients";

type SiginingClientSinglechainArgs<T> = {
  multiChain: false;
  opts?: Record<string, T>;
};

type SiginingClientMultichainArgs<T> = {
  multiChain: true;
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
    () => ["USE_STARGATE_SIGNING_CLIENT", chains, wallet, args?.opts, args?.multiChain] as const,
    [args, chains, wallet],
  );

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, _chains, _wallet, _opts, _multiChain] }) => {
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
export const useCosmWasmSigningClient = (args?: {
  opts?: SigningCosmWasmClientOptions;
  offlineSigner?: "offlineSigner" | "offlineSignerAuto" | "offlineSignerOnlyAmino";
}) => {
  const chain = useGrazSessionStore((x) => x.activeChainIds);
  const wallet = useGrazInternalStore((x) => x.walletType);
  const queryKey = useMemo(() => ["USE_COSMWASM_SIGNING_CLIENT", chain, wallet, args] as const, [args, chain, wallet]);

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, _chain, _wallet, _args] }) => {
      if (!_chain) throw new Error("No chain found");
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
        ...(_args?.opts || {}),
      });
      return signingClient;
    },
    enabled: Boolean(chain) && Boolean(wallet),
    refetchOnWindowFocus: false,
  });
};

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
export const useStargateTmSigningClient = (args: {
  type: "tm34" | "tm37";
  opts?: SigningStargateClientOptions;
  offlineSigner?: "offlineSigner" | "offlineSignerAuto" | "offlineSignerOnlyAmino";
}) => {
  const chain = useGrazSessionStore((x) => x.activeChainIds);
  const wallet = useGrazInternalStore((x) => x.walletType);
  const queryKey = useMemo(
    () => ["USE_STARGATE_TM_SIGNING_CLIENT", chain, wallet, args] as const,
    [args, chain, wallet],
  );

  const { data: tmClient } = useTendermintClient(args.type);

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, _chain, _wallet, _args] }) => {
      if (!_chain) throw new Error("No chain found");
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
      const client = SigningStargateClient.createWithSigner(tmClient, offlineSigner, _args.opts);
      return client;
    },
    enabled: Boolean(chain) && Boolean(wallet) && Boolean(tmClient),
    refetchOnWindowFocus: false,
  });
};

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
export const useCosmWasmTmSigningClient = (args: {
  type: "tm34" | "tm37";
  opts?: SigningCosmWasmClientOptions;
  offlineSigner?: "offlineSigner" | "offlineSignerAuto" | "offlineSignerOnlyAmino";
}) => {
  const chain = useGrazSessionStore((x) => x.activeChainIds);
  const wallet = useGrazInternalStore((x) => x.walletType);
  const queryKey = useMemo(
    () => ["USE_COSMWASM_TM_SIGNING_CLIENT", chain, wallet, args] as const,
    [args, chain, wallet],
  );

  const { data: tmClient } = useTendermintClient(args.type);

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, _chain, _wallet, _args] }) => {
      if (!_chain) throw new Error("No chain found");
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
      const gasPrice = _chain.gas ? GasPrice.fromString(`${_chain.gas.price}${_chain.gas.denom}`) : undefined;
      const client = SigningCosmWasmClient.createWithSigner(tmClient, offlineSigner, {
        gasPrice,
        ...(_args?.opts || {}),
      });
      return client;
    },
    enabled: Boolean(chain) && Boolean(wallet) && Boolean(tmClient),
    refetchOnWindowFocus: false,
  });
};
