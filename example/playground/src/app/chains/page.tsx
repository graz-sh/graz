"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  useAccount,
  useChainInfos,
  useActiveChains,
  useSuggestChain,
  useSuggestChainAndConnect,
  useConnect,
  useDisconnect,
  useActiveWalletType,
} from "graz";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/code-block";
import { Network, Plus, CheckCircle2, Link, Unlink, Sparkles } from "lucide-react";
import { osmosistestnet, cosmoshub } from "graz/chains";
import { AddChainForm } from "@/components/add-chain-form";

export default function ChainsPage() {
  const { isConnected, data: accounts } = useAccount();
  const { walletType } = useActiveWalletType();
  const chainInfos = useChainInfos();
  const activeChains = useActiveChains();
  const { suggest, isLoading: isSuggesting } = useSuggestChain({
    onSuccess: (chainInfo) => {
      console.log("Chain suggested successfully:", chainInfo.chainName);
    },
  });
  const { suggestAndConnect, isLoading } = useSuggestChainAndConnect();
  const { connect, isLoading: isConnecting } = useConnect();
  const { disconnect, isLoading: isDisconnecting } = useDisconnect();

  const handleSuggestChainOnly = () => {
    if (!walletType) return;
    suggest({
      chainInfo: cosmoshub,
      walletType,
    });
  };

  const handleSuggestChain = () => {
    suggestAndConnect({
      chainInfo: osmosistestnet,
    });
  };

  const handleConnectChain = (chainId: string) => {
    connect({ chainId: [chainId] });
  };

  const handleDisconnectChain = (chainId: string) => {
    disconnect({ chainId: [chainId] });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chain Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage multiple chains using <code className="text-sm bg-muted px-1 py-0.5 rounded">useSuggestChain()</code>
            , <code className="text-sm bg-muted px-1 py-0.5 rounded">useSuggestChainAndConnect()</code>, and{" "}
            <code className="text-sm bg-muted px-1 py-0.5 rounded">useAddChain()</code>
          </p>
        </div>

        {!isConnected ? (
          <Card>
            <CardHeader>
              <CardTitle>No Wallet Connected</CardTitle>
              <CardDescription>Connect your wallet to manage chains</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  <CardTitle>Active Chains</CardTitle>
                </div>
                <CardDescription>Currently connected chains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeChains?.map((chain) => {
                    const account = accounts?.[chain.chainId];
                    return (
                      <div key={chain.chainId} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              {chain.chainName}
                            </h3>
                            <p className="text-sm text-muted-foreground font-mono">{chain.chainId}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">Connected</Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisconnectChain(chain.chainId)}
                              disabled={isDisconnecting}
                            >
                              <Unlink className="h-3 w-3 mr-1" />
                              Disconnect
                            </Button>
                          </div>
                        </div>
                        {account && (
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Address: </span>
                              <span className="font-mono text-xs break-all">{account.bech32Address}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">RPC: </span>
                              <span className="font-mono text-xs">{chain.rpc}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(!activeChains || activeChains.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No active chains</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <CardTitle>Suggest Chain Only</CardTitle>
                  </div>
                  <CardDescription>Add Cosmos Hub to wallet without connecting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/5">
                    <h3 className="font-semibold">{cosmoshub.chainName}</h3>
                    <p className="text-sm text-muted-foreground font-mono mt-1">{cosmoshub.chainId}</p>
                    <p className="text-xs text-muted-foreground mt-2">RPC: {cosmoshub.rpc}</p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-xs text-blue-900 dark:text-blue-100">
                      <strong>Note:</strong> This uses <code className="font-mono">useSuggestChain</code> which only
                      suggests the chain to your wallet. You'll need to connect manually afterwards.
                    </p>
                  </div>
                  <Button
                    onClick={handleSuggestChainOnly}
                    disabled={isSuggesting || !walletType}
                    className="w-full"
                    variant="outline"
                  >
                    {isSuggesting ? "Suggesting..." : "Suggest Chain"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    <CardTitle>Suggest and Connect</CardTitle>
                  </div>
                  <CardDescription>Add and automatically connect to Osmosis Testnet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/5">
                    <h3 className="font-semibold">{osmosistestnet.chainName}</h3>
                    <p className="text-sm text-muted-foreground font-mono mt-1">{osmosistestnet.chainId}</p>
                    <p className="text-xs text-muted-foreground mt-2">RPC: {osmosistestnet.rpc}</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-xs text-green-900 dark:text-green-100">
                      <strong>Note:</strong> This uses <code className="font-mono">useSuggestChainAndConnect</code>{" "}
                      which suggests the chain AND connects automatically.
                    </p>
                  </div>
                  <Button onClick={handleSuggestChain} disabled={isLoading} className="w-full">
                    {isLoading ? "Connecting..." : "Suggest and Connect"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Add Chain Form and Configured Chains - Side by Side */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Add Chain Form */}
          <AddChainForm />

          {/* Configured Chains */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Configured Chains</CardTitle>
              <CardDescription>All chains configured in GrazProvider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {chainInfos?.map((chain) => {
                  const isActive = activeChains?.some((ac) => ac.chainId === chain.chainId);
                  return (
                    <div key={chain.chainId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{chain.chainName}</p>
                          {isActive && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-1 truncate">{chain.chainId}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Prefix: {chain.bech32Config?.bech32PrefixAccAddr || "N/A"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 items-end ml-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={isActive ? "default" : "outline"}>{isActive ? "Active" : "Configured"}</Badge>
                          {!isActive && isConnected && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConnectChain(chain.chainId)}
                              disabled={isConnecting}
                            >
                              <Link className="h-3 w-3 mr-1" />
                              Connect
                            </Button>
                          )}
                        </div>
                        <Badge variant="secondary">{chain.currencies?.[0]?.coinDenom || "N/A"}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hook Usage</CardTitle>
            <CardDescription>Example code for this page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Suggesting a Chain (Without Connecting)</p>
              <CodeBlock
                code={`import { useSuggestChain, useActiveWalletType } from "graz";
import { cosmoshub } from "graz/chains";

// Get the active wallet type
const { walletType } = useActiveWalletType();

// Initialize hook with optional callbacks
const { suggest, isLoading } = useSuggestChain({
  onSuccess: (chainInfo) => {
    console.log("Chain suggested:", chainInfo.chainName);
  },
  onError: (error) => {
    console.error("Failed to suggest chain:", error);
  },
});

// Suggest chain to wallet (user will need to connect manually)
if (walletType) {
  suggest({
    chainInfo: cosmoshub,
    walletType,
  });
}`}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Suggesting and Auto-Connecting</p>
              <CodeBlock
                code={`import { useSuggestChainAndConnect } from "graz";
import { osmosistestnet } from "graz/chains";

const { suggestAndConnect, isLoading } = useSuggestChainAndConnect();

// Suggest chain and automatically connect
suggestAndConnect({
  chainInfo: osmosistestnet,
});`}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Adding Custom Chains</p>
              <CodeBlock
                code={`import { useAddChain } from "graz";
import type { ChainInfo } from "@keplr-wallet/types";

const { addChain, isLoading, error } = useAddChain({
  onSuccess: (chainInfo) => {
    console.log("Chain added:", chainInfo);
  },
});

// Add a custom chain to graz's internal store
const myChainInfo: ChainInfo = {
  chainId: "custom-chain-1",
  chainName: "Custom Chain",
  rpc: "https://rpc.custom.chain",
  rest: "https://lcd.custom.chain",
  bip44: { coinType: 118 },
  bech32Config: {
    bech32PrefixAccAddr: "custom",
    bech32PrefixAccPub: "custompub",
    bech32PrefixValAddr: "customvaloper",
    bech32PrefixValPub: "customvaloperpub",
    bech32PrefixConsAddr: "customvalcons",
    bech32PrefixConsPub: "customvalconspub",
  },
  currencies: [{ coinDenom: "CUSTOM", coinMinimalDenom: "ucustom", coinDecimals: 6 }],
  feeCurrencies: [{
    coinDenom: "CUSTOM",
    coinMinimalDenom: "ucustom",
    coinDecimals: 6,
    gasPriceStep: { low: 0.01, average: 0.025, high: 0.04 }
  }],
  stakeCurrency: { coinDenom: "CUSTOM", coinMinimalDenom: "ucustom", coinDecimals: 6 },
};

addChain({ chainInfo: myChainInfo });`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
