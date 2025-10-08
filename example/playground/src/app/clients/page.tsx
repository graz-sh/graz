"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAccount, useStargateSigningClient, useCosmWasmSigningClient, useActiveChains } from "graz";
import { Badge } from "@/components/ui/badge";
import { Link2, CheckCircle2, XCircle } from "lucide-react";

export default function ClientsPage() {
  const { isConnected, data: accounts } = useAccount();
  const activeChains = useActiveChains();
  const activeChainIds = (activeChains?.map((chain) => chain.chainId) || []) as readonly string[];

  const { data: stargateClients, isLoading: isLoadingStargate } = useStargateSigningClient({
    chainId: activeChainIds,
    enabled: activeChainIds.length > 0,
  });

  const { data: cosmWasmClients, isLoading: isLoadingCosmWasm } = useCosmWasmSigningClient({
    chainId: activeChainIds,
    enabled: activeChainIds.length > 0,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Signing Clients</h1>
          <p className="text-muted-foreground mt-2">
            Access signing clients across multiple chains using <code className="text-sm bg-muted px-1 py-0.5 rounded">useStargateSigningClient()</code> and <code className="text-sm bg-muted px-1 py-0.5 rounded">useCosmWasmSigningClient()</code>
          </p>
        </div>

        {!isConnected ? (
          <Card>
            <CardHeader>
              <CardTitle>No Wallet Connected</CardTitle>
              <CardDescription>Connect your wallet to access signing clients</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Stargate Signing Clients</h2>
              <p className="text-sm text-muted-foreground">Standard Cosmos SDK transaction signing</p>

              {activeChains?.map((chain) => {
                const hasClient = !!stargateClients?.[chain.chainId];
                const isChainConnected = !!accounts?.[chain.chainId];

                return (
                  <Card key={`stargate-${chain.chainId}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Link2 className="h-5 w-5" />
                          <div>
                            <CardTitle className="text-lg">{chain.chainName}</CardTitle>
                            <CardDescription className="font-mono text-xs">{chain.chainId}</CardDescription>
                          </div>
                        </div>
                        {isLoadingStargate ? (
                          <Badge variant="outline">Loading...</Badge>
                        ) : hasClient ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Ready
                          </Badge>
                        ) : isChainConnected ? (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Not Available
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Connected</Badge>
                        )}
                      </div>
                    </CardHeader>
                    {hasClient && (
                      <CardContent>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-2">Available Methods:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div>• sendTokens()</div>
                            <div>• signAndBroadcast()</div>
                            <div>• simulate()</div>
                            <div>• getBalance()</div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">CosmWasm Signing Clients</h2>
              <p className="text-sm text-muted-foreground">Smart contract interaction signing</p>

              {activeChains?.map((chain) => {
                const hasClient = !!cosmWasmClients?.[chain.chainId];
                const isChainConnected = !!accounts?.[chain.chainId];

                return (
                  <Card key={`cosmwasm-${chain.chainId}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Link2 className="h-5 w-5" />
                          <div>
                            <CardTitle className="text-lg">{chain.chainName}</CardTitle>
                            <CardDescription className="font-mono text-xs">{chain.chainId}</CardDescription>
                          </div>
                        </div>
                        {isLoadingCosmWasm ? (
                          <Badge variant="outline">Loading...</Badge>
                        ) : hasClient ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Ready
                          </Badge>
                        ) : isChainConnected ? (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Not Available
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Connected</Badge>
                        )}
                      </div>
                    </CardHeader>
                    {hasClient && (
                      <CardContent>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-2">Available Methods:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div>• execute()</div>
                            <div>• instantiate()</div>
                            <div>• queryContractSmart()</div>
                            <div>• migrate()</div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Hook Usage</CardTitle>
            <CardDescription>Example code for this page</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
              <code>{`import { useStargateSigningClient, useCosmWasmSigningClient } from "graz";

// Get signing clients for multiple chains
const { data: stargateClients } = useStargateSigningClient({
  chainId: ["cosmoshub-4", "osmosis-1", "neutron-1"],
});

const { data: cosmWasmClients } = useCosmWasmSigningClient({
  chainId: ["cosmoshub-4", "osmosis-1", "neutron-1"],
});

// Use the clients
await stargateClients["cosmoshub-4"].sendTokens(...);
await cosmWasmClients["neutron-1"].execute(...);`}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
