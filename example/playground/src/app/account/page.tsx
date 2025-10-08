"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useAccount, useActiveChainIds, useActiveWalletType, useDisconnect } from "graz";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { Unlink } from "lucide-react";

export default function AccountPage() {
  const { data: accounts, isConnected } = useAccount();
  const activeChainIds = useActiveChainIds();
  const walletType = useActiveWalletType();
  const { disconnect, isLoading: isDisconnecting } = useDisconnect();

  const handleDisconnectChain = (chainId: string) => {
    disconnect({ chainId: [chainId] });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your connected accounts across multiple chains using <code className="text-sm bg-muted px-1 py-0.5 rounded">useAccount()</code> hook
          </p>
        </div>

        {!isConnected ? (
          <Card>
            <CardHeader>
              <CardTitle>No Wallet Connected</CardTitle>
              <CardDescription>Connect your wallet to view account information</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Wallet Information</CardTitle>
                <CardDescription>Currently connected wallet details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Wallet Type</p>
                  <Badge variant="secondary" className="mt-1">{walletType?.walletType || "Unknown"}</Badge>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Connected Chains</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(activeChainIds || []).map((chainId) => (
                      <Badge key={chainId} variant="outline">{chainId}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Accounts by Chain</h2>
              {accounts && Object.entries(accounts).map(([chainId, account]) => {
                if (!account) return null;
                return (
                  <Card key={chainId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{chainId}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Connected</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnectChain(chainId)}
                            disabled={isDisconnecting}
                          >
                            <Unlink className="h-3 w-3 mr-1" />
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p className="text-sm font-mono mt-1">{account.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                        <p className="text-sm font-mono mt-1 break-all">{account.bech32Address}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Algorithm</p>
                        <Badge variant="outline" className="mt-1">{account.algo}</Badge>
                      </div>
                      {account.isNanoLedger && (
                        <Badge variant="secondary">Ledger Device</Badge>
                      )}
                    </CardContent>
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
            <CodeBlock
              code={`import { useAccount, useActiveChainIds, useActiveWalletType } from "graz";

// Multi-chain account query
const { data: accounts, isConnected } = useAccount({
  chainId: ["cosmoshub-4", "osmosis-1", "neutron-1"]
});

const activeChainIds = useActiveChainIds();
const walletType = useActiveWalletType();

// Access accounts by chain
const cosmosAccount = accounts["cosmoshub-4"];
const osmosisAccount = accounts["osmosis-1"];
const neutronAccount = accounts["neutron-1"];`}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
