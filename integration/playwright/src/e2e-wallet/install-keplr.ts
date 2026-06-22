import { Secp256k1HdWallet } from "@cosmjs/amino";
import type { OfflineAminoSigner, StdSignDoc } from "@cosmjs/amino";
import { fromBech32 } from "@cosmjs/encoding";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import type { DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { ChainInfo, Keplr, KeplrSignOptions, Key } from "@keplr-wallet/types";

import type { GrazE2EChainConfig, GrazE2EConfig, GrazE2EWalletState } from "./types";

type ChainWallets = {
  amino: Secp256k1HdWallet;
  direct: DirectSecp256k1HdWallet;
};

type DirectSignDoc = Parameters<OfflineDirectSigner["signDirect"]>[1];

const createState = (): GrazE2EWalletState => ({
  enabledChainIds: [],
  suggestedChainIds: [],
  calls: [],
});

const recordCall = (state: GrazE2EWalletState, call: string) => {
  state.calls = [...state.calls, call];
};

const mergeSigner = (
  amino: OfflineAminoSigner,
  direct: OfflineDirectSigner,
): OfflineAminoSigner & OfflineDirectSigner => {
  return {
    getAccounts: direct.getAccounts.bind(direct),
    signAmino: amino.signAmino.bind(amino),
    signDirect: direct.signDirect.bind(direct),
  };
};

export const installTestKeplrWallet = (config: GrazE2EConfig): void => {
  const mnemonic = config.mnemonic;
  if (!mnemonic) {
    throw new Error("GRAZ_E2E_WALLET_MNEMONIC is required to install the test Keplr wallet");
  }

  const chains = new Map<string, GrazE2EChainConfig>([[config.chain.chainId, config.chain]]);
  const walletCache = new Map<string, Promise<ChainWallets>>();
  const state = createState();

  const getChainConfig = (chainId: string): GrazE2EChainConfig => {
    const chain = chains.get(chainId);
    if (!chain) {
      throw new Error(`No E2E chain config for ${chainId}`);
    }
    return chain;
  };

  const getWallets = (chainId: string): Promise<ChainWallets> => {
    const cached = walletCache.get(chainId);
    if (cached) return cached;

    const { bech32Prefix } = getChainConfig(chainId);
    const wallets = Promise.all([
      Secp256k1HdWallet.fromMnemonic(mnemonic, { prefix: bech32Prefix }),
      DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: bech32Prefix }),
    ]).then(([amino, direct]) => ({ amino, direct }));
    walletCache.set(chainId, wallets);
    return wallets;
  };

  const getKey = async (chainId: string): Promise<Key> => {
    recordCall(state, `getKey:${chainId}`);
    const { direct } = await getWallets(chainId);
    const [account] = await direct.getAccounts();
    if (!account) {
      throw new Error(`No account for ${chainId}`);
    }

    return {
      name: "Graz E2E Wallet",
      algo: account.algo,
      pubKey: account.pubkey,
      address: fromBech32(account.address).data,
      bech32Address: account.address,
      ethereumHexAddress: "",
      isNanoLedger: false,
      isKeystone: false,
    };
  };

  const keplr = {
    enable: async (chainIds: string | string[]) => {
      const ids = Array.isArray(chainIds) ? chainIds : [chainIds];
      recordCall(state, `enable:${ids.join(",")}`);
      state.enabledChainIds = Array.from(new Set([...state.enabledChainIds, ...ids]));
      await Promise.all(ids.map((chainId) => getWallets(chainId)));
    },
    getKey,
    getKeys: async (chainIds: string[]) => {
      recordCall(state, `getKeys:${chainIds.join(",")}`);
      return Promise.all(chainIds.map((chainId) => getKey(chainId)));
    },
    getOfflineSigner: (chainId: string, _signOptions?: KeplrSignOptions) => {
      recordCall(state, `getOfflineSigner:${chainId}`);
      const lazySigner = {
        getAccounts: async () => (await getWallets(chainId)).direct.getAccounts(),
        signAmino: async (signerAddress: string, signDoc: StdSignDoc) =>
          (await getWallets(chainId)).amino.signAmino(signerAddress, signDoc),
        signDirect: async (signerAddress: string, signDoc: DirectSignDoc) =>
          (await getWallets(chainId)).direct.signDirect(signerAddress, signDoc),
      };
      return lazySigner;
    },
    getOfflineSignerOnlyAmino: (chainId: string, _signOptions?: KeplrSignOptions) => {
      recordCall(state, `getOfflineSignerOnlyAmino:${chainId}`);
      return {
        getAccounts: async () => (await getWallets(chainId)).amino.getAccounts(),
        signAmino: async (signerAddress: string, signDoc: StdSignDoc) =>
          (await getWallets(chainId)).amino.signAmino(signerAddress, signDoc),
      };
    },
    getOfflineSignerAuto: async (chainId: string, _signOptions?: KeplrSignOptions) => {
      recordCall(state, `getOfflineSignerAuto:${chainId}`);
      const { amino, direct } = await getWallets(chainId);
      return mergeSigner(amino, direct);
    },
    signAmino: async (chainId: string, signerAddress: string, signDoc: StdSignDoc) => {
      recordCall(state, `signAmino:${chainId}`);
      return (await getWallets(chainId)).amino.signAmino(signerAddress, signDoc);
    },
    signDirect: async (
      chainId: string,
      signerAddress: string,
      signDoc: DirectSignDoc,
      _signOptions?: KeplrSignOptions,
    ): Promise<DirectSignResponse> => {
      recordCall(state, `signDirect:${chainId}`);
      return (await getWallets(chainId)).direct.signDirect(signerAddress, signDoc);
    },
    experimentalSuggestChain: async (chainInfo: ChainInfo) => {
      recordCall(state, `experimentalSuggestChain:${chainInfo.chainId}`);
      chains.set(chainInfo.chainId, {
        chainId: chainInfo.chainId,
        chainName: chainInfo.chainName,
        rpc: chainInfo.rpc,
        rest: chainInfo.rest,
        bech32Prefix: chainInfo.bech32Config?.bech32PrefixAccAddr ?? config.chain.bech32Prefix,
        denom: chainInfo.feeCurrencies[0]?.coinMinimalDenom ?? config.chain.denom,
        displayDenom: chainInfo.feeCurrencies[0]?.coinDenom ?? config.chain.displayDenom,
        gasPrice: String(chainInfo.feeCurrencies[0]?.gasPriceStep?.average ?? config.chain.gasPrice),
      });
      state.suggestedChainIds = Array.from(new Set([...state.suggestedChainIds, chainInfo.chainId]));
    },
    defaultOptions: {},
  };

  window.__GRAZ_E2E_WALLET_STATE__ = state;
  window.keplr = keplr as unknown as Keplr;
};

export const installTestKeplrWalletFromWindow = (): void => {
  const config = window.__GRAZ_E2E_CONFIG__;
  if (config) {
    installTestKeplrWallet(config);
  }
};
