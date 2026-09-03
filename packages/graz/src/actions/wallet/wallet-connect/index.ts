import type { AminoSignResponse } from "@cosmjs/amino";
import { fromBase64, fromBech32 } from "@cosmjs/encoding";
import type { AccountData, Algo, DirectSignResponse } from "@cosmjs/proto-signing";
import type { Keplr } from "@keplr-wallet/types";
import { WalletConnectModal } from "@walletconnect/modal";
import { SignClient } from "@walletconnect/sign-client";
import type { ISignClient, SessionTypes, SignClientTypes } from "@walletconnect/types";
import { getSdkError, parseChainId } from "@walletconnect/utils";

import { useGrazInternalStore, useGrazSessionStore } from "../../../store";
import type { Key } from "../../../types/wallet";
import { type SignAminoParams, type SignDirectParams, type Wallet, WalletType } from "../../../types/wallet";
import { isAndroid, isIos, isMobile } from "../../../utils/os";
import { promiseWithTimeout } from "../../../utils/timeout";
import { type ResolvedSession, resolveApprovedChainIds, resolveSession } from "./approved-session";
import type { GetWalletConnectParams, WalletConnectSignDirectResponse } from "./types";

type WalletConnectAccount = {
  address?: Key["address"] | number[] | string;
  algo?: string;
  bech32Address?: string;
  chainId?: string;
  isKeystone?: boolean;
  isNanoLedger?: boolean;
  name?: string;
  pubKey?: Key["pubKey"] | string;
  pubkey?: string;
};

type WalletConnectStoredKey = Key & { chainId?: string };

const disconnectingSessions = new WeakMap<ISignClient, Map<string, Promise<void>>>();
const initializingSignClients = new Map<WalletType, Promise<ISignClient>>();

const isMissingWalletConnectRecordError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("no matching key") ||
    message.includes("record was recently deleted") ||
    message.includes("session topic does not exist in keychain")
  );
};

