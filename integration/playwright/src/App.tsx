import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  GrazProvider,
  WalletType,
  useAccount,
  useActiveChainIds,
  useCheckWallet,
  useConnect,
  useDisconnect,
  useOfflineSigners,
  useStargateClient,
  useStargateSigningClient,
} from "graz";
import { useEffect, useMemo, useState } from "react";

import { getE2EChainInfo, getE2EConfig } from "./chains";

type TestKeplrSigner = {
  signAmino: (
    chainId: string,
    signer: string,
    signDoc: {
      account_number: string;
      chain_id: string;
      fee: {
        amount: unknown[];
        gas: string;
      };
      memo: string;
      msgs: unknown[];
      sequence: string;
    },
  ) => Promise<{ signature: { signature: string } }>;
  signDirect: (
    chainId: string,
    signer: string,
    signDoc: {
      accountNumber: bigint;
      authInfoBytes: Uint8Array;
      bodyBytes: Uint8Array;
      chainId: string;
    },
  ) => Promise<{ signature: { signature: string } }>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const boolText = (value: unknown) => (value ? "true" : "false");

const Harness = () => {
  const chainInfo = useMemo(() => getE2EChainInfo(), []);
  const chainConfig = useMemo(() => getE2EConfig(), []);
  const chainIds = useMemo(() => [chainInfo.chainId], [chainInfo.chainId]);
  const { data: isKeplrSupported } = useCheckWallet(WalletType.KEPLR);
  const account = useAccount({ chainId: chainIds });
  const activeChainIds = useActiveChainIds();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const [clientEnabled, setClientEnabled] = useState(false);
  const [signingEnabled, setSigningEnabled] = useState(false);
  const [clientHeight, setClientHeight] = useState("");
  const [clientError, setClientError] = useState("");
  const [signingReady, setSigningReady] = useState(false);
  const [signError, setSignError] = useState("");
  const [aminoSignature, setAminoSignature] = useState("");
  const [directSignature, setDirectSignature] = useState("");

  const stargateClient = useStargateClient({ chainId: chainIds, enabled: clientEnabled });
  const stargateSigningClient = useStargateSigningClient({ chainId: chainIds, enabled: signingEnabled });
  const offlineSigners = useOfflineSigners({ chainId: chainIds });

  const address = account.data?.[chainInfo.chainId]?.bech32Address ?? "";
  const walletState = window.__GRAZ_E2E_WALLET_STATE__;

  useEffect(() => {
    if (!clientEnabled) return;
    const client = stargateClient.data?.[chainInfo.chainId];
    if (!client) return;

    let isCurrent = true;
    void client
      .getHeight()
      .then((height) => {
        if (isCurrent) setClientHeight(String(height));
      })
      .catch((error: unknown) => {
        if (isCurrent) setClientError(error instanceof Error ? error.message : String(error));
      });

    return () => {
      isCurrent = false;
    };
  }, [chainInfo.chainId, clientEnabled, stargateClient.data]);

  useEffect(() => {
    const client = stargateSigningClient.data?.[chainInfo.chainId];
    if (client) {
      setSigningReady(true);
    }
  }, [chainInfo.chainId, stargateSigningClient.data]);

  const connectWallet = async () => {
    await connect.connectAsync({
      chainId: chainIds,
      walletType: WalletType.KEPLR,
      autoReconnect: true,
    });
  };

  const disconnectWallet = async () => {
    await disconnect.disconnectAsync();
    setSigningReady(false);
    setSigningEnabled(false);
    setAminoSignature("");
    setDirectSignature("");
  };

  const signDocs = async () => {
    setSignError("");
    try {
      if (!address) throw new Error("No connected address");
      if (!window.keplr) throw new Error("No Keplr wallet");
      const signer = window.keplr as unknown as TestKeplrSigner;

      const amino = await signer.signAmino(chainInfo.chainId, address, {
        chain_id: chainInfo.chainId,
        account_number: "0",
        sequence: "0",
        fee: {
          amount: [],
          gas: "0",
        },
        msgs: [],
        memo: "graz-playwright-amino",
      });
      const direct = await signer.signDirect(chainInfo.chainId, address, {
        accountNumber: 0n,
        authInfoBytes: new Uint8Array(),
        bodyBytes: new Uint8Array(),
        chainId: chainInfo.chainId,
      });

      setAminoSignature(amino.signature.signature);
      setDirectSignature(direct.signature.signature);
    } catch (error) {
      setSignError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <main>
      <h1>Graz Playwright Integration</h1>
      <dl>
        <dt>Chain</dt>
        <dd data-testid="chain-id">{chainInfo.chainId}</dd>
        <dt>Wallet Supported</dt>
        <dd data-testid="wallet-supported">{boolText(isKeplrSupported)}</dd>
        <dt>Status</dt>
        <dd data-testid="account-status">{account.status}</dd>
        <dt>Connected</dt>
        <dd data-testid="account-connected">{boolText(account.isConnected)}</dd>
        <dt>Address</dt>
        <dd data-testid="account-address">{address}</dd>
        <dt>Expected Address</dt>
        <dd data-testid="expected-address">{chainConfig.expectedAddress ?? ""}</dd>
        <dt>Active Chain IDs</dt>
        <dd data-testid="active-chain-ids">{JSON.stringify(activeChainIds ?? [])}</dd>
        <dt>Wallet Calls</dt>
        <dd data-testid="wallet-calls">{JSON.stringify(walletState?.calls ?? [])}</dd>
        <dt>Offline Signers</dt>
        <dd data-testid="offline-signers-ready">{boolText(offlineSigners.data?.[chainInfo.chainId])}</dd>
        <dt>Client Height</dt>
        <dd data-testid="client-height">{clientHeight}</dd>
        <dt>Client Error</dt>
        <dd data-testid="client-error">{clientError}</dd>
        <dt>Signing Client</dt>
        <dd data-testid="signing-client-ready">{boolText(signingReady)}</dd>
        <dt>Amino Signature</dt>
        <dd data-testid="amino-signature">{aminoSignature}</dd>
        <dt>Direct Signature</dt>
        <dd data-testid="direct-signature">{directSignature}</dd>
        <dt>Sign Error</dt>
        <dd data-testid="sign-error">{signError}</dd>
      </dl>
      <button data-testid="connect-keplr" type="button" onClick={() => void connectWallet()}>
        Connect Keplr
      </button>
      <button data-testid="disconnect-keplr" type="button" onClick={() => void disconnectWallet()}>
        Disconnect
      </button>
      <button data-testid="load-stargate-client" type="button" onClick={() => setClientEnabled(true)}>
        Load Stargate Client
      </button>
      <button data-testid="load-signing-client" type="button" onClick={() => setSigningEnabled(true)}>
        Load Signing Client
      </button>
      <button data-testid="sign-docs" type="button" onClick={() => void signDocs()}>
        Sign Docs
      </button>
    </main>
  );
};

export const App = () => {
  const chainInfo = useMemo(() => getE2EChainInfo(), []);
  const chainConfig = useMemo(() => getE2EConfig(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <GrazProvider
        grazOptions={{
          autoReconnect: true,
          chains: [chainInfo],
          chainsConfig: chainConfig.rpcHeaders
            ? {
                [chainInfo.chainId]: {
                  rpcHeaders: chainConfig.rpcHeaders,
                },
              }
            : undefined,
          defaultWallet: WalletType.KEPLR,
        }}
      >
        <Harness />
      </GrazProvider>
    </QueryClientProvider>
  );
};
