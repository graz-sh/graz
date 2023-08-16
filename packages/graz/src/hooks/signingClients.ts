import type { SigningCosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import type { SigningStargateClientOptions } from "@cosmjs/stargate";
import { SigningStargateClient } from "@cosmjs/stargate";
import type { HttpEndpoint } from "@cosmjs/tendermint-rpc";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { checkWallet, getWallet } from "../actions/wallet";
import { useGrazInternalStore, useGrazSessionStore } from "../store";
import { useTendermintClient } from "./clients";

export const useStargateSigningClient = (args: { opts?: SigningStargateClientOptions }) => {
  const chain = useGrazSessionStore((x) => x.activeChain);
  const wallet = useGrazInternalStore((x) => x.walletType);
  const queryKey = useMemo(() => ["USE_STARGATE_SIGNING_CLIENT", chain, wallet] as const, [chain, wallet]);

  return useQuery({
    queryKey,
    queryFn: ({ queryKey: [, _chain, _wallet] }) => {
      if (!_chain) throw new Error("No chain found");
      const isWalletAvailable = checkWallet(_wallet);
      if (!isWalletAvailable) {
        throw new Error(`${_wallet} is not available`);
      }
      const offlineSigner = getWallet(_wallet).getOfflineSigner(_chain.chainId);
      const endpoint: HttpEndpoint = { url: _chain.rpc, headers: { ...(_chain.rpcHeaders || {}) } };
      const client = SigningStargateClient.connectWithSigner(endpoint, offlineSigner, args.opts);
      return client;
    },
    enabled: Boolean(chain) && Boolean(wallet),
    refetchOnWindowFocus: false,
  });
};

export const useCosmwasmSigningClient = (args: { opts?: SigningCosmWasmClientOptions }) => {
  const chain = useGrazSessionStore((x) => x.activeChain);
  const wallet = useGrazInternalStore((x) => x.walletType);
  const queryKey = useMemo(() => ["USE_COSMWASM_SIGNING_CLIENT", chain, wallet] as const, [chain, wallet]);

  return useQuery({
    queryKey,
    queryFn: ({ queryKey: [, _chain, _wallet] }) => {
      if (!_chain) throw new Error("No chain found");
      const isWalletAvailable = checkWallet(_wallet);
      if (!isWalletAvailable) {
        throw new Error(`${_wallet} is not available`);
      }
      const offlineSigner = getWallet(_wallet).getOfflineSigner(_chain.chainId);
      const endpoint: HttpEndpoint = { url: _chain.rpc, headers: { ...(_chain.rpcHeaders || {}) } };
      const client = SigningCosmWasmClient.connectWithSigner(endpoint, offlineSigner, args.opts);
      return client;
    },
    enabled: Boolean(chain) && Boolean(wallet),
    refetchOnWindowFocus: false,
  });
};

export const useStargateTmSigningClient = (args: { type: "tm34" | "tm37"; opts?: SigningStargateClientOptions }) => {
  const chain = useGrazSessionStore((x) => x.activeChain);
  const wallet = useGrazInternalStore((x) => x.walletType);
  const queryKey = useMemo(
    () => ["USE_STARGATE_TM_SIGNING_CLIENT", chain, wallet, args] as const,
    [args, chain, wallet],
  );

  const { data: tmClient } = useTendermintClient(args.type);

  return useQuery({
    queryKey,
    queryFn: ({ queryKey: [, _chain, _wallet, _args] }) => {
      if (!_chain) throw new Error("No chain found");
      const isWalletAvailable = checkWallet(_wallet);
      if (!isWalletAvailable) {
        throw new Error(`${_wallet} is not available`);
      }
      if (!tmClient) throw new Error("No tendermint client found");
      const offlineSigner = getWallet(_wallet).getOfflineSigner(_chain.chainId);
      const client = SigningStargateClient.createWithSigner(tmClient, offlineSigner, _args.opts);
      return client;
    },
    enabled: Boolean(chain) && Boolean(wallet) && Boolean(tmClient),
    refetchOnWindowFocus: false,
  });
};

export const useCosmwasmTmSigningClient = (args: { type: "tm34" | "tm37"; opts?: SigningCosmWasmClientOptions }) => {
  const chain = useGrazSessionStore((x) => x.activeChain);
  const wallet = useGrazInternalStore((x) => x.walletType);
  const queryKey = useMemo(
    () => ["USE_COSMWASM_TM_SIGNING_CLIENT", chain, wallet, args] as const,
    [args, chain, wallet],
  );

  const { data: tmClient } = useTendermintClient(args.type);

  return useQuery({
    queryKey,
    queryFn: ({ queryKey: [, _chain, _wallet, _args] }) => {
      if (!_chain) throw new Error("No chain found");
      const isWalletAvailable = checkWallet(_wallet);
      if (!isWalletAvailable) {
        throw new Error(`${_wallet} is not available`);
      }
      if (!tmClient) throw new Error("No tendermint client found");
      const offlineSigner = getWallet(_wallet).getOfflineSigner(_chain.chainId);
      const client = SigningCosmWasmClient.createWithSigner(tmClient, offlineSigner, _args.opts);
      return client;
    },
    enabled: Boolean(chain) && Boolean(wallet) && Boolean(tmClient),
    refetchOnWindowFocus: false,
  });
};
