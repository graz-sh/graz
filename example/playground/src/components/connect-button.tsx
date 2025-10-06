"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAvailableWallets, useAccount, useConnect, useDisconnect, WalletType } from "graz";
import { RefreshCw, Wallet } from "lucide-react";
import type { FC } from "react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { chainIds } from "@/utils/graz";
import { getWalletInfo } from "@/utils/wallet";

export const ConnectButton: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { isConnected, isConnecting, isReconnecting, reconnect } = useAccount({
    onConnect: ({ walletType, chains }) => {
      toast({
        title: "Wallet connected!",
        description: `Using ${walletType} to ${chains.map((item) => item.chainId).join(", ")}`,
      });
    },
    onDisconnect: () => {
      toast({
        title: "Wallet disconnected!",
        variant: "destructive",
      });
    },
  });

  const { connect } = useConnect();

  const { disconnect } = useDisconnect({
    onSuccess: () => console.log("wallet disconnected"),
  });

  const handleConnect = (wallet: WalletType) => {
    connect({ walletType: wallet, chainId: chainIds });
    setIsOpen(false);
  };

  const availableWallets = getAvailableWallets();
  const wallets = Object.entries(availableWallets)
    .filter(([_, isAvailable]) => isAvailable)
    .map(([walletType]) => walletType as WalletType);

  return (
    <>
      <div className="flex gap-1">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={isConnecting || isReconnecting}
              onClick={() => (isConnected ? disconnect() : setIsOpen(true))}
              className="gap-2"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isConnecting || isReconnecting ? "Connecting..." : isConnected ? "Disconnect" : "Connect Wallet"}
              </span>
              <span className="sm:hidden">
                {isConnecting || isReconnecting ? "..." : isConnected ? "Disconnect" : "Connect"}
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select a wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {wallets.map((walletType) => {
                const walletInfo = getWalletInfo(walletType);
                return (
                  <Button
                    key={walletType}
                    onClick={() => handleConnect(walletType)}
                    variant="outline"
                    className="w-full justify-start gap-3"
                  >
                    {walletInfo.logo && <img src={walletInfo.logo} alt={walletInfo.name} className="h-6 w-6 rounded" />}
                    <span>Connect with {walletInfo.name}</span>
                  </Button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
        {isConnected && (
          <Button size="icon" variant="outline" onClick={() => void reconnect()} className="hidden sm:flex">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  );
};
