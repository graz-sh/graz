import type {
  AccountData,
  Algo,
  AminoSignResponse,
  DirectSignResponse,
  Keplr,
  Key,
  StdSignDoc,
} from "@keplr-wallet/types";
// eslint-disable-next-line import/no-named-as-default
import Long from "long";

import { useGrazInternalStore } from "../../../store";
import type { SignAminoParams, SignDirectParams, Wallet } from "../../../types/wallet";
import type { GetSnapsResponse, Snap } from "./types";

export interface GetMetamaskSnap {
  id: string;
  params?: Record<string, unknown>;
}

/**
 * Function to return {@link Wallet} object and throws and error if it does not exist on `window`.
 *
 * @example
 * ```ts
 * try {
 *   const metamaskSnap = getMetamaskSnap({
 *     id: "",
 *     params: {}
 *   });
 * } catch (error: Error) {
 *   console.error(error.message);
 * }
 * ```
 *
 *
 */
export const getMetamaskSnap = (params?: GetMetamaskSnap): Wallet => {
  const ethereum = window.ethereum;

  if (ethereum && params) {
    const getSnaps = async (): Promise<GetSnapsResponse> => {
      const res = (await ethereum.request({
        method: "wallet_getSnaps",
      })) as unknown as GetSnapsResponse;
      return res;
    };

    const getSnap = async (version?: string): Promise<Snap | undefined> => {
      try {
        const snaps = await getSnaps();
        return Object.values(snaps).find((snap) => snap.id === params.id && (!version || snap.version === version));
      } catch (e) {
        return undefined;
      }
    };

    const connectSnap = async () => {
      await ethereum.request({
        method: "wallet_requestSnaps",
        params: {
          [params.id]: params.params || {},
        },
      });
    };

    const init = async () => {
      const clientVersion = await ethereum.request({
        method: "web3_clientVersion",
      });
      const isFlaskDetected = (clientVersion as string[])?.includes("flask");
      if (!isFlaskDetected) throw new Error("Metamask Flask is not detected");
      return true;
    };

    const enable = async (chainId: string | string[]) => {
      const installedSnap = await getSnap();
      if (!installedSnap) await connectSnap();
    };

    const requestSignDirect = async (
      chainId: string,
      signerAddress: string,
      signDoc: {
        bodyBytes?: Uint8Array | null;
        authInfoBytes?: Uint8Array | null;
        chainId?: string | null;
        accountNumber?: Long | null;
      },
    ) => {
      const signature = (await ethereum.request({
        method: "wallet_invokeSnap",
        params: {
          snapId: params.id,
          request: {
            method: "signDirect",
            params: {
              chainId,
              signerAddress,
              signDoc,
            },
          },
        },
      })) as DirectSignResponse;

      const accountNumber = signDoc.accountNumber;
      const modifiedAccountNumber = new Long(accountNumber!.low, accountNumber!.high, accountNumber!.unsigned);

      return {
        signature: signature.signature,
        signed: {
          ...signature.signed,
          accountNumber: `${modifiedAccountNumber.toString()}`,
          authInfoBytes: new Uint8Array(Object.values(signature.signed.authInfoBytes)),
          bodyBytes: new Uint8Array(Object.values(signature.signed.bodyBytes)),
        },
      } as unknown as DirectSignResponse;
    };

    const requestSignAmino = async (chainId: string, signerAddress: string, signDoc: StdSignDoc) => {
      const signResponse = (await ethereum.request({
        method: "wallet_invokeSnap",
        params: {
          snapId: params.id,
          request: {
            method: "signAmino",
            params: {
              chainId,
              signerAddress,
              signDoc,
            },
          },
        },
      })) as AminoSignResponse;

      return signResponse;
    };

    // getKey from @leapwallet/cosmos-snap-provider return type is wrong
    const getKey = async (chainId: string): Promise<Key> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await ethereum.request({
        method: "wallet_invokeSnap",
        params: {
          snapId: params.id,
          request: {
            method: "getKey",
            params: {
              chainId,
            },
          },
        },
      });
      if (!res) throw new Error("No response from Metamask");

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      (res as Key).pubKey = Uint8Array.from(Object.values(res.pubkey));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      delete res.pubkey;

      return {
        ...res,
      } as Key;
    };

    const getAccount = async (chainId: string): Promise<AccountData> => {
      const key = await getKey(chainId);
      return {
        address: key.bech32Address,
        algo: key.algo as Algo,
        pubkey: key.pubKey,
      };
    };

    const signAmino = async (...args: SignAminoParams) => {
      const [chainId, signer, signDoc, _signOptions] = args;
      const result = await requestSignAmino(chainId, signer, signDoc);
      return result;
    };

    const signDirect = async (...args: SignDirectParams): Promise<DirectSignResponse> => {
      const [chainId, signer, signDoc] = args;
      const res = await requestSignDirect(chainId, signer, signDoc);
      return res;
    };

    const getOfflineSignerDirect = (chainId: string) => {
      return {
        getAccounts: async () => [await getAccount(chainId)],
        signDirect: (signerAddress: string, signDoc: SignDirectParams["2"]) =>
          signDirect(chainId, signerAddress, signDoc),
      };
    };

    const getOfflineSignerOnlyAmino = (chainId: string) => {
      return {
        getAccounts: async () => [await getAccount(chainId)],
        signAmino: (signerAddress: string, signDoc: SignAminoParams["2"]) => signAmino(chainId, signerAddress, signDoc),
      };
    };

    const getOfflineSigner = (chainId: string) => {
      return {
        getAccounts: async () => [await getAccount(chainId)],
        signDirect: (signerAddress: string, signDoc: SignDirectParams["2"]) =>
          signDirect(chainId, signerAddress, signDoc),
        signAmino: (signerAddress: string, signDoc: SignAminoParams["2"]) => signAmino(chainId, signerAddress, signDoc),
      };
    };

    const getOfflineSignerAuto = async (chainId: string) => {
      const key = await getKey(chainId);
      if (key.isNanoLedger) return getOfflineSignerOnlyAmino(chainId);
      return getOfflineSignerDirect(chainId);
    };

    const experimentalSuggestChain = async (..._args: Parameters<Keplr["experimentalSuggestChain"]>) => {
      await Promise.reject(new Error("Metamask does not support experimentalSuggestChain"));
    };

    return {
      getKey,
      getOfflineSigner,
      getOfflineSignerAuto,
      getOfflineSignerOnlyAmino,
      signDirect,
      signAmino,
      enable,
      experimentalSuggestChain,
      init,
    };
  }
  useGrazInternalStore.getState()._notFoundFn();
  throw new Error("window.ethereum is not defined");
};
