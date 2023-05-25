import type { AminoSignResponse, StdSignature } from "@cosmjs/amino";
import { fromBech32 } from "@cosmjs/encoding";
import type { AccountData, Algo, DirectSignResponse } from "@cosmjs/proto-signing";
import type { Keplr, Key } from "@keplr-wallet/types";
import { SignClient } from "@walletconnect/sign-client";
import { getSdkError } from "@walletconnect/utils";
// eslint-disable-next-line import/no-named-as-default
import Long from "long";

import { useGrazStore } from "../store";
import type { Wallet } from "../types/wallet";
import { WALLET_TYPES, WalletType } from "../types/wallet";

/**
 * Function to check whether given {@link WalletType} or default configured wallet exists.
 *
 * @example
 * ```ts
 * const isSupported = checkWallet();
 * const isKeplrSupported = checkWallet("keplr");
 * ```
 */
export const checkWallet = (type: WalletType = useGrazStore.getState().walletType): boolean => {
  try {
    getWallet(type);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Function to return {@link Wallet} object and throws and error if it does not exist on `window`.
 *
 * @example
 * ```ts
 * try {
 *   const keplr = getKeplr();
 * } catch (error: Error) {
 *   console.error(error.message);
 * }
 * ```
 *
 * @see https://docs.keplr.app
 */
export const getKeplr = (): Wallet => {
  if (typeof window.keplr !== "undefined") return window.keplr;
  useGrazStore.getState()._notFoundFn();
  throw new Error("window.keplr is not defined");
};

/**
 * Function to return Leap object (which is {@link Wallet}) and throws and error if it does not exist on `window`.
 *
 * @example
 * ```ts
 * try {
 *   const leap = getLeap();
 * } catch (error: Error) {
 *   console.error(error.message);
 * }
 * ```
 *
 * @see https://docs.leapwallet.io/cosmos/for-dapps-connect-to-leap/add-leap-to-existing-keplr-integration
 */
export const getLeap = (): Wallet => {
  if (typeof window.leap !== "undefined") return window.leap;
  useGrazStore.getState()._notFoundFn();
  throw new Error("window.leap is not defined");
};

/**
 * Function to return cosmostation object (which is {@link Wallet}) and throws and error if it does not exist on `window`.
 *
 * @example
 * ```ts
 * try {
 *   const cosmostation = getCosmostation();
 * } catch (error: Error) {
 *   console.error(error.message);
 * }
 * ```
 *
 * @see https://docs.cosmostation.io/integration-extension/cosmos/integrate-keplr
 */
export const getCosmostation = (): Wallet => {
  if (typeof window.cosmostation.providers.keplr !== "undefined") return window.cosmostation.providers.keplr;
  useGrazStore.getState()._notFoundFn();
  throw new Error("window.cosmostation.providers.keplr is not defined");
};

type SignDirectParams = Parameters<Wallet["signDirect"]>;
type SignAminoParams = Parameters<Wallet["signAmino"]>;

interface WalletConnectSignDirectSigned {
  chainId: string;
  accountNumber: string;
  authInfoBytes: string;
  bodyBytes: string;
}

interface WalletConnectSignDirectResponse {
  signature: StdSignature;
  signed: WalletConnectSignDirectSigned;
}

export const getWalletConnect = (): Wallet => {
  if (!useGrazStore.getState().walletConnect?.options) {
    throw new Error("walletConnect.options is not defined");
  }

  const getSession = (chainId: string) => {
    const { walletConnect } = useGrazStore.getState();
    if (!walletConnect?.signClient) throw new Error("walletConnect.signClient is not defined");
    const lastSession = walletConnect.signClient.session.getAll().at(-1);

    if (!lastSession) return;
    const isSameUser = walletConnect.signClient.session
      .getAll()
      .at(-1)
      ?.namespaces.cosmos?.accounts.find((i) => i.startsWith(`cosmos:${chainId}`));
    const isNotExpired = lastSession.expiry * 1000 > Date.now() + 1000;
    if (!isSameUser || !isNotExpired) {
      return;
    }
    return lastSession;
  };

  const init = async () => {
    const { walletConnect } = useGrazStore.getState();
    if (!walletConnect?.options) throw new Error("walletConnect.options is not defined");
    const signClient = await SignClient.init(walletConnect.options);
    useGrazStore.setState({ walletConnect: { ...walletConnect, signClient } });
    return signClient;
  };

  const disconnect = async (chainId: string) => {
    const { walletConnect, account } = useGrazStore.getState();
    if (!walletConnect?.signClient) throw new Error("walletConnect.signClient is not defined");
    if (!account) throw new Error("account is not defined");

    const topic = getSession(chainId)?.topic;
    if (!topic) throw new Error("No wallet connect session");
    await walletConnect.signClient.disconnect({
      topic,
      reason: getSdkError("USER_DISCONNECTED"),
    });
  };

  const getPairings = () => {
    const { walletConnect } = useGrazStore.getState();
    if (!walletConnect?.signClient) throw new Error("walletConnect.signClient is not defined");
    walletConnect.signClient.session.getAll({});
  };

  const deletInactivePairings = async () => {
    const { walletConnect } = useGrazStore.getState();
    const signClient = walletConnect?.signClient;
    if (!signClient) throw new Error("walletConnect.signClient is not defined");
    await Promise.all(
      signClient.core.pairing.pairings.getAll({ active: false }).map(async (pairing) => {
        await signClient.core.pairing.pairings.delete(pairing.topic, {
          code: 7001,
          message: "clear pairing",
        });
      }),
    );
  };

  // const subscribeEvents = () => {};

  const enable = async (chainId: string) => {
    const signClient = await init();
    const { walletConnect } = useGrazStore.getState();
    if (!walletConnect?.options?.projectId) throw new Error("walletConnect.options.projectId is not defined");

    const { Web3Modal } = await import("@web3modal/standalone");

    const web3Modal = new Web3Modal({
      projectId: walletConnect.options.projectId,
      walletConnectVersion: 2,
      enableExplorer: true,
      // https://walletconnect.com/explorer?type=wallet&version=2&chains=cosmos%3Acosmoshub-4
      explorerRecommendedWalletIds: [
        // keplr doesn't have complete app object better hide it for now and use getKeplr
        // "6adb6082c909901b9e7189af3a4a0223102cd6f8d5c39e39f3d49acb92b578bb",
        "3ed8cc046c6211a798dc5ec70f1302b43e07db9639fd287de44a9aa115a21ed6",
        "feb6ff1fb426db18110f5a80c7adbde846d0a7e96b2bc53af4b73aaf32552bea",
        "afbd95522f4041c71dd4f1a065f971fd32372865b416f95a0b1db759ae33f2a7",
        "85db431492aa2e8672e93f4ea7acf10c88b97b867b0d373107af63dc4880f041",
        "7674bb4e353bf52886768a3ddc2a4562ce2f4191c80831291218ebd90f5f5e26",
        "0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150",
        "022e8ff84519e427bff394b3a58308bc9838196a8efb45158da0ab7c3228abfb",
        "f896cbca30cd6dc414712d3d6fcc2f8f7d35d5bd30e3b1fc5d60cf6c8926f98f",
      ],

      ...walletConnect.web3Modal,
    });

    const lastSession = getSession(chainId);
    if (!lastSession) {
      const { uri, approval } = await signClient.connect({
        requiredNamespaces: {
          cosmos: {
            methods: ["cosmos_getAccounts", "cosmos_signAmino", "cosmos_signDirect"],
            chains: [`cosmos:${chainId}`],
            events: ["chainChanged", "accountsChanged"],
          },
        },
      });
      if (!uri) throw new Error("No wallet connect uri");
      await web3Modal.openModal({ uri });
      await approval();
      web3Modal.closeModal();
    }
  };

  const getAccount = async (chainId: string): Promise<AccountData> => {
    const { walletConnect } = useGrazStore.getState();
    if (!walletConnect?.signClient) throw new Error("walletConnect.signClient is not defined");
    const topic = getSession(chainId)?.topic;
    if (!topic) throw new Error("No wallet connect session");
    const result: { address: string; algo: string; pubkey: string }[] = await walletConnect.signClient.request({
      topic,
      chainId: `cosmos:${chainId}`,
      request: {
        method: "cosmos_getAccounts",
        params: {},
      },
    });
    if (!result[0]) throw new Error("No wallet connect account");
    return {
      address: result[0].address,
      algo: result[0].algo as Algo,
      pubkey: new Uint8Array(Buffer.from(result[0].pubkey, "base64")),
    };
  };

  const getKey = async (chainId: string): Promise<Key> => {
    const { address, algo, pubkey } = await getAccount(chainId);
    return {
      address: fromBech32(address).data,
      algo,
      bech32Address: address,
      name: "",
      pubKey: pubkey,
      isKeystone: false,
      isNanoLedger: false,
    };
  };

  const wcSignDirect = async (...args: SignDirectParams) => {
    const [chainId, signer, signDoc] = args;
    const { walletConnect, account } = useGrazStore.getState();
    if (!walletConnect?.signClient) throw new Error("walletConnect.signClient is not defined");
    if (!account) throw new Error("account is not defined");

    const topic = getSession(chainId)?.topic;
    if (!topic) throw new Error("No wallet connect session");

    if (!signDoc.bodyBytes) throw new Error("No bodyBytes");
    if (!signDoc.authInfoBytes) throw new Error("No authInfoBytes");
    const req = {
      topic,
      chainId: `cosmos:${chainId}`,
      request: {
        method: "cosmos_signDirect",
        params: {
          signerAddress: signer,
          signDoc: {
            ...signDoc,
            bodyBytes: Buffer.from(signDoc.bodyBytes).toString("base64"),
            authInfoBytes: Buffer.from(signDoc.authInfoBytes).toString("base64"),
            accountNumber: signDoc.accountNumber?.toString(),
          },
        },
      },
    };
    const result: WalletConnectSignDirectResponse = await walletConnect.signClient.request(req);
    return result;
  };

  const signDirect = async (...args: SignDirectParams): Promise<DirectSignResponse> => {
    const [chainId, signer, signDoc] = args;
    const { signature, signed } = await wcSignDirect(chainId, signer, signDoc);
    return {
      signed: {
        chainId: signed.chainId,
        accountNumber: Long.fromString(signed.accountNumber, false),
        authInfoBytes: new Uint8Array(Buffer.from(signed.authInfoBytes, "base64")),
        bodyBytes: new Uint8Array(Buffer.from(signed.bodyBytes, "base64")),
      },
      signature,
    };
  };

  const wcSignAmino = async (...args: SignAminoParams) => {
    const [chainId, signer, signDoc, _signOptions] = args;
    const { walletConnect, account } = useGrazStore.getState();
    if (!walletConnect?.signClient) throw new Error("walletConnect.signClient is not defined");
    if (!account) throw new Error("account is not defined");

    const topic = getSession(chainId)?.topic;
    if (!topic) throw new Error("No wallet connect session");

    const result: AminoSignResponse = await walletConnect.signClient.request({
      topic,
      chainId: `cosmos:${chainId}`,
      request: {
        method: "cosmos_signDirect",
        params: {
          signerAddress: signer,
          signDoc,
        },
      },
    });
    return result;
  };

  const signAmino = async (...args: SignAminoParams) => {
    const [chainId, signer, signDoc, _signOptions] = args;
    const result = await wcSignAmino(chainId, signer, signDoc);
    return result;
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
    await Promise.reject(new Error("WalletConnect does not support experimentalSuggestChain"));
  };

  return {
    enable,
    getKey,
    getOfflineSigner,
    getOfflineSignerAuto,
    getOfflineSignerOnlyAmino,
    signAmino,
    signDirect,
    experimentalSuggestChain,
  };
};

/**
 * Function to return wallet object based on given {@link WalletType} or from store and throws an error if it does not
 * exist on `window` or unknown wallet type.
 *
 * @example
 * ```ts
 * const wallet = getWallet();
 * const keplr = getWallet("keplr");
 * ```
 *
 * @see {@link getKeplr}
 */
export const getWallet = (type: WalletType = useGrazStore.getState().walletType): Wallet => {
  switch (type) {
    case WalletType.KEPLR: {
      return getKeplr();
    }
    case WalletType.LEAP: {
      return getLeap();
    }
    case WalletType.COSMOSTATION: {
      return getCosmostation();
    }
    case WalletType.WALLETCONNECT: {
      return getWalletConnect();
    }
    default: {
      throw new Error("Unknown wallet type");
    }
  }
};

export const getAvailableWallets = (): Record<WalletType, boolean> => {
  return Object.fromEntries(WALLET_TYPES.map((type) => [type, checkWallet(type)])) as Record<WalletType, boolean>;
};