export const getWalletConnect = (params?: GetWalletConnectParams): Wallet => {
  if (!useGrazInternalStore.getState().walletConnect?.options?.projectId?.trim()) {
    throw new Error("walletConnect.options.projectId is not defined");
  }

  const walletType = params?.walletType || WalletType.WALLETCONNECT;
  const encoding = params?.encoding || "base64";

  const redirectToApp = (wcUri?: string) => {
    if (!params) return;
    const { appUrl, formatNativeUrl } = params;
    if (!isMobile()) return;
    if (isAndroid()) {
      const href = formatNativeUrl(appUrl.mobile.android, wcUri, "android");
      window.open(href, "_self", "noreferrer noopener");
    }
    if (isIos()) {
      const href = formatNativeUrl(appUrl.mobile.ios, wcUri, "ios");
      window.open(href, "_self", "noreferrer noopener");
    }
  };

  const _disconnect = () => {
    useGrazInternalStore.setState({
      _reconnect: false,
      _reconnectConnector: null,
      recentChainIds: null,
    });
  };

  const wcDisconnect = (topic?: string): Promise<void> => {
    const { wcSignClients } = useGrazSessionStore.getState();
    const wcSignClient = wcSignClients.get(walletType);
    if (!wcSignClient) throw new Error("walletConnect.signClient is not defined");
    if (!topic) throw new Error("No wallet connect session");

    const clientDisconnects = disconnectingSessions.get(wcSignClient) ?? new Map<string, Promise<void>>();
    disconnectingSessions.set(wcSignClient, clientDisconnects);
    const pendingDisconnect = clientDisconnects.get(topic);
    if (pendingDisconnect) return pendingDisconnect;

    const disconnect = (async () => {
      try {
        await wcSignClient.disconnect({
          topic,
          reason: getSdkError("USER_DISCONNECTED"),
        });
      } catch (error) {
        if (!isMissingWalletConnectRecordError(error)) throw error;
      }
      await deleteInactivePairings(wcSignClient);
    })();
    const trackedDisconnect = disconnect.finally(() => {
      if (clientDisconnects.get(topic) !== trackedDisconnect) return;
      clientDisconnects.delete(topic);
      if (clientDisconnects.size === 0) disconnectingSessions.delete(wcSignClient);
    });
    clientDisconnects.set(topic, trackedDisconnect);
    return trackedDisconnect;
  };

  const getSession = (chainIds: string[]) => {
    try {
      const { wcSignClients } = useGrazSessionStore.getState();
      const wcSignClient = wcSignClients.get(walletType);
      if (!wcSignClient) throw new Error("walletConnect.signClient is not defined");
      const allSession = wcSignClient.session.getAll();
      const lastSession = allSession[allSession.length - 1];
      if (!lastSession) return;

      const isValid = lastSession.expiry * 1000 > Date.now() + 1000;
      if (!isValid) {
        // An expired session may already be gone; don't block a fresh connection.
        void wcDisconnect(lastSession.topic).catch(() => undefined);
      }

      return resolveSession(lastSession, { chainIds });
    } catch (error) {
      if (!isMissingWalletConnectRecordError(error)) throw error;
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
      if (!isMissingWalletConnectRecordError(error)) throw error;
    }
  };

  const parseSessionKeys = (sessionProperties?: Record<string, string>): WalletConnectAccount[] | undefined => {
    const rawKeys = sessionProperties?.keys;
    if (!rawKeys) return;

    const keys = JSON.parse(String(rawKeys)) as WalletConnectAccount[];
    if (!Array.isArray(keys) || keys.length === 0) throw new Error("No accounts");

    return keys;
  };

  const getWalletConnectChainId = (chainId?: string) => {
    if (!chainId?.includes(":")) return chainId;
    const parsed = parseChainId(chainId);
    return parsed.namespace === "cosmos" ? parsed.reference : undefined;
  };

  const normalizeWalletConnectAccount = (
    account: WalletConnectAccount,
    fallbackChainId?: string,
  ): WalletConnectStoredKey | undefined => {
    const bech32Address = account.bech32Address ?? (typeof account.address === "string" ? account.address : undefined);
    if (!account.algo || !bech32Address || (!account.pubKey && !account.pubkey)) return;

    const chainId = account.chainId === undefined ? fallbackChainId : getWalletConnectChainId(account.chainId);
    if (account.chainId !== undefined && !chainId) return;

    let address: Uint8Array;
    let pubKey: Uint8Array;
    try {
      address = fromBech32(bech32Address).data;
    } catch {
      return;
    }

    try {
      if (account.pubkey) {
        pubKey = fromBase64(account.pubkey);
      } else if (typeof account.pubKey === "string") {
        pubKey = Buffer.from(account.pubKey, encoding);
      } else if (account.pubKey instanceof Uint8Array) {
        pubKey = account.pubKey;
      } else {
        return;
      }
    } catch {
      return;
    }

    return {
      address,
      algo: account.algo,
      bech32Address,
      chainId,
      isKeystone: account.isKeystone ?? false,
      isNanoLedger: account.isNanoLedger ?? false,
      name: account.name ?? "WalletConnect",
      pubKey,
    };
  };

  const filterApprovedKeys = (
    resolvedSession: ResolvedSession,
    chainIds: readonly string[],
    keys: WalletConnectStoredKey[],
  ): WalletConnectStoredKey[] => {
    const approvedAccounts = resolvedSession.scope.accounts.filter((account) => chainIds.includes(account.chainId));

    return keys.flatMap((key) => {
      const keyChainId = getWalletConnectChainId(key.chainId);
      if (key.chainId !== undefined && !keyChainId) return [];
      const matches = approvedAccounts.filter(
        (account) => (!keyChainId || account.chainId === keyChainId) && account.address === key.bech32Address,
      );
      if (matches.length !== 1) return [];

      const approvedAccount = matches[0];
      return approvedAccount ? [{ ...key, chainId: approvedAccount.chainId }] : [];
    });
  };

  const requestAccounts = async (
    signClient: ISignClient,
    resolvedSession: ResolvedSession,
    topic: string,
    chainIds: string[],
  ): Promise<WalletConnectStoredKey[]> => {
    const keysByChainId = await Promise.all(
      chainIds.map(async (chainId) => {
        const response = await signClient.request({
          topic,
          chainId: `cosmos:${chainId}`,
          request: {
            method: "cosmos_getAccounts",
            params: {},
          },
        });
        const accounts = Array.isArray(response)
          ? (response as WalletConnectAccount[])
          : (response as { accounts?: WalletConnectAccount[] }).accounts;
        if (!Array.isArray(accounts) || accounts.length === 0) throw new Error("No accounts");

        return accounts.flatMap((account) => {
          const key = normalizeWalletConnectAccount(account, chainId);
          return key ? [key] : [];
        });
      }),
    );

    return filterApprovedKeys(resolvedSession, chainIds, keysByChainId.flat());
  };

  const getSessionKeys = async (
    signClient: ISignClient,
    resolvedSession: ResolvedSession,
    chainIds: string[],
  ): Promise<WalletConnectStoredKey[]> => {
    const storedKeys = filterApprovedKeys(
      resolvedSession,
      chainIds,
      (parseSessionKeys(resolvedSession.session.sessionProperties) ?? []).flatMap((account) => {
        const key = normalizeWalletConnectAccount(account);
        return key ? [key] : [];
      }),
    );
    const missingChainIds = chainIds.filter((chainId) => !storedKeys.some((key) => key.chainId === chainId));
    if (missingChainIds.length === 0) return storedKeys;
    if (!resolvedSession.session.topic) throw new Error("No wallet connect session");

    const requestedKeys = await requestAccounts(
      signClient,
      resolvedSession,
      resolvedSession.session.topic,
      missingChainIds,
    );
    const keys = [...storedKeys, ...requestedKeys];
    const unresolvedChainIds = chainIds.filter((chainId) => !keys.some((key) => key.chainId === chainId));
    if (unresolvedChainIds.length > 0) {
      throw new Error(`No WalletConnect accounts for approved chains: ${unresolvedChainIds.join(", ")}`);
    }

    return keys;
  };

  const materializeAccounts = async (
    signClient: ISignClient,
    resolvedSession: ResolvedSession,
    requestedChainIds: string[],
  ): Promise<Record<string, Key>> => {
    const configuredChainIds =
      useGrazInternalStore.getState().chains?.map((chain) => chain.chainId) ?? requestedChainIds;
    const chainIds = resolveApprovedChainIds(resolvedSession.scope, requestedChainIds, configuredChainIds);
    if (chainIds.length === 0) throw new Error("No approved WalletConnect accounts for configured chains");

    const keys = await getSessionKeys(signClient, resolvedSession, chainIds);
    const accounts: Record<string, Key> = {};
    keys.forEach((key) => {
      if (!key.chainId) return;
      accounts[key.chainId] = {
        address: key.address,
        algo: key.algo as Algo,
        bech32Address: key.bech32Address,
        isNanoLedger: key.isNanoLedger,
        isKeystone: key.isKeystone,
        name: key.name,
        pubKey: key.pubKey,
      };
    });

    return accounts;
  };

  const commitAccounts = (accounts: Record<string, Key>, requestedChainIds: string[]) => {
    useGrazSessionStore.setState((previous) => {
      const nextAccounts = { ...(previous.accounts ?? {}) };
      requestedChainIds.forEach((chainId) => delete nextAccounts[chainId]);
      return { accounts: { ...nextAccounts, ...accounts } };
    });
  };

  const init = async () => {
    const { walletConnect } = useGrazInternalStore.getState();
    if (!walletConnect?.options) throw new Error("walletConnect.options is not defined");
    const options = walletConnect.options;
    const { wcSignClients } = useGrazSessionStore.getState();
    const wcSignClient = wcSignClients.get(walletType);
    if (wcSignClient) {
      return wcSignClient;
    }

    const pendingInitialization = initializingSignClients.get(walletType);
    if (pendingInitialization) return pendingInitialization;

    const initialization = (async () => {
      const signClient = await SignClient.init(options);
      const currentClients = new Map(useGrazSessionStore.getState().wcSignClients);
      const currentClient = currentClients.get(walletType);
      if (currentClient) return currentClient;

      currentClients.set(walletType, signClient);
      useGrazSessionStore.setState({ wcSignClients: currentClients });
      return signClient;
    })();
    initializingSignClients.set(walletType, initialization);

    try {
      return await initialization;
    } finally {
      if (initializingSignClients.get(walletType) === initialization) initializingSignClients.delete(walletType);
    }
  };

  const subscription: (reconnect: () => void) => () => void = (reconnect) => {
    const { wcSignClients } = useGrazSessionStore.getState();
    const wcSignClient = wcSignClients.get(walletType);

    if (!wcSignClient) return () => {};

    const sessionEventListener = (args: SignClientTypes.EventArguments["session_event"]) => {
      const _accounts = useGrazSessionStore.getState().accounts;
      if (
        args.params.event.name === "accountsChanged" &&
        _accounts &&
        !Object.values(_accounts)
          .map((x) => x.bech32Address)

          .includes(args.params.event.data[0])
      ) {
        const chainId = args.params.chainId.split(":")[1];
        chainId && void enable([chainId]);
      } else {
        reconnect();
      }
    };

    wcSignClient.events.on("session_delete", _disconnect);
    wcSignClient.events.on("session_expire", _disconnect);
    wcSignClient.events.on("session_event", sessionEventListener);

    return () => {
      wcSignClient.events.off("session_delete", _disconnect);
      wcSignClient.events.off("session_expire", _disconnect);
      wcSignClient.events.off("session_event", sessionEventListener);
    };
  };

  const enable = async (_chainId: string | string[]) => {
    const chainId = typeof _chainId === "string" ? [_chainId] : _chainId;
    const { wcSignClients } = useGrazSessionStore.getState();
    const signClient = wcSignClients.get(walletType);
    if (!signClient) throw new Error("enable walletConnect.signClient is not defined");
    const { walletConnect } = useGrazInternalStore.getState();
    if (!walletConnect?.options?.projectId) throw new Error("walletConnect.options.projectId is not defined");

    const walletConnectModal = new WalletConnectModal({
      projectId: walletConnect.options.projectId,
      ...walletConnect.walletConnectModal,
      enableExplorer: false,
      explorerRecommendedWalletIds: "NONE",
    });
    const resolvedSession = getSession(chainId);
    if (!resolvedSession) {
      const { uri, approval } = await promiseWithTimeout(
        signClient.connect({
          optionalNamespaces: {
            cosmos: {
              methods: ["cosmos_getAccounts", "cosmos_signAmino", "cosmos_signDirect"],
              chains: chainId.map((i) => `cosmos:${i}`),
              events: ["chainChanged", "accountsChanged"],
            },
          },
        }),
        15000,
        new Error("Connection timeout"),
      );
      if (!uri) throw new Error("No wallet connect uri");
      if (!params) {
        await walletConnectModal.openModal({ uri });
      } else {
        redirectToApp(uri);
      }
      const approving = async (signal: AbortSignal): Promise<SessionTypes.Struct> => {
        if (signal.aborted) return Promise.reject(new Error("User closed wallet connect"));
        return new Promise<SessionTypes.Struct>((resolve, reject) => {
          approval().then(resolve).catch(reject);
          signal.addEventListener(
            "abort",
            () => {
              reject(new Error("User closed wallet connect"));
            },
            { once: true },
          );
        });
      };

      let approvedSession: SessionTypes.Struct | undefined;
      try {
        const controller = new AbortController();
        const signal = controller.signal;
        walletConnectModal.subscribeModal((state) => {
          if (!state.open) {
            controller.abort();
          }
        });
        approvedSession = await approving(signal);
        const approved = resolveSession(approvedSession);
        if (!approved) throw new Error("No approved WalletConnect accounts");
        const accounts = await materializeAccounts(signClient, approved, chainId);
        commitAccounts(accounts, chainId);
      } catch (error) {
        walletConnectModal.closeModal();
        if (approvedSession?.topic) await wcDisconnect(approvedSession.topic).catch(() => undefined);
        throw error;
      }
      if (!params) {
        walletConnectModal.closeModal();
      }
      return;
    }

    const accounts = await promiseWithTimeout(
      materializeAccounts(signClient, resolvedSession, chainId),
      15000,
      new Error("Connection timeout"),
    );
    commitAccounts(accounts, chainId);
  };

  const resolveStoredApprovedKey = (chainId: string): Key | undefined => {
    const { accounts, wcSignClients } = useGrazSessionStore.getState();
    const storedKey = accounts?.[chainId];
    const wcSignClient = wcSignClients.get(walletType);
    if (!storedKey || !wcSignClient) return;

    try {
      const allSession = wcSignClient.session.getAll();
      const resolvedSession = resolveSession(allSession[allSession.length - 1], { chainIds: [chainId] });
      const isApproved = resolvedSession?.scope.accounts.some(
        (account) => account.chainId === chainId && account.address === storedKey.bech32Address,
      );
      return isApproved ? storedKey : undefined;
    } catch (error) {
      if (!isMissingWalletConnectRecordError(error)) throw error;
    }
  };

  const getAccount = async (chainId: string): Promise<AccountData> => {
    const key = resolveStoredApprovedKey(chainId) ?? (await getKey(chainId));

    return {
      address: key.bech32Address,
      algo: key.algo as Algo,
      pubkey: key.pubKey,
    };
  };

  const getKey = async (chainId: string): Promise<Key> => {
    const resolvedSession = getSession([chainId]);
    if (!resolvedSession?.session.topic) throw new Error("No wallet connect session");
    const { wcSignClients } = useGrazSessionStore.getState();
    const wcSignClient = wcSignClients.get(walletType);
    if (!wcSignClient) throw new Error("walletConnect.signClient is not defined");

    const keys = await getSessionKeys(wcSignClient, resolvedSession, [chainId]);
    if (keys.length === 0) throw new Error("No wallet connect session");
    const key = keys.find((x) => x.chainId === chainId);
    if (!key) throw new Error(`No wallet connect key for chainId ${chainId}`);

    return {
      ...key,
      pubKey: key.pubKey,
    };
  };

  const wcSignDirect = async (...args: SignDirectParams) => {
    const [chainId, signer, signDoc] = args;
    const { accounts: account, wcSignClients } = useGrazSessionStore.getState();
    const wcSignClient = wcSignClients.get(walletType);
    if (!wcSignClient) throw new Error("walletConnect.signClient is not defined");
    if (!account) throw new Error("account is not defined");

    const topic = getSession([chainId])?.session.topic;
    if (!topic) throw new Error("No wallet connect session");

    if (!signDoc.bodyBytes) throw new Error("No bodyBytes");
    if (!signDoc.authInfoBytes) throw new Error("No authInfoBytes");
    redirectToApp();
    const result: WalletConnectSignDirectResponse = await wcSignClient.request({
      topic,
      chainId: `cosmos:${chainId}`,
      request: {
        method: "cosmos_signDirect",
        params: {
          signerAddress: signer,
          signDoc: {
            chainId: signDoc.chainId,
            accountNumber: signDoc.accountNumber?.toString(),
            bodyBytes: signDoc.bodyBytes ? Buffer.from(signDoc.bodyBytes).toString(encoding) : null,
            authInfoBytes: signDoc.authInfoBytes ? Buffer.from(signDoc.authInfoBytes).toString(encoding) : null,
          },
        },
      },
    });
    return result;
  };

  const signDirect = async (...args: SignDirectParams): Promise<DirectSignResponse> => {
    const [chainId, signer, signDoc] = args;
    const { signature, signed } = await wcSignDirect(chainId, signer, signDoc);
    return {
      signed: {
        chainId: signed.chainId ?? "",
        accountNumber: signed.accountNumber ? BigInt(signed.accountNumber) : BigInt(0),
        authInfoBytes: signed.authInfoBytes
          ? new Uint8Array(Buffer.from(signed.authInfoBytes, encoding))
          : new Uint8Array([]),
        bodyBytes: signed.bodyBytes ? new Uint8Array(Buffer.from(signed.bodyBytes, encoding)) : new Uint8Array([]),
      },
      signature,
    };
  };

  const wcSignAmino = async (...args: SignAminoParams) => {
    const [chainId, signer, signDoc, _signOptions] = args;
    const { wcSignClients } = useGrazSessionStore.getState();
    const wcSignClient = wcSignClients.get(walletType);
    const { accounts: account } = useGrazSessionStore.getState();
    if (!wcSignClient) throw new Error("walletConnect.signClient is not defined");
    if (!account) throw new Error("account is not defined");

    const topic = getSession([chainId])?.session.topic;
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
    const key = resolveStoredApprovedKey(chainId) ?? (await getKey(chainId));
    if (key.isNanoLedger) return getOfflineSignerOnlyAmino(chainId);
    return getOfflineSignerDirect(chainId);
  };

  const experimentalSuggestChain = async (..._args: Parameters<Keplr["experimentalSuggestChain"]>) => {
    await Promise.reject(new Error("WalletConnect does not support experimentalSuggestChain"));
  };

  return {
    enable,
    disable: async (chainIds?: string | string[]) => {
      const { wcSignClients } = useGrazSessionStore.getState();
      const signClient = wcSignClients.get(walletType);

      if (chainIds === undefined) {
        const sessions = signClient?.session.getAll();
        if (sessions !== undefined) await Promise.all(sessions.map((s) => wcDisconnect(s.topic)));
      } else {
        const requestedChainIds = typeof chainIds === "string" ? [chainIds] : chainIds;
        const topics = new Set(
          requestedChainIds
            .map((chainId) => getSession([chainId])?.session.topic)
            .filter((topic): topic is string => topic !== undefined),
        );
        await Promise.all([...topics].map(wcDisconnect));
      }

      // Keep the SignClient alive after its last session so reconnects do not
      // create another Engine over the same WalletConnect Core namespace.
      if (
        signClient?.session.getAll().length === 0 &&
        useGrazSessionStore.getState().wcSignClients.get(walletType) === signClient
      ) {
        _disconnect();
      }
    },
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
