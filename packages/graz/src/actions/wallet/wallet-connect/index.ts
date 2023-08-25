import type { AminoSignResponse } from "@cosmjs/amino";
import { fromBech32 } from "@cosmjs/encoding";
import type { AccountData, Algo, DirectSignResponse } from "@cosmjs/proto-signing";
import type { Keplr, Key } from "@keplr-wallet/types";
import { SignClient } from "@walletconnect/sign-client";
import type { ISignClient } from "@walletconnect/types";
import { getSdkError } from "@walletconnect/utils";
// eslint-disable-next-line import/no-named-as-default
import Long from "long";

import { useGrazInternalStore, useGrazSessionStore } from "../../../store";
import type { SignAminoParams, SignDirectParams, Wallet } from "../../../types/wallet";
import { isAndroid, isIos, isMobile } from "../../../utils/os";
import { promiseWithTimeout } from "../../../utils/timeout";
import { clearSession } from "..";
import type { GetWalletConnectParams, WalletConnectSignDirectResponse } from "./types";

export const getWalletConnect = (params?: GetWalletConnectParams): Wallet => {
  if (!useGrazInternalStore.getState().walletConnect?.options?.projectId?.trim()) {
    throw new Error("walletConnect.options.projectId is not defined");
  }

  const encoding = params?.encoding || "base64";

  const redirectToApp = (wcUri?: string) => {
    if (!params) return;
    const { appUrl, formatNativeUrl } = params;
    if (!isMobile()) return;
    if (isAndroid()) {
      if (!wcUri) {
        window.open(appUrl.mobile.android, "_self", "noreferrer noopener");
      } else {
        const href = formatNativeUrl(appUrl.mobile.android, wcUri, "android");
        window.open(href, "_self", "noreferrer noopener");
      }
    }
    if (isIos()) {
      if (!wcUri) {
        window.open(appUrl.mobile.ios, "_self", "noreferrer noopener");
      } else {
        const href = formatNativeUrl(appUrl.mobile.ios, wcUri, "ios");
        window.open(href, "_self", "noreferrer noopener");
      }
    }
  };

  const _disconnect = () => {
    const { wcSignClient } = useGrazSessionStore.getState();
    if (!wcSignClient) throw new Error("walletConnect.signClient is not defined");

    clearSession();
    useGrazInternalStore.setState({
      _reconnect: false,
      _reconnectConnector: null,
      recentChain: null,
    });
  };

  const wcDisconnect = async (topic?: string) => {
    const { wcSignClient } = useGrazSessionStore.getState();
    if (!wcSignClient) throw new Error("walletConnect.signClient is not defined");
    if (!topic) throw new Error("No wallet connect session");

    await wcSignClient.disconnect({
      topic,
      reason: getSdkError("USER_DISCONNECTED"),
    });
    await deleteInactivePairings(wcSignClient);
    _disconnect();
  };

  const getSession = (chainId: string) => {
    try {
      const { wcSignClient } = useGrazSessionStore.getState();
      if (!wcSignClient) throw new Error("walletConnect.signClient is not defined");

      const lastSession = wcSignClient.session.getAll().at(-1);
      if (!lastSession) return;
      const isSameChain = wcSignClient.session
        .getAll()
        .at(-1)
        ?.namespaces.cosmos?.accounts.find((i) => i.startsWith(`cosmos:${chainId}`));
      const isNotExpired = lastSession.expiry * 1000 > Date.now() + 1000;
      if (!isNotExpired) {
        void wcDisconnect(lastSession.topic);
        throw new Error("invalid session");
      }
      if (!isSameChain) {
        try {
          const chainSession = wcSignClient.find({
            requiredNamespaces: {
              cosmos: {
                methods: ["cosmos_getAccounts", "cosmos_signAmino", "cosmos_signDirect"],
                chains: [`cosmos:${chainId}`],
                events: ["chainChanged", "accountsChanged"],
              },
            },
          });
          if (!chainSession.length) {
            throw new Error("no session");
          }
          return chainSession.at(-1);
        } catch (error) {
          if (!(error as Error).message.toLowerCase().includes("no matching key")) throw error;
        }
      }

      return lastSession;
    } catch (error) {
      if (!(error as Error).message.toLowerCase().includes("no matching key")) throw error;
    }
  };

  const checkSession = (chainId: string) => {
    try {
      const lastSession = getSession(chainId);
      return lastSession;
    } catch (error) {
      return undefined;
    }
  };

  const deleteInactivePairings = async (signClient: ISignClient) => {
    try {
      const pairings = signClient.core.pairing.pairings.getAll({ active: false });
      if (!pairings.length) return;
      await Promise.all(
        pairings.map(async (pairing) => {
          await signClient.core.pairing.pairings.delete(pairing.topic, {
            code: 7001,
            message: "clear pairing",
          });
        }),
      );
    } catch (error) {
      if (!(error as Error).message.toLowerCase().includes("no matching key")) throw error;
    }
  };

  const init = async () => {
    const { walletConnect } = useGrazInternalStore.getState();
    if (!walletConnect?.options) throw new Error("walletConnect.options is not defined");
    const { wcSignClient } = useGrazSessionStore.getState();
    if (wcSignClient) {
      useGrazSessionStore.setState({ wcSignClient });
      return wcSignClient;
    }
    const signClient = await SignClient.init(walletConnect.options);
    useGrazSessionStore.setState({ wcSignClient: signClient });
    return signClient;
  };

  const subscription: (reconnect: () => void) => void = (reconnect) => {
    const { wcSignClient } = useGrazSessionStore.getState();
    if (!wcSignClient) return;

    wcSignClient.events.on("session_delete", (_) => {
      _disconnect();
    });
    wcSignClient.events.on("session_expire", (_) => {
      _disconnect();
    });
    wcSignClient.events.on("session_event", (args) => {
      if (
        args.params.event.name === "accountsChanged" &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        args.params.event.data?.[0] !== useGrazSessionStore.getState().account?.bech32Address
      ) {
        const chainId = args.params.chainId.split(":")[1];
        chainId && void enable(chainId);
      } else {
        reconnect();
      }
    });

    return () => {
      wcSignClient.events.off("session_delete", (_) => {
        _disconnect();
      });
      wcSignClient.events.off("session_expire", (_) => {
        _disconnect();
      });
      wcSignClient.events.off("session_event", (args) => {
        if (
          args.params.event.name === "accountsChanged" &&
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          args.params.event.data?.[0] !== useGrazSessionStore.getState().account?.bech32Address
        ) {
          const chainId = args.params.chainId.split(":")[1];
          chainId && void enable(chainId);
        } else {
          reconnect();
        }
      });
    };
  };

  const enable = async (chainId: string) => {
    const { wcSignClient: signClient } = useGrazSessionStore.getState();
    if (!signClient) throw new Error("enable walletConnect.signClient is not defined");
    const { walletConnect } = useGrazInternalStore.getState();
    if (!walletConnect?.options?.projectId) throw new Error("walletConnect.options.projectId is not defined");

    const { Web3Modal } = await import("@web3modal/standalone");

    const web3Modal = new Web3Modal({
      projectId: walletConnect.options.projectId,
      walletConnectVersion: 2,
      enableExplorer: false,
      explorerRecommendedWalletIds: "NONE",

      ...walletConnect.web3Modal,
      // explorerRecommendedWalletIds: [
      // https://walletconnect.com/explorer?type=wallet&version=2&chains=cosmos%3Acosmoshub-4
      // keplr doesn't have complete app object better hide it for now and use getKeplr
      //  "6adb6082c909901b9e7189af3a4a0223102cd6f8d5c39e39f3d49acb92b578bb",
      //   "3ed8cc046c6211a798dc5ec70f1302b43e07db9639fd287de44a9aa115a21ed6",
      //   "feb6ff1fb426db18110f5a80c7adbde846d0a7e96b2bc53af4b73aaf32552bea",
      //   "afbd95522f4041c71dd4f1a065f971fd32372865b416f95a0b1db759ae33f2a7",
      //   "85db431492aa2e8672e93f4ea7acf10c88b97b867b0d373107af63dc4880f041",
      //   "7674bb4e353bf52886768a3ddc2a4562ce2f4191c80831291218ebd90f5f5e26",
      //   "0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150",
      //   "022e8ff84519e427bff394b3a58308bc9838196a8efb45158da0ab7c3228abfb",
      //   "f896cbca30cd6dc414712d3d6fcc2f8f7d35d5bd30e3b1fc5d60cf6c8926f98f",
      // ],
    });

    const { account, activeChain } = useGrazSessionStore.getState();
    const lastSession = checkSession(chainId);
    if ((activeChain?.chainId !== chainId && !lastSession) || !account) {
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
      if (!params) {
        await web3Modal.openModal({ uri });
      } else {
        redirectToApp(uri);
      }
      try {
        await promiseWithTimeout(
          (async () => {
            await approval();
          })(),
          40000,
          new Error("Modal approval timeout"),
        );
      } catch (error) {
        web3Modal.closeModal();
        if (!(error as Error).message.toLowerCase().includes("no matching key")) return Promise.reject(error);
      }
      if (!params) {
        web3Modal.closeModal();
      }
      return Promise.resolve();
    }
    try {
      await promiseWithTimeout(
        (async () => {
          const wcAccount = await getKey(chainId);
          useGrazSessionStore.setState({
            account: wcAccount,
          });
        })(),
        10000,
        new Error("Connection timeout"),
      );
    } catch (error) {
      void wcDisconnect(lastSession?.topic);
      if (!(error as Error).message.toLowerCase().includes("no matching key")) throw error;
    }
  };

  const getAccount = async (chainId: string): Promise<AccountData> => {
    const { wcSignClient } = useGrazSessionStore.getState();
    if (!wcSignClient) throw new Error("walletConnect.signClient is not defined");
    const topic = getSession(chainId)?.topic;
    if (!topic) throw new Error("No wallet connect session");
    redirectToApp();
    const result: { address: string; algo: string; pubkey: string }[] = await wcSignClient.request({
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
      pubkey: new Uint8Array(Buffer.from(result[0].pubkey, encoding)),
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
    const { account, wcSignClient } = useGrazSessionStore.getState();
    if (!wcSignClient) throw new Error("walletConnect.signClient is not defined");
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
            bodyBytes: Buffer.from(signDoc.bodyBytes).toString(encoding),
            authInfoBytes: Buffer.from(signDoc.authInfoBytes).toString(encoding),
            accountNumber: signDoc.accountNumber?.toString(),
          },
        },
      },
    };
    redirectToApp();
    const result: WalletConnectSignDirectResponse = await wcSignClient.request(req);
    return result;
  };

  const signDirect = async (...args: SignDirectParams): Promise<DirectSignResponse> => {
    const [chainId, signer, signDoc] = args;
    const { signature, signed } = await wcSignDirect(chainId, signer, signDoc);
    return {
      signed: {
        chainId: signed.chainId,
        accountNumber: Long.fromString(signed.accountNumber, false),
        authInfoBytes: new Uint8Array(Buffer.from(signed.authInfoBytes, encoding)),
        bodyBytes: new Uint8Array(Buffer.from(signed.bodyBytes, encoding)),
      },
      signature,
    };
  };

  const wcSignAmino = async (...args: SignAminoParams) => {
    const [chainId, signer, signDoc, _signOptions] = args;
    const { wcSignClient } = useGrazSessionStore.getState();
    const { account } = useGrazSessionStore.getState();
    if (!wcSignClient) throw new Error("walletConnect.signClient is not defined");
    if (!account) throw new Error("account is not defined");

    const topic = getSession(chainId)?.topic;
    if (!topic) throw new Error("No wallet connect session");

    redirectToApp();
    const result: AminoSignResponse = await wcSignClient.request({
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
    experimentalSuggestChain,
    getKey,
    getOfflineSigner,
    getOfflineSignerAuto,
    getOfflineSignerOnlyAmino,
    signAmino,
    signDirect,
    subscription,
    init,
  };
};
