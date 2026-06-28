import {
  encodeEd25519Pubkey,
  encodeSecp256k1Pubkey,
  type OfflineAminoSigner,
  pubkeyType,
  rawEd25519PubkeyToRawAddress,
  rawSecp256k1PubkeyToRawAddress,
  type StdSignature,
} from "@cosmjs/amino";
import type { OfflineDirectSigner, OfflineSigner } from "@cosmjs/proto-signing";
import type { DeliverTxResponse } from "@cosmjs/stargate";
import type { Chain } from "@initia/initia-registry-types";
import type { ChainInfo } from "@keplr-wallet/types";

import { useGrazInternalStore } from "../../store";
import type { SignAminoParams, SignDirectParams, Wallet } from "../../types/wallet";

export interface InitiaWallet {
  getVersion: () => Promise<string>;
  getAddress: (chainId?: string) => Promise<string>;
  getOfflineSigner: (chainId: string) => OfflineDirectSigner;
  getOfflineSignerOnlyAmino: (chainId: string) => OfflineAminoSigner;
  requestAddInitiaLayer: (chain: Partial<Chain>) => Promise<void>;
  signAndBroadcastSync: (chainId: string, txBody: Uint8Array, gas: number) => Promise<string>;
  signAndBroadcastBlock: (chainId: string, txBody: Uint8Array, gas: number) => Promise<DeliverTxResponse>;
  signArbitrary: (data: string | Uint8Array) => Promise<string>;
  verifyArbitrary: (data: string | Uint8Array, signature: string) => Promise<boolean>;
}

const getDirectSignDoc = (signDoc: SignDirectParams[2]) => {
  const { bodyBytes, authInfoBytes, chainId, accountNumber } = signDoc;

  if (!bodyBytes || !authInfoBytes || !chainId || !accountNumber) {
    throw new Error("Invalid sign doc");
  }

  return {
    bodyBytes,
    authInfoBytes,
    chainId,
    accountNumber,
  };
};

const getAddressPreview = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
};

export const getInitia = (): Wallet => {
  if (typeof window.initia !== "undefined") {
    const initia = window.initia;

    const enable = async () => {
      // connects to Initia chain when no chain ID is passed
      await initia.getAddress();
    };

    const getKey = async (chainId: string) => {
      const offlineSigner = initia.getOfflineSigner(chainId);
      const [account] = await offlineSigner.getAccounts();
      if (!account) {
        throw new Error("Wallet connection failed");
      }

      const rawAddress = (() => {
        switch (account.algo) {
          case "secp256k1":
            return rawSecp256k1PubkeyToRawAddress(account.pubkey);
          case "ed25519":
            return rawEd25519PubkeyToRawAddress(account.pubkey);
          default:
            throw new Error("sr25519 public key algorithm is not supported");
        }
      })();

      return {
        name: getAddressPreview(account.address),
        algo: account.algo,
        pubKey: account.pubkey,
        bech32Address: account.address,
        address: rawAddress,
        isNanoLedger: false,
        isKeystone: false,
      };
    };

    const getOfflineSigner = (chainId: string) => {
      const directSigner = initia.getOfflineSigner(chainId);
      const aminoSigner = initia.getOfflineSignerOnlyAmino(chainId);

      return {
        getAccounts: directSigner.getAccounts.bind(directSigner),
        signDirect: directSigner.signDirect.bind(directSigner),
        signAmino: aminoSigner.signAmino.bind(aminoSigner),
      };
    };

    const getOfflineSignerAuto = (chainId: string) => {
      return Promise.resolve(initia.getOfflineSigner(chainId));
    };

    const getOfflineSignerOnlyAmino = (chainId: string) => {
      return initia.getOfflineSignerOnlyAmino(chainId);
    };

    const experimentalSuggestChain = (chain: ChainInfo) => {
      return initia.requestAddInitiaLayer({
        chain_id: chain.chainId,
        chain_name: chain.chainName,
        bech32_prefix: "init",
        bech32_config: chain.bech32Config,
        slip44: chain.bip44.coinType,
        logo_URIs: {
          png: chain.chainSymbolImageUrl,
        },
        fees: {
          fee_tokens: chain.feeCurrencies.map((feeCurrency) => ({
            denom: feeCurrency.coinDenom,
            amount: feeCurrency.coinMinimalDenom,
            low_gas_price: feeCurrency.gasPriceStep?.low,
            average_gas_price: feeCurrency.gasPriceStep?.average,
            high_gas_price: feeCurrency.gasPriceStep?.high,
          })),
        },
        apis: {
          rpc: [
            {
              address: chain.rpc,
            },
          ],
          rest: [
            {
              address: chain.rest,
            },
          ],
        },
      });
    };

    const signDirect = (...args: SignDirectParams) => {
      const [chainId, signer, signDoc] = args;
      const directSigner = initia.getOfflineSigner(chainId);
      return directSigner.signDirect(signer, getDirectSignDoc(signDoc));
    };

    const signAmino = (...args: SignAminoParams) => {
      const [chainId, signer, signDoc] = args;
      const aminoSigner = initia.getOfflineSignerOnlyAmino(chainId);
      return aminoSigner.signAmino(signer, signDoc);
    };

    const signArbitrary = async (chainId: string, signer: string, data: string | Uint8Array): Promise<StdSignature> => {
      const offlineSigner = initia.getOfflineSigner(chainId) as OfflineSigner;
      const accounts = await offlineSigner.getAccounts();
      const account = accounts.find((acc) => acc.address === signer);
      if (!account) {
        throw new Error(`Wallet not connected to account ${signer}`);
      }
      const pubkey = (() => {
        switch (account.algo) {
          case "secp256k1":
            return encodeSecp256k1Pubkey(account.pubkey);
          case "ed25519":
            return encodeEd25519Pubkey(account.pubkey);
          default:
            throw new Error("sr25519 public key algorithm is not supported");
        }
      })();

      const signature = await initia.signArbitrary(data);

      return {
        signature,
        pub_key: {
          type: account.algo === "secp256k1" ? pubkeyType.secp256k1 : pubkeyType.ed25519,
          value: pubkey.value,
        },
      };
    };

    const subscription: (reconnect: () => void) => () => void = (reconnect) => {
      const listener = () => reconnect();
      window.addEventListener("initia_keystorechange", listener);
      return () => {
        window.removeEventListener("initia_keystorechange", listener);
      };
    };

    return {
      enable,
      getKey,
      getOfflineSigner,
      getOfflineSignerAuto,
      getOfflineSignerOnlyAmino,
      experimentalSuggestChain,
      signDirect,
      signAmino,
      signArbitrary,
      subscription,
    };
  }
  useGrazInternalStore.getState()._notFoundFn();
  throw new Error("window.initia is not defined");
};
