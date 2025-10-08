"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAccount, useChainInfos } from "graz";
import { CodeBlock } from "@/components/code-block";
import { ChainBalances } from "@/components/chain-balances";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

export default function BalancesPage() {
  const { isConnected, isConnecting, isReconnecting, data: accounts } = useAccount();

  // Get chain IDs from connected accounts
  const connectedChainIds = accounts ? Object.keys(accounts) : [];

  // Get full chain info for connected chains
  const chains = useChainInfos({ chainId: connectedChainIds });

  const isLoading = isConnecting || isReconnecting;

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Balances</h1>
            <p className="text-muted-foreground mt-2">
              View token balances across multiple chains using{" "}
              <code className="text-sm bg-muted px-1 py-0.5 rounded">useBalances()</code> and{" "}
              <code className="text-sm bg-muted px-1 py-0.5 rounded">useBalanceStaked()</code> hooks
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5 rounded" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                      <div className="p-4 rounded-lg border space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !isConnected ? (
            <Card>
              <CardHeader>
                <CardTitle>No Wallet Connected</CardTitle>
                <CardDescription>Connect your wallet to view balances</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                {chains?.map((chain) => {
                  const account = accounts?.[chain.chainId];
                  return <ChainBalances key={chain.chainId} chain={chain} account={account} />;
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
              <CodeBlock
                code={`import { useAccount, useChainInfos, useBalances, useBalanceStaked } from "graz";

// Get connected accounts
const { data: accounts } = useAccount();

// Get chain IDs from connected accounts
const connectedChainIds = accounts ? Object.keys(accounts) : [];

// Get full chain info for connected chains
const chains = useChainInfos({ chainId: connectedChainIds });

// Loop through chains and render a component for each
chains?.map((chain) => {
  const account = accounts?.[chain.chainId];

  // Inside ChainBalances component:
  const { data: balances } = useBalances({
    chainId: chain.chainId,
    bech32Address: account?.bech32Address || "",
    enabled: Boolean(account?.bech32Address),
  });

  const { data: staked } = useBalanceStaked({
    chainId: chain.chainId,
    bech32Address: account?.bech32Address || "",
    enabled: Boolean(account?.bech32Address),
  });

  return <ChainBalances chain={chain} account={account} />;
});`}
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}
