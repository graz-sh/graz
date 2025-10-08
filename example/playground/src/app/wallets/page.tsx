"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useAccount, useActiveWalletType, useCheckWallet, useConnect, useDisconnect, useRecentChains } from "graz";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeBlock } from "@/components/code-block";
import { Wallet, CheckCircle2, XCircle, Zap, Clock, Unlink, ExternalLink } from "lucide-react";
import { chainIds } from "@/utils/graz";
import { WalletType } from "graz";
import { useState } from "react";
import { getWalletInfo } from "@/utils/wallet";

export default function WalletsPage() {
  const { isConnected, data: accounts } = useAccount();
  const walletInfo = useActiveWalletType();
  const { connect, isLoading: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const recentChains = useRecentChains();
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);

  // Check availability for popular wallets
  const { data: isKeplrAvailable } = useCheckWallet(WalletType.KEPLR);
  const { data: isLeapAvailable } = useCheckWallet(WalletType.LEAP);
  const { data: isCosmostationAvailable } = useCheckWallet(WalletType.COSMOSTATION);
  const { data: isCompassAvailable } = useCheckWallet(WalletType.COMPASS);
  const { data: isOkxAvailable } = useCheckWallet(WalletType.OKX);
  const { data: isCactusCosmosAvailable } = useCheckWallet(WalletType.CACTUSCOSMOS);
  const { data: isWalletConnectAvailable } = useCheckWallet(WalletType.WALLETCONNECT);
  const { data: isParaAvailable } = useCheckWallet(WalletType.PARA);

  const popularWallets = [
    { type: WalletType.KEPLR, available: isKeplrAvailable },
    { type: WalletType.LEAP, available: isLeapAvailable },
    { type: WalletType.COSMOSTATION, available: isCosmostationAvailable },
    { type: WalletType.COMPASS, available: isCompassAvailable },
    { type: WalletType.OKX, available: isOkxAvailable },
    { type: WalletType.CACTUSCOSMOS, available: isCactusCosmosAvailable },
    { type: WalletType.WALLETCONNECT, available: isWalletConnectAvailable },
    { type: WalletType.PARA, available: isParaAvailable },
  ];

  const handleConnectWallet = (walletType: WalletType) => {
    setSelectedWallet(walletType);
    connect({
      chainId: chainIds,
      walletType,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Wallet Management</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Explore wallet detection, connection management, and multi-wallet support using{" "}
            <code className="text-sm bg-muted px-1 py-0.5 rounded">useCheckWallet()</code> and{" "}
            <code className="text-sm bg-muted px-1 py-0.5 rounded">useActiveWalletType()</code>
          </p>
        </div>

        {isConnected && walletInfo.walletType && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {walletInfo.walletType && getWalletInfo(walletInfo.walletType).name}
                    </CardTitle>
                    <CardDescription>
                      Currently connected wallet
                      {walletInfo.walletType && getWalletInfo(walletInfo.walletType).website && (
                        <a
                          href={getWalletInfo(walletInfo.walletType).website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          Visit website
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" onClick={() => disconnect()} size="sm">
                  <Unlink className="h-4 w-4 mr-2" />
                  Disconnect All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Wallet Type</p>
                  <p className="font-mono text-sm font-medium">{walletInfo.walletType}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Connected Chains</p>
                  <p className="font-mono text-sm font-medium">{accounts ? Object.keys(accounts).length : 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Mobile</p>
                  <p className="font-mono text-sm font-medium">
                    {walletInfo.isKeplrMobile || walletInfo.isLeapMobile || walletInfo.isCosmostationMobile
                      ? "Yes"
                      : "No"}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-3">Wallet Type Flags</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(walletInfo)
                    .filter(([key]) => key.startsWith("is") && key !== "isConnected")
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                        {value ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs font-mono">{key.replace("is", "")}</span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {recentChains.data && recentChains.data.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <CardTitle>Recent Chains</CardTitle>
              </div>
              <CardDescription>Chains you&apos;ve recently connected to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recentChains.data?.map((chain) => (
                  <Badge key={chain.chainId} variant="secondary" className="font-mono">
                    {chain.chainName}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <CardTitle>Available Wallets</CardTitle>
            </div>
            <CardDescription>Detected wallets in your browser</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {popularWallets.map(({ type, available }) => {
                const info = getWalletInfo(type);
                const isCurrentWallet = isConnected && walletInfo.walletType === type;

                return (
                  <div
                    key={type}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCurrentWallet
                        ? "border-primary bg-primary/5"
                        : available
                          ? "border-border hover:border-primary/50"
                          : "border-border bg-muted/20"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {info.logo && <img src={info.logo} alt={info.name} className="h-8 w-8 rounded" />}
                          <h3 className="font-semibold flex items-center gap-2">
                            {info.name}
                            {isCurrentWallet && (
                              <Badge variant="default" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </h3>
                        </div>
                        {info.website && (
                          <a
                            href={info.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {available ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>

                    {isCurrentWallet ? (
                      <Button size="sm" variant="destructive" className="w-full mt-2" onClick={() => disconnect()}>
                        Disconnect
                      </Button>
                    ) : available ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => handleConnectWallet(type)}
                        disabled={isConnecting && selectedWallet === type}
                      >
                        {isConnecting && selectedWallet === type ? "Connecting..." : "Connect"}
                      </Button>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-2">Install {info.name} extension</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hook Usage</CardTitle>
            <CardDescription>Example code for this page</CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`import { useActiveWalletType, useCheckWallet, useConnect, useRecentChains } from "graz";
import { WalletType } from "graz";

// Get active wallet information
const walletInfo = useActiveWalletType();
console.log(walletInfo.walletType); // "keplr"
console.log(walletInfo.isKeplr); // true
console.log(walletInfo.isLeap); // false

// Check if specific wallet is available
const { data: isKeplrAvailable } = useCheckWallet(WalletType.KEPLR);
const { data: isLeapAvailable } = useCheckWallet(WalletType.LEAP);

// Get recent chains
const recentChains = useRecentChains();

// Connect with specific wallet
const { connect } = useConnect();
connect({
  chainId: ["cosmoshub-4"],
  walletType: WalletType.LEAP
});`}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
